import cron, { ScheduledTask } from "node-cron";
import { redisClient } from "../config/redis";
import db from "../config/db";
import moment from "moment-timezone";
import { LinkedInService } from "../services/LinkedInService";
import { FacebookPageService } from "../services/FacebookPageService";
import { cloudinaryService } from "../services";
import { InstagramBusinessService } from "../services/InstagramBusinessService";

interface ManualCronTaskData {
  taskId: string;
  cronExpression: string;
  timezone: string;
}

export class ManualSchedulerTaskManager {
  private static _instance: ManualSchedulerTaskManager;
  private taskRegistry = new Map<string, ScheduledTask>();
  private readonly CRON_TASKS_KEY = "scheduler-manual-cron-tasks";
  private linkedInService: LinkedInService = new LinkedInService();
  private facebookPageService = new FacebookPageService(cloudinaryService);
  private instagramBusinessService = new InstagramBusinessService(
    cloudinaryService
  );

  static get instance() {
    if (!this._instance) {
      this._instance = new ManualSchedulerTaskManager();
    }
    return this._instance;
  }

  private constructor() {}

  async add(schedulerManualPostingId: number): Promise<void> {
    console.log(
      `[ADD] Adding manual scheduler for posting ${schedulerManualPostingId}`
    );

    await this.remove(schedulerManualPostingId);

    const posting = await db.schedulerManualPosting.findUnique({
      where: { id: schedulerManualPostingId },
      select: {
        id: true,
        date: true,
        rootBusiness: {
          select: {
            id: true,
            socialLinkedIn: true,
          },
        },
        generatedImageContent: {
          select: {
            images: true,
            caption: true,
          },
        },
        platforms: true,
      },
    });

    if (!posting || !posting.date || !posting.rootBusiness) {
      console.warn(
        `[ADD] Posting ${schedulerManualPostingId} has invalid config`
      );
      return;
    }

    const timezone = moment.tz.guess(); // fallback jika tidak disimpan
    const dateInTZ = moment(posting.date).tz(timezone);

    const cronExpression = `${dateInTZ.minute()} ${dateInTZ.hour()} ${dateInTZ.date()} ${
      dateInTZ.month() + 1
    } *`;

    const taskId = schedulerManualPostingId.toString();

    const taskData: ManualCronTaskData = {
      taskId,
      cronExpression,
      timezone,
    };

    await redisClient.hset(
      this.CRON_TASKS_KEY,
      cronExpression,
      JSON.stringify([taskData])
    );

    if (!this.taskRegistry.has(cronExpression)) {
      const job = cron.schedule(
        cronExpression,
        () => this.executeTasks(cronExpression),
        { timezone }
      );
      this.taskRegistry.set(cronExpression, job);
    }

    console.log(
      `[ADD] Manual task ${schedulerManualPostingId} scheduled at ${cronExpression} (${timezone})`
    );
  }

