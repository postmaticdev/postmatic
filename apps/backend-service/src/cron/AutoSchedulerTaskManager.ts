import cron, { ScheduledTask } from "node-cron";
import { isValidCron } from "cron-validator";
import { redisClient } from "../config/redis";
import db from "../config/db";
import { LinkedInService } from "../services/LinkedInService";
import { FacebookPageService } from "../services/FacebookPageService";
import { InstagramBusinessService } from "../services/InstagramBusinessService";
import { cloudinaryService } from "../services";
import type { SocialPlatform } from "@prisma/client";

interface AutoCronTaskData {
  taskId: string; // format: "<rootBusinessId>@<day>-<HH:MM>"
  cronExpression: string;
  timezone: string;
  platforms: SocialPlatform[]; // platform yang aktif untuk slot waktu itu
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

  // ===== Helpers =====
  private getCronFromDayAndTime(day: string, hhmm: string): string {
    const [hour, minute] = hhmm.split(":");
    const dayMap: Record<string, number> = this.dayMap;
    const dow = dayMap[day];
    return `${minute} ${hour} * * ${dow}`;
  }

  // ===== Helpers tanggal berbasis timezone =====
  private getNowPartsInTZ(tz: string) {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = Object.fromEntries(
      fmt.formatToParts(now).map((p) => [p.type, p.value])
    );
    const wkMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return {
      y: Number(parts.year),
      m: Number(parts.month),
      d: Number(parts.day),
      dow: wkMap[parts.weekday as keyof typeof wkMap],
      hh: Number(parts.hour),
      mm: Number(parts.minute),
    };
  }

  private addDaysUTCParts(
    { y, m, d }: { y: number; m: number; d: number },
    add: number
  ) {
    const base = new Date(Date.UTC(y, m - 1, d));
    base.setUTCDate(base.getUTCDate() + add);
    return {
      y: base.getUTCFullYear(),
      m: base.getUTCMonth() + 1,
      d: base.getUTCDate(),
    };
  }

