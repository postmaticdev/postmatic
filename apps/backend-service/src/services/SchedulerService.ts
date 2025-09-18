import { BaseService } from "./BaseService";
import db from "../config/db";
import {
  AutoSchedulerDTO,
  ManualParamsDTO,
  ManualSchedulerDTO,
  TimeZoneDTO,
} from "../validators/SchedulerValidator";
import { SchedulerManualPosting } from ".prisma/client";
import { LinkedInService } from "./LinkedInService";
import moment from "moment-timezone";
import { AutoSchedulerTaskManager } from "../cron/AutoSchedulerTaskManager";
import { ManualSchedulerTaskManager } from "../cron/ManualSchedulerTaskManager";
import { FacebookPageService } from "./FacebookPageService";
import { InstagramBusinessService } from "./InstagramBusinessService";
import { PlatformKnowledgeService } from "./PlatformKnowledgeService";
import { stringManipulation } from "../helper/string-manipulation";
import { Prisma } from ".prisma/client";
import { SchedulerAutoPostingTime } from "@prisma/client";
interface SchedulerServiceDependencies {
  platformService: PlatformKnowledgeService;
  platformDeps: {
    socialLinkedIn: LinkedInService;
    socialFacebookPage: FacebookPageService;
    socialInstagramBusiness: InstagramBusinessService;
  };
}

export class SchedulerService extends BaseService {
  private days = [
    {
      name: "Minggu",
      value: 0,
    },
    {
      name: "Senin",
      value: 1,
    },
    {
      name: "Selasa",
      value: 2,
    },
    {
      name: "Rabu",
      value: 3,
    },
    {
      name: "Kamis",
      value: 4,
    },
    {
      name: "Jumat",
      value: 5,
    },
    {
      name: "Sabtu",
      value: 6,
    },
  ];

  constructor(private deps: SchedulerServiceDependencies) {
    super();
  }

  async getAutoPostingSchedule(rootBusinessId: string) {
    try {
      let schedule = await db.schedulerAutoPreference.findUnique({
        where: { rootBusinessId: rootBusinessId },
        include: {
          schedulerAutoPostings: {
            include: {
              schedulerAutoPostingTimes: true,
            },
          },
        },
      });
      if (!schedule) {
        schedule = await db.schedulerAutoPreference.create({
          data: {
            rootBusinessId: rootBusinessId,
            isAutoPosting: false,
          },
          include: {
            schedulerAutoPostings: {
              include: {
                schedulerAutoPostingTimes: true,
              },
            },
          },
        });
      }
      const returnData = {
        ...schedule,
        schedulerAutoPostings: this.days.map((day) => {
          const find = schedule?.schedulerAutoPostings?.find(
            (autoPosting) => day.name === autoPosting.day
          );
          if (find) {
            return {
              dayId: day.value,
              day: day.name,
              isActive: find.isActive,
              schedulerAutoPostingTimes: find.schedulerAutoPostingTimes,
            };
          }
          return {
            dayId: day.value,
            day: day.name,
            isActive: false,
            schedulerAutoPostingTimes: [],
          };
        }),
      };
      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.getAutoPostingSchedule", err);
    }
  }

