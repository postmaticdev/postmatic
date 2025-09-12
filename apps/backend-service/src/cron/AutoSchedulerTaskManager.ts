import cron, { ScheduledTask } from "node-cron";
import { isValidCron } from "cron-validator";
import { redisClient } from "../config/redis";
import db from "../config/db";
import { LinkedInService } from "../services/LinkedInService";
import { FacebookPageService } from "../services/FacebookPageService";
import { InstagramBusinessService } from "../services/InstagramBusinessService";
import { cloudinaryService } from "../services";

interface AutoCronTaskData {
  taskId: string;
  cronExpression: string;
  timezone: string;
}

export class AutoSchedulerTaskManager {
  private static _instance: AutoSchedulerTaskManager;
  private taskRegistry = new Map<string, ScheduledTask>();
  private readonly CRON_TASKS_KEY = "scheduler-auto-cron-tasks";

  static get instance() {
    if (!this._instance) {
      this._instance = new AutoSchedulerTaskManager();
    }
    return this._instance;
  }

  private linkedIn: LinkedInService = new LinkedInService();
  private facebookPage: FacebookPageService = new FacebookPageService(
    cloudinaryService
  );
  private instagramBusiness: InstagramBusinessService =
    new InstagramBusinessService(cloudinaryService);

  private constructor() {}

