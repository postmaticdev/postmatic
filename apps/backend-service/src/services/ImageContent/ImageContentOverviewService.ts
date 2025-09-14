import { BaseService } from "../BaseService";
import db from "../../config/db";
import { FilterQueryType } from "src/middleware/use-filter";
import moment from "moment-timezone";
import { SocialPlatform } from "@prisma/client";

interface UpcomingPost {
  date: Date;
  images: string[];
  platforms: string[];
  type: "auto" | "manual";
  title: string;
  category: string;
}

export class ImageContentOverviewService extends BaseService {
  constructor() {
    super();
  }

  private DAYS = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
  };

  private PLATFORMS = Object.values(SocialPlatform);

  /**
   * Helper: validasi timezone (fallback ke UTC kalau tidak valid)
   */
  private pickTz(tz?: string | null) {
    return tz && moment.tz.zone(tz) ? tz : "UTC";
  }

  /**
   * Helper: bikin key string "YYYY-MM-DD HH:mm" di TZ tertentu
   */
  private keyByMinute(d: Date, tz: string) {
    return moment(d).tz(tz).format("YYYY-MM-DD HH:mm");
  }

  /**
   * Helper: buat DateTime di TZ untuk tanggal (YYYY-MM-DD dari m) + time "HH:mm"
   */
  private combineDateAndTime(
    mDate: moment.Moment,
    hhmm: string,
    tz: string
  ): moment.Moment {
    return moment.tz(
      `${mDate.format("YYYY-MM-DD")} ${hhmm}`,
      "YYYY-MM-DD HH:mm",
      tz
    );
  }

  /**
   * Helper: enumerate semua slot auto (day + times) dalam [start..end] di TZ
   * - skip slot di masa lalu relatif ke nowTZ (opsional)
   */
  private buildAutoSlots(
    autoPostings: { day: string; times: string[] }[],
    start: Date,
    end: Date,
    tz: string,
    nowTZ?: moment.Moment
  ): Date[] {
    const startTz = moment.tz(start, tz).startOf("day");
    const endTz = moment.tz(end, tz).endOf("day");
    const slots: Date[] = [];

    // Map day -> times
    const byDay: Record<number, string[]> = {};
    for (const ap of autoPostings) {
      const dv = this.DAYS[ap.day as keyof typeof this.DAYS];
      if (typeof dv !== "number") continue;
      if (!byDay[dv]) byDay[dv] = [];
      for (const t of ap.times) {
        // normalisasi "HH:mm"
        const hhmm = moment(t, ["HH:mm", "H:m"]).format("HH:mm");
        if (!byDay[dv].includes(hhmm)) byDay[dv].push(hhmm);
      }
    }
    // sort jam per hari
    for (const k of Object.keys(byDay)) {
      byDay[+k].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    }

    for (
      let cur = startTz.clone();
      cur.isSameOrBefore(endTz, "day");
      cur.add(1, "day")
    ) {
      const dow = cur.day(); // 0..6
      const times = byDay[dow];
      if (!times || times.length === 0) continue;
      for (const t of times) {
        const slot = this.combineDateAndTime(cur, t, tz);
        if (slot.isBefore(startTz) || slot.isAfter(endTz)) continue;
        if (nowTZ && slot.isBefore(nowTZ)) continue; // hanya upcoming
        slots.push(slot.toDate());
      }
    }

    // sort kronologis
    slots.sort((a, b) => a.getTime() - b.getTime());
    return slots;
  }

  /**
   * Mengembalikan daftar upcoming posts (manual + auto) dalam format seragam.
   */
  async getUpcomingPost(rootBusinessId: string, filter: FilterQueryType) {
    // ambil semua yang perlu dalam satu query
    const root = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        socialLinkedIn: {
          select: {
            id: true,
          },
        },
        generatedImageContents: {
          where: {
            AND: [
              { readyToPost: true },
              { deletedAt: null },
              { postedImageContents: { none: {} } }, // belum pernah di-post
              // pakai rentang createdAt dari filter kamu (kalau diberikan)
              ...(filter.dateStart && filter.dateEnd
                ? [
                    {
                      createdAt: { gte: filter.dateStart, lte: filter.dateEnd },
                    },
                  ]
                : []),
            ],
          },
          select: {
            id: true,
            caption: true,
            images: true,
            category: true,
            schedulerManualPostings: { select: { id: true } }, // untuk exclude dari auto
          },
        },
        schedulerManualPostings: {
          where: {
            AND: [
              ...(filter.dateStart && filter.dateEnd
                ? [{ date: { gte: filter.dateStart, lte: filter.dateEnd } }]
                : []),
              {
                generatedImageContent: {
                  postedImageContents: { none: {} }, // pastikan belum pernah di-post
                },
              },
            ],
          },
          select: {
            date: true,
            platforms: true,
            generatedImageContent: {
              select: { caption: true, images: true, category: true },
            },
          },
        },
        schedulerAutoPostings: {
          where: { isActive: true },
          select: { day: true, isActive: true, times: true },
        },
        schedulerAutoPreference: { select: { isAutoPosting: true } },
        schedulerTimeZone: { select: { timezone: true } },
      },
    });

    if (!root) return [];

    const tz = this.pickTz(root.schedulerTimeZone?.timezone);
    const nowTZ = moment.tz(tz);

    const dateStart = filter.dateStart ?? nowTZ.clone().startOf("day").toDate();
    const dateEnd =
      filter.dateEnd ??
      nowTZ
        .clone()
        .add(14, "days") // default horizon 2 minggu jika user tak memberi filter
        .endOf("day")
        .toDate();

    const upcoming: UpcomingPost[] = [];

    /** 1) KUMPULKAN MANUAL */
    const manualKeySet = new Set<string>();
    for (const m of root.schedulerManualPostings) {
      const when = moment(m.date).tz(tz); // render ke TZ
      // hanya future/upcoming (opsional; jika ingin keep semuanya dalam range, hapus cek below)
      if (when.isBefore(nowTZ)) continue;

      const item: UpcomingPost = {
        date: when.toDate(),
        images: m.generatedImageContent.images,
        platforms: m.platforms,
        type: "manual",
        title: m.generatedImageContent.caption ?? "",
        category: m.generatedImageContent.category,
      };
      upcoming.push(item);

      // simpan key menit untuk menghindari bentrok slot auto
      manualKeySet.add(this.keyByMinute(item.date, tz));
    }

    /** 2) SIAPKAN QUEUE AUTO (exclude yang sudah dijadwalkan manual) */
    const autoQueue = root.generatedImageContents.filter(
      (g) => !g.schedulerManualPostings // belum ada manual schedule
    );

    /** 3) GEN SLOT AUTO BERDASARKAN PREFERENSI (day+times) DALAM RANGE */
    const rawSlots = root.schedulerAutoPreference?.isAutoPosting
      ? this.buildAutoSlots(
          root.schedulerAutoPostings,
          dateStart,
          dateEnd,
          tz,
          nowTZ
        )
      : [];

    // hindari tabrakan dengan manual (di menit yang sama)
    const autoSlots = rawSlots.filter(
      (d) => !manualKeySet.has(this.keyByMinute(d, tz))
    );

    /** 4) PASANG KONTEN DARI QUEUE KE SLOT AUTO SECARA BERURUTAN */
    let qi = 0;
    for (const slot of autoSlots) {
      if (qi >= autoQueue.length) break;
      const g = autoQueue[qi++];
      const availPlatforms: string[] = [];
      if (root.socialLinkedIn) {
        availPlatforms.push("linkedin");
      }
      upcoming.push({
        date: slot,
        images: g.images,
        platforms: availPlatforms, // jika ada preferensi platform auto, gantikan di sini
        type: "auto",
        title: g.caption ?? "",
        category: g.category,
      });
    }

    /** 5) URUTKAN ASC */
    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

    return upcoming;
  }

  // posted
  async getCountPosted(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const posted = await db.postedImageContent.findMany({
        where: {
          AND: [
            {
              rootBusinessId,
            },
            {
              deletedAt: null,
            },
            {
              createdAt: {
                gte: filter.dateStart ? filter.dateStart : undefined,
                lte: filter.dateEnd ? filter.dateEnd : undefined,
              },
            },
          ],
        },
        select: {
          platform: true,
        },
      });
      const postedPlatforms = Object.fromEntries(
        this.PLATFORMS.map((platform) => [platform, 0])
      );
      for (const item of posted) {
        postedPlatforms[item.platform]++;
      }
      const total = Object.values(postedPlatforms).reduce(
        (acc, curr) => acc + curr,
        0
      );
      return {
        total,
        detail: postedPlatforms,
      };
    } catch (error) {
      this.handleError("ImageContentOverviewService.countPosted", error);
    }
  }

  async getCountUpcoming(rootBusinessId: string, filter: FilterQueryType) {
    try {
      const root = await db.rootBusiness.findUnique({
        where: {
          id: rootBusinessId,
        },
        select: {
          generatedImageContents: {
            where: {
              AND: [
                {
                  readyToPost: true,
                },
                {
                  deletedAt: null,
                },
                {
                  postedImageContents: {
                    none: {},
                  },
                },
                {
                  createdAt: {
                    gte: filter.dateStart,
                    lte: filter.dateEnd,
                  },
                },
              ],
            },
            select: {
              id: true,
              schedulerManualPostings: {
                select: {
                  id: true,
                },
              },
            },
          },
          schedulerAutoPreference: {
            select: {
              isAutoPosting: true,
            },
          },
          schedulerManualPostings: {
            where: {
              AND: [
                { rootBusinessId },
                {
                  date: {
                    gte: filter.dateStart,
                    lte: filter.dateEnd,
                  },
                },
                {
                  generatedImageContent: {
                    postedImageContents: {
                      none: {},
                    },
                  },
                },
              ],
            },
            select: {
              platforms: true,
            },
          },
          socialLinkedIn: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!root) {
        return null;
      }

      const upcomingPlatforms = Object.fromEntries(
        this.PLATFORMS.map((platform) => [platform, 0])
      );
      for (const item of root.schedulerManualPostings) {
        item.platforms.forEach((platform) => {
          upcomingPlatforms[platform]++;
        });
      }

      const unpostedContents = root.generatedImageContents.filter(
        (content) => !content.schedulerManualPostings
      );

      if (root.socialLinkedIn && root.schedulerAutoPreference?.isAutoPosting) {
        upcomingPlatforms["linkedin"] += unpostedContents.length;
      }

      const total = Object.values(upcomingPlatforms).reduce(
        (acc, curr) => acc + curr,
        0
      );

      return {
        total,
        detail: upcomingPlatforms,
      };
    } catch (error) {
      this.handleError("ImageContentOverviewService.getCountUpcoming", error);
    }
  }
}