  async upsertAutoPostingSchedule(
    data: AutoSchedulerDTO,
    rootBusinessId: string
  ) {
    try {
      const { isAutoPosting, schedulerAutoPostings } = data;
      const platforms = schedulerAutoPostings.flatMap((autoPosting) =>
        autoPosting.schedulerAutoPostingTimes.flatMap((time) => time.platforms)
      );
      const uniquePlatforms = [...new Set(platforms)];

      const [tz] = await Promise.all([
        db.schedulerTimeZone.findUnique({
          where: { rootBusinessId },
          select: {
            timezone: true,
            rootBusiness: {
              select: {
                socialFacebookPage: true,
                socialInstagramBusiness: true,
                socialLinkedIn: true,
              },
            },
          },
        }),
      ]);

      for (const platform of uniquePlatforms) {
        const connectedPlatform =
          stringManipulation.transformPlatform(platform);
        if (tz?.rootBusiness?.[connectedPlatform]) {
          continue;
        }
        return `${stringManipulation.snakeToReadable(
          platform
        )} belum terhubung.`;
      }

      await db.schedulerAutoPosting.deleteMany({
        where: {
          rootBusinessId: rootBusinessId,
        },
      });
      if (!tz?.timezone) {
        await db.schedulerTimeZone.create({
          data: {
            timezone: "Asia/Jakarta",
            rootBusinessId,
          },
        });
      }

      const mappedSchedulerAutoPostings = schedulerAutoPostings.map(
        (autoPosting) => {
          return {
            day: autoPosting.day,
            isActive: autoPosting.isActive,
            rootBusinessId: rootBusinessId,
          };
        }
      );

      const mappedSchedulerAutoPostingTimes = (
        schedulerAutoPostingId: number,
        schedulerAutoPostingTimes: SchedulerAutoPostingTime[]
      ): Prisma.SchedulerAutoPostingTimeCreateManyInput[] =>
        schedulerAutoPostingTimes.map((time) => {
          return {
            hhmm: time.hhmm,
            platforms: time.platforms,
            schedulerAutoPostingId: schedulerAutoPostingId,
          };
        });

      const schedule = await db.schedulerAutoPreference.upsert({
        where: { rootBusinessId: rootBusinessId },
        update: {
          isAutoPosting: isAutoPosting,
          schedulerAutoPostings: {
            createMany: {
              data: mappedSchedulerAutoPostings,
            },
          },
        },
        create: {
          rootBusinessId: rootBusinessId,
          isAutoPosting: isAutoPosting,
          schedulerAutoPostings: {
            createMany: {
              data: mappedSchedulerAutoPostings,
            },
          },
        },
        include: {
          schedulerAutoPostings: {
            include: {
              schedulerAutoPostingTimes: true,
            },
          },
        },
      });
      for (const item of data.schedulerAutoPostings) {
        for (const time of item.schedulerAutoPostingTimes) {
          const find = schedule.schedulerAutoPostings.find(
            (autoPosting) => autoPosting.day === item.day
          );
          if (find) {
            const create = await db.schedulerAutoPostingTime.create({
              data: {
                hhmm: time.hhmm,
                platforms: time.platforms,
                schedulerAutoPostingId: find.id,
              },
            });
            find.schedulerAutoPostingTimes.push(create);
          }
        }
      }

      const returnData = {
        ...schedule,
        schedulerAutoPostings: this.days.map((day) => {
          const find = schedule?.schedulerAutoPostings?.find(
            (autoPosting) => day.name === autoPosting.day
          );
          if (find) {
            return {
              dayId: day.value,
              day: day.name,
              isActive: find.isActive,
              schedulerAutoPostingTimes: find.schedulerAutoPostingTimes,
            };
          }
          return {
            dayId: day.value,
            day: day.name,
            isActive: false,
            schedulerAutoPostingTimes: [],
          };
        }),
      };

      // [CRON] Add or update cron tasks
      if (!isAutoPosting) {
        await AutoSchedulerTaskManager.instance.remove(rootBusinessId);
      } else {
        await AutoSchedulerTaskManager.instance.add(rootBusinessId);
      }

      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.upsertAutoPostingSchedule", err);
    }
  }

  async getAllQueuePosts(rootBusinessId: string) {
    try {
      const data = await db.schedulerManualPosting.findMany({
        where: { rootBusinessId: rootBusinessId },
        include: {
          generatedImageContent: true,
        },
      });
      const returnData: QueuePost[] = [];
      for (const post of data) {
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = `0${date.getMonth() + 1}`.slice(-2);
        const day = `0${date.getDate()}`.slice(-2);
        const key = `${year}-${month}-${day}`;
        const find = returnData.find(
          (queuePost) => queuePost.date.toString() === key
        );
        if (find) {
          find.posts.push(post);
        } else {
          returnData.push({
            date: key,
            posts: [post],
          });
        }
      }
      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.getAllQueuePosts", err);
    }
  }