  async add(rootBusinessId: string): Promise<void> {
    console.log(`[ADD] Adding auto scheduler for business ${rootBusinessId}`);
    await this.remove(rootBusinessId); // hapus task lama untuk bisnis ini

    const business = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        schedulerTimeZone: { select: { timezone: true } },
        schedulerAutoPreference: {
          where: { isAutoPosting: true },
          select: {
            isAutoPosting: true,
            schedulerAutoPostings: {
              where: { isActive: true },
              select: { day: true, times: true },
            },
          },
        },
      },
    });

    if (
      !business ||
      !business.schedulerTimeZone?.timezone ||
      !business.schedulerAutoPreference?.isAutoPosting ||
      !business.schedulerAutoPreference.schedulerAutoPostings.length
    ) {
      console.warn(
        `[ADD] Business ${rootBusinessId} has no valid auto scheduler config`
      );
      return;
    }

    const timezone = business.schedulerTimeZone.timezone;
    const autoPostings = business.schedulerAutoPreference.schedulerAutoPostings;

    const all: Record<string, AutoCronTaskData[]> = {};

    for (const posting of autoPostings) {
      for (const time of posting.times) {
        const cronExpr = this.getCronFromDayAndTime(posting.day, time);
        const taskId = `${rootBusinessId}@${posting.day}-${time}`;
        const data: AutoCronTaskData = {
          taskId,
          cronExpression: cronExpr,
          timezone,
        };

        if (!all[cronExpr]) all[cronExpr] = [];
        all[cronExpr].push(data);
      }
    }

    for (const [cronExpression, tasks] of Object.entries(all)) {
      if (!isValidCron(cronExpression)) {
        console.error(`[ADD] Invalid cron: ${cronExpression}`);
        continue;
      }

      const raw = await redisClient.hget(this.CRON_TASKS_KEY, cronExpression);
      const existing: AutoCronTaskData[] = raw ? JSON.parse(raw) : [];
      const combined = [...existing, ...tasks];

      await redisClient.hset(
        this.CRON_TASKS_KEY,
        cronExpression,
        JSON.stringify(combined)
      );

      if (!this.taskRegistry.has(cronExpression)) {
        const job = cron.schedule(
          cronExpression,
          () => this.executeTasks(cronExpression),
          {
            timezone: tasks[0].timezone || "UTC",
          }
        );
        this.taskRegistry.set(cronExpression, job);
      }
    }

    console.log(
      `[ADD] Added auto scheduler for business ${rootBusinessId} with ${
        Object.keys(all).length
      } tasks`
    );
  }

  async remove(rootBusinessId: string): Promise<void> {
    console.log(
      `[REMOVE] Removing auto scheduler tasks for business ${rootBusinessId}`
    );
    const all = await this.list();

    for (const [cronExpression, tasks] of Object.entries(all)) {
      const filtered = tasks.filter(
        (t) => !t.taskId.startsWith(`${rootBusinessId}@`)
      );

      if (filtered.length === 0) {
        this.taskRegistry.get(cronExpression)?.stop();
        this.taskRegistry.delete(cronExpression);
        await redisClient.hdel(this.CRON_TASKS_KEY, cronExpression);
      } else {
        await redisClient.hset(
          this.CRON_TASKS_KEY,
          cronExpression,
          JSON.stringify(filtered)
        );
      }
    }

    console.log(
      `[REMOVE] Removed all tasks for business ${rootBusinessId} from scheduler`
    );
  }

  async list(): Promise<Record<string, AutoCronTaskData[]>> {
    const raw = await redisClient.hgetall(this.CRON_TASKS_KEY);
    const result: Record<string, AutoCronTaskData[]> = {};
    for (const [cronExpression, value] of Object.entries(raw)) {
      result[cronExpression] = JSON.parse(value);
    }
    return result;
  }

  async recoverOnStartup() {
    console.log("[RECOVERY] Recovering auto scheduler tasks...");
    const allKeys = await redisClient.hkeys(this.CRON_TASKS_KEY);
    for (const key of allKeys) {
      await redisClient.hdel(this.CRON_TASKS_KEY, key);
    }
    console.log("[RECOVERY] Flushed all Redis data");

    const businesses = await db.rootBusiness.findMany({
      where: {
        schedulerTimeZone: { isNot: null },
        schedulerAutoPreference: { isAutoPosting: true },
      },
      select: {
        id: true,
        schedulerTimeZone: { select: { timezone: true } },
        schedulerAutoPreference: {
          select: {
            isAutoPosting: true,
            schedulerAutoPostings: {
              where: { isActive: true },
              select: { day: true, times: true },
            },
          },
        },
      },
    });

    console.log(
      `[RECOVERY] Found ${businesses.length} businesses with auto scheduler config`
    );

    const all: Record<string, AutoCronTaskData[]> = {};

    for (const business of businesses) {
      const timezone = business.schedulerTimeZone?.timezone || "UTC";
      const autoPostings =
        business.schedulerAutoPreference?.schedulerAutoPostings ?? [];

      for (const posting of autoPostings) {
        for (const time of posting.times) {
          const cronExpr = this.getCronFromDayAndTime(posting.day, time);
          const taskId = `${business.id}@${posting.day}-${time}`;
          const data: AutoCronTaskData = {
            taskId,
            cronExpression: cronExpr,
            timezone,
          };

          if (!all[cronExpr]) all[cronExpr] = [];
          all[cronExpr].push(data);
        }
      }
    }

    for (const [cronExpression, tasks] of Object.entries(all)) {
      if (!isValidCron(cronExpression)) continue;

      await redisClient.hset(
        this.CRON_TASKS_KEY,
        cronExpression,
        JSON.stringify(tasks)
      );
      const job = cron.schedule(
        cronExpression,
        () => this.executeTasks(cronExpression),
        {
          timezone: tasks[0].timezone || "UTC",
        }
      );
      this.taskRegistry.set(cronExpression, job);
    }

    console.log("[RECOVERY] Recovery complete.");

    const redisTaskLen = await redisClient.hlen(this.CRON_TASKS_KEY);
    console.log(`[RECOVERY] Total tasks in Redis: ${redisTaskLen}`);
    console.log(`[RECOVERY] Total tasks in memory: ${this.taskRegistry.size}`);
  }

  private async executeTasks(cronExpression: string) {
    const raw = await redisClient.hget(this.CRON_TASKS_KEY, cronExpression);
    const tasks: AutoCronTaskData[] = raw ? JSON.parse(raw) : [];
    const now = new Date();

    for (const task of tasks) {
      try {
        console.log(`🚀 [auto-posting] task triggered at ${now.toISOString()}`);
        console.log(`- taskId: ${task.taskId}, cron: ${task.cronExpression}`);

        const [rootBusinessId, daytime] = task.taskId.split("@");
        const [day, time] = daytime.split("-");

        const business = await db.rootBusiness.findUnique({
          where: { id: rootBusinessId },
          select: {
            name: true,
            generatedImageContents: {
              where: {
                AND: [
                  {
                    readyToPost: true,
                  },
                  {
                    deletedAt: null,
                  },
                ],
              },
              include: {
                schedulerManualPostings: {
                  select: {
                    id: true,
                  },
                },
                _count: {
                  select: {
                    postedImageContents: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
            socialLinkedIn: true,
            socialFacebookPage: true,
            socialInstagramBusiness: true,
          },
        });
        if (!business) {
          console.warn(`Business ${rootBusinessId} not found`);
          await this.remove(rootBusinessId);
          continue;
        }

        if (!business.generatedImageContents.length) {
          console.warn(
            `No ready-to-post content for business ${rootBusinessId}`
          );
          await this.remove(rootBusinessId);
          continue;
        }

        const unpostedContents = business.generatedImageContents.filter(
          (content) =>
            content._count.postedImageContents === 0 &&
            !content.schedulerManualPostings
        );

        if (!unpostedContents.length) {
          console.warn(`No unposted content for business ${rootBusinessId}`);
          await this.remove(rootBusinessId);
          continue;
        }

        const content = unpostedContents[0];

        if (business.socialLinkedIn) {
          console.log(
            `🚀 [${rootBusinessId}] Posting content ${content.id} to LinkedIn at ${day} ${time}`
          );

          try {
            const posting = await this.linkedIn.post(
              rootBusinessId,
              {
                caption: content.caption,
                generatedImageContentId: content.id,
                platforms: ["linked_in"],
              },
              content.caption
            );
            console.log(
              `🚀 [${rootBusinessId}] Posted content ${content.id} to LinkedIn at ${day} ${time}`
            );
          } catch (error) {
            console.error(
              `Failed to post content ${content.id} to LinkedIn:`,
              error
            );
          }
        }
        if (business.socialFacebookPage) {
          console.log(
            `🚀 [${rootBusinessId}] Posting content ${content.id} to Facebook Page at ${day} ${time}`
          );

          try {
            const posting = await this.facebookPage.post(
              rootBusinessId,
              {
                caption: content.caption,
                generatedImageContentId: content.id,
                platforms: ["facebook_page"],
              },
              content.caption
            );
            console.log(
              `🚀 [${rootBusinessId}] Posted content ${content.id} to Facebook Page at ${day} ${time}`
            );
          } catch (error) {
            console.error(
              `Failed to post content ${content.id} to Facebook Page:`,
              error
            );
          }
        }
        if (business.socialInstagramBusiness) {
          console.log(
            `🚀 [${rootBusinessId}] Posting content ${content.id} to Instagram Business at ${day} ${time}`
          );

          try {
            const posting = await this.instagramBusiness.post(
              rootBusinessId,
              {
                caption: content.caption,
                generatedImageContentId: content.id,
                platforms: ["instagram_business"],
              },
              content.caption
            );
            console.log(
              `🚀 [${rootBusinessId}] Posted content ${content.id} to Instagram Business at ${day} ${time}`
            );
          } catch (error) {
            console.error(
              `Failed to post content ${content.id} to Instagram Business:`,
              error
            );
          }
        }
      } catch (error) {
        console.error(
          `Failed to execute task for cron expression ${cronExpression}:`,
          error
        );
      }
    }
  }

  private getCronFromDayAndTime(day: string, time: string): string {
    const [hour, minute] = time.split(":");
    const dayMap: Record<string, number> = {
      Minggu: 0,
      Senin: 1,
      Selasa: 2,
      Rabu: 3,
      Kamis: 4,
      Jumat: 5,
      Sabtu: 6,
    };
    const dayIndex = dayMap[day];
    return `${minute} ${hour} * * ${dayIndex}`;
  }
}