  async remove(schedulerManualPostingId: number): Promise<void> {
    const all = await this.list();

    for (const [cronExpression, tasks] of Object.entries(all)) {
      const filtered = tasks.filter(
        (t) => t.taskId !== schedulerManualPostingId.toString()
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
      `[REMOVE] Removed task ${schedulerManualPostingId} from manual scheduler`
    );
  }

  async list(): Promise<Record<string, ManualCronTaskData[]>> {
    const raw = await redisClient.hgetall(this.CRON_TASKS_KEY);
    const result: Record<string, ManualCronTaskData[]> = {};
    for (const [cronExpression, value] of Object.entries(raw)) {
      result[cronExpression] = JSON.parse(value);
    }
    return result;
  }

  private async executeTasks(cronExpression: string) {
    const raw = await redisClient.hget(this.CRON_TASKS_KEY, cronExpression);
    const tasks: ManualCronTaskData[] = raw ? JSON.parse(raw) : [];
    const now = new Date();

    for (const task of tasks) {
      const id = parseInt(task.taskId, 10);

      try {
        console.log(
          `🚀 [manual-posting] Triggered at ${now.toISOString()} for task ${id}`
        );

        const posting = await db.schedulerManualPosting.findUnique({
          where: { id },
          select: {
            id: true,
            rootBusiness: {
              select: {
                id: true,
                name: true,
                socialLinkedIn: true,
                socialFacebookPage: true,
                socialInstagramBusiness: true,
              },
            },
            generatedImageContent: {
              select: {
                id: true,
                caption: true,
                images: true,
                _count: {
                  select: {
                    postedImageContents: true,
                  },
                },
              },
            },
            platforms: true,
          },
        });

        if (
          !posting ||
          !posting.rootBusiness ||
          !posting.generatedImageContent
        ) {
          console.warn(`[EXECUTE] Posting config invalid for task ${id}`);
          continue;
        }

        if (posting.generatedImageContent._count.postedImageContents > 0) {
          console.warn(`[EXECUTE] Posting ${id} already posted, skipping`);
          continue;
        }

        if (
          posting.platforms.includes("linked_in") &&
          posting.rootBusiness.socialLinkedIn
        ) {
          try {
            console.log(
              `Posting to LinkedIn for business ${posting.rootBusiness.name}`
            );

            await this.linkedInService.post(
              posting.rootBusiness.id,
              {
                caption: posting.generatedImageContent.caption,
                platforms: ["linked_in"],
                generatedImageContentId: posting.generatedImageContent.id,
              },
              posting.generatedImageContent.caption
            );
            console.log(
              `✅ Posted content ${posting.generatedImageContent.id} to LinkedIn for business ${posting.rootBusiness.name}`
            );
          } catch (error) {
            console.error(
              `[EXECUTE] Failed to post content ${posting.generatedImageContent.id} to LinkedIn:`,
              error
            );
            continue;
          }
        }

        if (
          posting.platforms.includes("facebook_page") &&
          posting.rootBusiness.socialFacebookPage
        ) {
          try {
            console.log(
              `Posting to Facebook Page for business ${posting.rootBusiness.name}`
            );

            await this.facebookPageService.post(
              posting.rootBusiness.id,
              {
                caption: posting.generatedImageContent.caption,
                platforms: ["facebook_page"],
                generatedImageContentId: posting.generatedImageContent.id,
              },
              posting.generatedImageContent.caption
            );
            console.log(
              `✅ Posted content ${posting.generatedImageContent.id} to Facebook Page for business ${posting.rootBusiness.name}`
            );
          } catch (error) {
            console.error(
              `[EXECUTE] Failed to post content ${posting.generatedImageContent.id} to Facebook Page:`,
              error
            );
            continue;
          }
        }

        if (
          posting.platforms.includes("instagram_business") &&
          posting.rootBusiness.socialInstagramBusiness
        ) {
          try {
            console.log(
              `Posting to Instagram Business for business ${posting.rootBusiness.name}`
            );

            await this.instagramBusinessService.post(
              posting.rootBusiness.id,
              {
                caption: posting.generatedImageContent.caption,
                platforms: ["instagram_business"],
                generatedImageContentId: posting.generatedImageContent.id,
              },
              posting.generatedImageContent.caption
            );
            console.log(
              `✅ Posted content ${posting.generatedImageContent.id} to Instagram Business for business ${posting.rootBusiness.name}`
            );
          } catch (error) {
            console.error(
              `[EXECUTE] Failed to post content ${posting.generatedImageContent.id} to Instagram Business:`,
              error
            );
            continue;
          }
        }
      } catch (error) {
        console.error(`[EXECUTE] Failed to post task ${id}:`, error);
      } finally {
        // Hapus task dari registry setelah eksekusi
        await this.remove(id);
      }
    }
  }

  async recoverOnStartup(): Promise<void> {
    console.log("[RECOVERY] Recovering manual scheduler tasks...");

    const allKeys = await redisClient.hkeys(this.CRON_TASKS_KEY);
    for (const key of allKeys) {
      await redisClient.hdel(this.CRON_TASKS_KEY, key);
    }
    this.taskRegistry.forEach((task) => task.stop());
    this.taskRegistry.clear();

    console.log("[RECOVERY] Flushed all Redis and in-memory manual task data");

    const postings = await db.schedulerManualPosting.findMany({
      where: {
        AND: {
          date: {
            gte: new Date(),
          },
        },
      },
      select: {
        id: true,
        date: true,
        generatedImageContent: {
          select: {
            _count: {
              select: {
                postedImageContents: true,
              },
            },
          },
        },
      },
    });

    const unpostedPostings = postings.filter(
      (p) => p.generatedImageContent._count.postedImageContents === 0
    );

    console.log(`[RECOVERY] Found ${postings.length} future manual postings`);
    console.log(
      `[RECOVERY] Found ${unpostedPostings.length} unposted postings`
    );
    const all: Record<string, ManualCronTaskData[]> = {};
    const timezone = moment.tz.guess(); // ganti jika Anda simpan timezone di DB

    for (const posting of unpostedPostings) {
      if (!posting.date) continue;

      const dateInTZ = moment(posting.date).tz(timezone);
      const cronExpr = `${dateInTZ.minute()} ${dateInTZ.hour()} ${dateInTZ.date()} ${
        dateInTZ.month() + 1
      } *`;
      const taskId = posting.id.toString();

      const taskData: ManualCronTaskData = {
        taskId,
        cronExpression: cronExpr,
        timezone,
      };

      if (!all[cronExpr]) all[cronExpr] = [];
      all[cronExpr].push(taskData);
    }

    for (const [cronExpression, tasks] of Object.entries(all)) {
      await redisClient.hset(
        this.CRON_TASKS_KEY,
        cronExpression,
        JSON.stringify(tasks)
      );

      const job = cron.schedule(
        cronExpression,
        () => this.executeTasks(cronExpression),
        { timezone: tasks[0].timezone || "UTC" }
      );
      this.taskRegistry.set(cronExpression, job);
    }

    console.log("[RECOVERY] Manual scheduler recovery complete.");
    console.log(
      `[RECOVERY] Redis task count: ${await redisClient.hlen(
        this.CRON_TASKS_KEY
      )}`
    );
    console.log(`[RECOVERY] Memory task count: ${this.taskRegistry.size}`);
  }
}