  async addToQueue(data: ManualSchedulerDTO, rootBusinessId: string) {
    try {
      const { unavailablePlatforms, availablePlatforms } =
        await this.deps.platformService.getPlatforms();
      if (
        data.platforms.some((platform) =>
          unavailablePlatforms.some((p) => p.platform === platform)
        )
      ) {
        return `${data.platforms
          .filter((platform) =>
            unavailablePlatforms.some((p) => p.platform === platform)
          )
          .join(", ")} saat ini tidak didukung. Silakan coba lagi nanti.`;
      }
      const now = new Date();
      if (data.dateTime < now) return "Tanggal harus di masa depan";

      for (const platform of availablePlatforms) {
        if (data.platforms.includes(platform.platform)) {
          const check = await this.deps.platformDeps[
            stringManipulation.transformPlatform(platform.platform)
          ].checkSocial(rootBusinessId);
          if (typeof check === "string") return check;
        }
      }

      const checkGen = await db.generatedImageContent.findUnique({
        where: { id: data.generatedImageContentId },
        select: {
          deletedAt: true,
          rootBusinessId: true,
          _count: { select: { postedImageContents: true } },
          schedulerManualPostings: {
            select: {
              id: true,
              generatedImageContentId: true,
            },
          },
        },
      });
      if (!checkGen) return "Konten tidak ditemukan";
      if (checkGen.rootBusinessId !== rootBusinessId)
        return "Konten tidak termasuk bisnis ini";
      if (checkGen?.deletedAt) return "Konten telah dihapus";
      if (checkGen?._count?.postedImageContents > 0)
        return "Konten telah diposting";
      if (
        checkGen.schedulerManualPostings?.generatedImageContentId ===
        data.generatedImageContentId
      )
        return "Konten telah dijadwalkan";
      if (checkGen?.schedulerManualPostings?.id)
        return "Konten telah dijadwalkan";

      const returnData = await db.schedulerManualPosting.create({
        data: {
          date: data.dateTime,
          generatedImageContentId: data.generatedImageContentId,
          rootBusinessId: rootBusinessId,
          platforms: data.platforms,
        },
      });

      await db.generatedImageContent.update({
        where: { id: data.generatedImageContentId },
        data: {
          caption: data.caption,
        },
      });

      await ManualSchedulerTaskManager.instance.add(returnData.id);
      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.addToQueue", err);
    }
  }