  private fmtDatePartsYYYYMMDD({
    y,
    m,
    d,
  }: {
    y: number;
    m: number;
    d: number;
  }) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(d)}`;
  }

  private dayMap: Record<string, number> = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
  };

  private getDayCodeLabel(day: string) {
    const code = this.dayMap[day] ?? "?";
    return `${day} (${code})`;
  }

  private truncateCaption(s: string | null | undefined, max = 48) {
    if (!s) return "";
    return s.length <= max ? s : s.slice(0, max - 1) + "…";
  }

  /** platform yang tersambung di bisnis (connection) */
  private getConnectedPlatforms(b: {
    socialLinkedIn: { id: string } | null;
    socialFacebookPage: { id: string } | null;
    socialInstagramBusiness: { id: string } | null;
  }): SocialPlatform[] {
    const res: SocialPlatform[] = [];
    if (b.socialLinkedIn) res.push("linked_in");
    if (b.socialFacebookPage) res.push("facebook_page");
    if (b.socialInstagramBusiness) res.push("instagram_business");
    return res;
  }

  private intersect<T>(a: T[], b: T[]): T[] {
    const set = new Set(b);
    return a.filter((x) => set.has(x));
  }

  // ===== API =====
  async add(rootBusinessId: string): Promise<void> {
    console.log(`[ADD] Adding auto scheduler for business ${rootBusinessId}`);
    await this.remove(rootBusinessId); // bersihkan task lama untuk bisnis ini

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
              select: {
                day: true,
                schedulerAutoPostingTimes: {
                  select: { hhmm: true, platforms: true }, // <= schema baru
                },
              },
            },
          },
        },
        // ambil connections untuk double check
        socialLinkedIn: { select: { id: true } },
        socialFacebookPage: { select: { id: true } },
        socialInstagramBusiness: { select: { id: true } },
      },
    });

    const tz = business?.schedulerTimeZone?.timezone;
    const pref = business?.schedulerAutoPreference;

    if (
      !business ||
      !tz ||
      !pref?.isAutoPosting ||
      !pref.schedulerAutoPostings.length
    ) {
      console.warn(
        `[ADD] Business ${rootBusinessId} has no valid auto scheduler config`
      );
      return;
    }

    const connected = this.getConnectedPlatforms(business);
    const all: Record<string, AutoCronTaskData[]> = {};
    const previewRows: Array<{
      businessId: string;
      day: string;
      hhmm: string;
      cron: string;
      timezone: string;
      platforms: string;
    }> = [];

    for (const posting of pref.schedulerAutoPostings) {
      for (const t of posting.schedulerAutoPostingTimes) {
        // platform final = preferensi time ∩ connected
        const effectivePlatforms = this.intersect<SocialPlatform>(
          t.platforms,
          connected
        );
        if (effectivePlatforms.length === 0) {
          console.warn(
            `[ADD] Skip ${rootBusinessId} ${posting.day} ${t.hhmm} — no connected platforms for selected preferences`
          );
          continue;
        }

        const cronExpr = this.getCronFromDayAndTime(posting.day, t.hhmm);
        const taskId = `${rootBusinessId}@${posting.day}-${t.hhmm}`;
        const data: AutoCronTaskData = {
          taskId,
          cronExpression: cronExpr,
          timezone: tz,
          platforms: effectivePlatforms,
        };

        if (!all[cronExpr]) all[cronExpr] = [];
        all[cronExpr].push(data);

        previewRows.push({
          businessId: rootBusinessId,
          day: posting.day,
          hhmm: t.hhmm,
          cron: cronExpr,
          timezone: tz,
          platforms: effectivePlatforms.join(", "),
        });
      }
    }

    // Simpan & daftarkan job per cron expression
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
            timezone: tasks[0].timezone || "Asia/Jakarta",
          }
        );
        this.taskRegistry.set(cronExpression, job);
      }
    }

    console.log(
      `[ADD] Added auto scheduler for business ${rootBusinessId} with ${previewRows.length} time slot(s)`
    );
    if (previewRows.length) {
      console.log(`[ADD] Preview tasks for ${rootBusinessId}:`);
      console.table(previewRows);
    }
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
    // Flush Redis (DB = source of truth)
    const allKeys = await redisClient.hkeys(this.CRON_TASKS_KEY);
    for (const key of allKeys) {
      await redisClient.hdel(this.CRON_TASKS_KEY, key);
    }
    console.log("[RECOVERY] Flushed all Redis data");

    const businesses = await db.rootBusiness.findMany({
      where: { schedulerAutoPreference: { isAutoPosting: true } },
      select: {
        id: true,
        name: true,
        schedulerTimeZone: { select: { timezone: true } },
        schedulerAutoPreference: {
          select: {
            isAutoPosting: true,
            schedulerAutoPostings: {
              where: { isActive: true },
              select: {
                day: true,
                schedulerAutoPostingTimes: {
                  select: { hhmm: true, platforms: true },
                },
              },
            },
          },
        },
        socialLinkedIn: { select: { id: true } },
        socialFacebookPage: { select: { id: true } },
        socialInstagramBusiness: { select: { id: true } },
        // ambil konten untuk preview "post yang akan dipost"
        generatedImageContents: {
          where: { AND: [{ readyToPost: true }, { deletedAt: null }] },
          include: {
            schedulerManualPostings: { select: { id: true } },
            _count: { select: { postedImageContents: true } },
          },
          orderBy: { createdAt: "asc" },
          take: 10, // cukup untuk preview
        },
      },
    });

    console.log(
      `[RECOVERY] Found ${businesses.length} businesses with auto scheduler config`
    );

    const all: Record<string, AutoCronTaskData[]> = {};

    for (const b of businesses) {
      const tz = b.schedulerTimeZone?.timezone || "Asia/Jakarta";
      const connected = this.getConnectedPlatforms(b);
      const postings = b.schedulerAutoPreference?.schedulerAutoPostings ?? [];

      // ===== 1) Build & register cron tasks + kumpulkan row untuk tabel jadwal
      const scheduleRows: Array<{
        "Hari (kode hari)": string;
        "Waktu (platforms)": string;
      }> = [];
      type Slot = {
        day: string;
        hhmm: string;
        platforms: SocialPlatform[];
        cron: string;
      };
      const slots: Slot[] = [];

      for (const posting of postings) {
        for (const t of posting.schedulerAutoPostingTimes) {
          const effectivePlatforms = this.intersect<SocialPlatform>(
            t.platforms,
            connected
          );
          if (!effectivePlatforms.length) continue;

          const cronExpr = this.getCronFromDayAndTime(posting.day, t.hhmm);
          if (!isValidCron(cronExpr)) continue;

          const data: AutoCronTaskData = {
            taskId: `${b.id}@${posting.day}-${t.hhmm}`,
            cronExpression: cronExpr,
            timezone: tz,
            platforms: effectivePlatforms,
          };

          if (!all[cronExpr]) all[cronExpr] = [];
          all[cronExpr].push(data);

          slots.push({
            day: posting.day,
            hhmm: t.hhmm,
            platforms: effectivePlatforms,
            cron: cronExpr,
          });
          scheduleRows.push({
            "Hari (kode hari)": this.getDayCodeLabel(posting.day),
            "Waktu (platforms)": `${t.hhmm} (${effectivePlatforms.join(", ")})`,
          });
        }
      }

      // ===== 2) Preview konten yang akan dipost sesuai rules =====
      // kandidat konten: readyToPost, belum pernah dipost, dan tidak punya manual schedule
      const unpostedContents = (b.generatedImageContents ?? []).filter(
        (c) => c._count.postedImageContents === 0 && !c.schedulerManualPostings
      );

      // Siapkan tabel preview
      const postsPreviewRows: Array<{
        "Post (id)": string;
        Tanggal: string;
        Waktu: string;
        Platforms: string;
      }> = [];

      // Kalau tidak ada slot aktif, tidak ada preview
      if (slots.length && unpostedContents.length) {
        // Urutkan slot biar deterministik
        const sortedSlots = [...slots].sort((a, z) =>
          (a.day + a.hhmm).localeCompare(z.day + z.hhmm)
        );

        // Parts "hari ini" di timezone bisnis
        const nowTz = this.getNowPartsInTZ(tz);

        // Helper hitung occurrence pertama per slot (tanggal di TZ)
        const dayNameToIdx: Record<string, number> = this.dayMap; // Minggu..Sabtu -> 0..6
        function cmpHHMM(a: string, b: string) {
          const [ah, am] = a.split(":").map(Number);
          const [bh, bm] = b.split(":").map(Number);
          if (ah !== bh) return ah - bh;
          return am - bm;
        }

        const firstDatesPerSlot = sortedSlots.map((s) => {
          const targetDow = dayNameToIdx[s.day]; // 0..6
          let delta = (targetDow - nowTz.dow + 7) % 7;
          // jika hari yang sama tapi waktu sudah lewat di TZ, majukan 7 hari
          if (
            delta === 0 &&
            cmpHHMM(
              nowTz.hh.toString().padStart(2, "0") +
                ":" +
                nowTz.mm.toString().padStart(2, "0"),
              s.hhmm
            ) >= 0
          ) {
            delta = 7;
          }
          const first = this.addDaysUTCParts(
            { y: nowTz.y, m: nowTz.m, d: nowTz.d },
            delta
          );
          return first; // {y,m,d} (civil date untuk TZ tsb)
        });

        // Banyak baris = sebanyak konten siap post (round-robin slot, weekly increment)
        for (let i = 0; i < unpostedContents.length; i++) {
          const s = sortedSlots[i % sortedSlots.length];
          const occIndex = Math.floor(i / sortedSlots.length); // ke-n kalinya slot itu → +7 hari * n
          const first = firstDatesPerSlot[i % firstDatesPerSlot.length];
          const dateParts = this.addDaysUTCParts(first, 7 * occIndex);
          const tanggal = this.fmtDatePartsYYYYMMDD(dateParts);

          const pick = unpostedContents[i]; // ambil konten berbeda per baris
          postsPreviewRows.push({
            "Post (id)": `${this.truncateCaption(pick.caption)} (${pick.id})`,
            Tanggal: tanggal,
            Waktu: `${s.day} ${s.hhmm}`,
            Platforms: s.platforms.join(", "),
          });
        }
      }

      // ===== 3) Cetak per bisnis
      console.log(`\n=== ${b.name ?? "Tanpa Nama"} (${b.id}) ===`);
      if (scheduleRows.length) {
        console.log("[RECOVERY] Jadwal aktif:");
        console.table(scheduleRows);
      } else {
        console.log(
          "[RECOVERY] Tidak ada jadwal aktif yang lolos pengecekan koneksi/platform."
        );
      }

      if (postsPreviewRows.length) {
        console.log(
          "[RECOVERY] Preview posting yang akan dieksekusi (berdasarkan urutan slot):"
        );
        console.table(postsPreviewRows);
      } else {
        console.log(
          "[RECOVERY] Tidak ada konten siap post (readyToPost=true & belum pernah dipost & bukan manual)."
        );
      }
    }

    // ===== 4) Simpan ke Redis & daftarkan cron jobs
    for (const [cronExpression, tasks] of Object.entries(all)) {
      await redisClient.hset(
        this.CRON_TASKS_KEY,
        cronExpression,
        JSON.stringify(tasks)
      );
      const job = cron.schedule(
        cronExpression,
        () => this.executeTasks(cronExpression),
        {
          timezone: tasks[0].timezone || "Asia/Jakarta",
        }
      );
      this.taskRegistry.set(cronExpression, job);
    }

    console.log("\n[RECOVERY] Recovery complete.");
    const redisTaskLen = await redisClient.hlen(this.CRON_TASKS_KEY);
    console.log(`[RECOVERY] Total tasks in Redis: ${redisTaskLen}`);
    console.log(
      `[RECOVERY] Total cron expressions in memory: ${this.taskRegistry.size}`
    );
  }

  private async executeTasks(cronExpression: string) {
    const raw = await redisClient.hget(this.CRON_TASKS_KEY, cronExpression);
    const tasks: AutoCronTaskData[] = raw ? JSON.parse(raw) : [];
    const now = new Date();

    for (const task of tasks) {
      try {
        console.log(`🚀 [auto-posting] task triggered at ${now.toISOString()}`);
        console.log(
          `- taskId: ${task.taskId}, cron: ${task.cronExpression}, tz: ${task.timezone}`
        );
        const [rootBusinessId, daytime] = task.taskId.split("@");
        const [day, time] = daytime.split("-");

        const business = await db.rootBusiness.findUnique({
          where: { id: rootBusinessId },
          select: {
            name: true,
            generatedImageContents: {
              where: {
                AND: [{ readyToPost: true }, { deletedAt: null }],
              },
              include: {
                schedulerManualPostings: { select: { id: true } },
                _count: { select: { postedImageContents: true } },
              },
              orderBy: { createdAt: "asc" },
            },
            socialLinkedIn: { select: { id: true } },
            socialFacebookPage: { select: { id: true } },
            socialInstagramBusiness: { select: { id: true } },
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
          (c) =>
            c._count.postedImageContents === 0 && !c?.schedulerManualPostings
        );
        if (!unpostedContents.length) {
          console.warn(`No unposted content for business ${rootBusinessId}`);
          await this.remove(rootBusinessId);
          continue;
        }

        const content = unpostedContents[0];

        // Double check lagi saat eksekusi: intersection dgn koneksi aktual saat ini
        const connectedNow = this.getConnectedPlatforms(business);
        const finalPlatforms = this.intersect<SocialPlatform>(
          task.platforms,
          connectedNow
        );

        if (finalPlatforms.length === 0) {
          console.warn(
            `Skip execute for ${rootBusinessId} ${day} ${time} — no connected platforms at runtime`
          );
          continue;
        }

        // Eksekusi per platform
        for (const p of finalPlatforms) {
          if (p === "linked_in" && business.socialLinkedIn) {
            console.log(
              `🚀 [${rootBusinessId}] Posting ${content.id} → LinkedIn @ ${day} ${time}`
            );
            try {
              await this.linkedIn.post(
                rootBusinessId,
                {
                  caption: content.caption,
                  generatedImageContentId: content.id,
                  platforms: ["linked_in"],
                },
                content.caption
              );
              console.log(
                `✅ [${rootBusinessId}] LinkedIn posted ${content.id}`
              );
            } catch (e) {
              console.error(`❌ Failed LinkedIn post ${content.id}:`, e);
            }
          }
          if (p === "facebook_page" && business.socialFacebookPage) {
            console.log(
              `🚀 [${rootBusinessId}] Posting ${content.id} → Facebook Page @ ${day} ${time}`
            );
            try {
              await this.facebookPage.post(
                rootBusinessId,
                {
                  caption: content.caption,
                  generatedImageContentId: content.id,
                  platforms: ["facebook_page"],
                },
                content.caption
              );
              console.log(
                `✅ [${rootBusinessId}] Facebook Page posted ${content.id}`
              );
            } catch (e) {
              console.error(`❌ Failed Facebook Page post ${content.id}:`, e);
            }
          }
          if (p === "instagram_business" && business.socialInstagramBusiness) {
            console.log(
              `🚀 [${rootBusinessId}] Posting ${content.id} → Instagram Business @ ${day} ${time}`
            );
            try {
              await this.instagramBusiness.post(
                rootBusinessId,
                {
                  caption: content.caption,
                  generatedImageContentId: content.id,
                  platforms: ["instagram_business"],
                },
                content.caption
              );
              console.log(
                `✅ [${rootBusinessId}] Instagram Business posted ${content.id}`
              );
            } catch (e) {
              console.error(
                `❌ Failed Instagram Business post ${content.id}:`,
                e
              );
            }
          }
        }
      } catch (error) {
        console.error(
          `❌ Failed to execute task for cron ${cronExpression}:`,
          error
        );
      }
    }
  }
}