  async editFromQueue(
    data: ManualSchedulerDTO,
    rootBusinessId: string,
    schedulerManualPostingId: number
  ) {
    try {
      const check = await db.schedulerManualPosting.findUnique({
        where: { id: schedulerManualPostingId },
        select: { rootBusinessId: true },
      });
      if (!check) return null;
      if (check.rootBusinessId !== rootBusinessId) return null;
      const { unavailablePlatforms, availablePlatforms } =
        await this.deps.platformService.getPlatforms();
      if (
        data.platforms.some((platform) =>
          unavailablePlatforms.some((p) => p.platform === platform)
        )
      ) {
        return `${data.platforms
          .filter((platform) =>
            unavailablePlatforms.some((p) => p.platform === platform)
          )
          .join(", ")} saat ini tidak didukung. Silakan coba lagi nanti.`;
      }
      const now = new Date();
      if (data.dateTime < now) return "Tanggal harus di masa depan";

      for (const platform of availablePlatforms) {
        if (data.platforms.includes(platform.platform)) {
          const check = await this.deps.platformDeps[
            stringManipulation.transformPlatform(platform.platform)
          ].checkSocial(rootBusinessId);
          if (typeof check === "string") return check;
        }
      }

      const checkGen = await db.generatedImageContent.findUnique({
        where: { id: data.generatedImageContentId },
        select: {
          deletedAt: true,
          rootBusinessId: true,
          _count: { select: { postedImageContents: true } },
          schedulerManualPostings: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!checkGen) return "Konten tidak ditemukan";
      if (checkGen.rootBusinessId !== rootBusinessId)
        return "Konten tidak termasuk bisnis ini";
      if (checkGen?.deletedAt) return "Konten telah dihapus";
      if (checkGen?._count?.postedImageContents > 0)
        return "Konten telah diposting";

      const returnData = await db.schedulerManualPosting.update({
        where: { id: schedulerManualPostingId },
        data: {
          date: data.dateTime,
          generatedImageContentId: data.generatedImageContentId,
          rootBusinessId: rootBusinessId,
          platforms: data.platforms,
        },
      });

      await db.generatedImageContent.update({
        where: { id: data.generatedImageContentId },
        data: {
          caption: data.caption,
        },
      });

      await ManualSchedulerTaskManager.instance.add(returnData.id);
      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.addToQueue", err);
    }
  }

  async deleteFromQueue(data: ManualParamsDTO) {
    try {
      const now = new Date();
      const check = await db.schedulerManualPosting.findUnique({
        where: { id: data.schedulerManualPostingId },
        select: { rootBusinessId: true, date: true },
      });
      if (!check) return null;
      if (check.rootBusinessId !== data.rootBusinessId) return null;
      if (new Date(check.date) < now)
        return "Draft sudah dijadwalkan dan telah diposting";

      const returnData = await db.schedulerManualPosting.delete({
        where: { id: data.schedulerManualPostingId },
      });
      await ManualSchedulerTaskManager.instance.remove(
        data.schedulerManualPostingId
      );
      return returnData;
    } catch (err) {
      this.handleError("SchedulerService.deleteFromQueue", err);
    }
  }

  async getTimezone(rootBusinessId: string) {
    try {
      let timezone = await db.schedulerTimeZone.findUnique({
        where: { rootBusinessId: rootBusinessId },
      });
      if (!timezone) {
        timezone = await db.schedulerTimeZone.create({
          data: {
            rootBusinessId: rootBusinessId,
            timezone: "Asia/Jakarta",
          },
        });
      }

      const offset = moment.tz(timezone.timezone).format("Z");

      return {
        rootBusinessId: timezone.rootBusinessId,
        timezone: timezone.timezone,
        offset: offset,
      };
    } catch (err) {
      this.handleError("SchedulerService.getTimezone", err);
    }
  }

  async upsertTimezone(data: TimeZoneDTO, rootBusinessId: string) {
    try {
      const [timezone, manualPostIds] = await Promise.all([
        db.schedulerTimeZone.upsert({
          where: { rootBusinessId: rootBusinessId },
          update: {
            timezone: data.timezone,
          },
          create: {
            rootBusinessId: rootBusinessId,
            timezone: data.timezone,
          },
        }),
        db.schedulerManualPosting.findMany({
          where: {
            AND: [
              {
                rootBusinessId,
              },
              {
                date: {
                  gte: new Date(),
                },
              },
            ],
          },
          select: {
            id: true,
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
        }),
      ]);

      const offset = moment.tz(timezone.timezone).format("Z");

      const unpostedIds = manualPostIds
        .filter(
          (item) =>
            item?.generatedImageContent?._count?.postedImageContents === 0
        )
        .map((item) => item.id);
      // [CRON] Add or update cron tasks
      for (const id of unpostedIds) {
        await ManualSchedulerTaskManager.instance.add(id);
      }
      await AutoSchedulerTaskManager.instance.add(rootBusinessId);

      return {
        rootBusinessId: timezone.rootBusinessId,
        timezone: timezone.timezone,
        offset: offset,
      };
    } catch (err) {
      this.handleError("SchedulerService.upsertTimezone", err);
    }
  }
}

interface QueuePost {
  date: string;
  posts: SchedulerManualPosting[];
}
