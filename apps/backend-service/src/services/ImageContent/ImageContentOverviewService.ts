import { BaseService } from "../BaseService";
import db from "../../config/db";
import { FilterQueryType } from "src/middleware/use-filter";
import moment from "moment-timezone";
import { GeneratedImageContent, SocialPlatform } from "@prisma/client";

interface UpcomingPost {
  id: string; // generatedImageContentId
  date: Date;
  images: string[];
  platforms: string[];
  type: "auto" | "manual";
  title: string;
  category: string;
  schedulerManualPostingId: number | null;
  generatedImageContent: GeneratedImageContent;
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

  async getUpcomingPost(rootBusinessId: string, filter: FilterQueryType) {
    // rentang default kalau filter kosong: hari ini..+30 hari
    const fallbackStart = moment().startOf("day").toDate();
    const fallbackEnd = moment().add(30, "days").endOf("day").toDate();

    // ambil semua yang perlu dalam satu query
    const root = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        // koneksi untuk intersect platform
        socialLinkedIn: { select: { id: true } },
        socialFacebookPage: { select: { id: true } },
        socialInstagramBusiness: { select: { id: true } },

        // konten kandidat (ready, belum dipost), include manual untuk exclude dari auto
        generatedImageContents: {
          where: {
            AND: [
              { readyToPost: true },
              { deletedAt: null },
              { postedImageContents: { none: {} } }, // belum pernah dipost
              ...(filter.dateStart && filter.dateEnd
                ? [
                    {
                      createdAt: { gte: filter.dateStart, lte: filter.dateEnd },
                    },
                  ]
                : []),
            ],
          },
          include: {
            schedulerManualPostings: { select: { id: true } }, // untuk exclude auto
          },
          orderBy: { createdAt: "asc" },
        },

        // manual yang jatuh di rentang
        schedulerManualPostings: {
          where: {
            AND: [
              ...(filter.dateStart && filter.dateEnd
                ? [{ date: { gte: filter.dateStart, lte: filter.dateEnd } }]
                : []),
              { generatedImageContent: { postedImageContents: { none: {} } } },
            ],
          },
          select: {
            id: true,
            date: true,
            platforms: true,
            generatedImageContent: true,
          },
          orderBy: { date: "asc" },
        },

        // preferensi auto + times (schema baru)
        schedulerAutoPostings: {
          where: { isActive: true },
          select: {
            day: true,
            schedulerAutoPostingTimes: {
              select: { hhmm: true, platforms: true },
            },
          },
        },
        schedulerAutoPreference: { select: { isAutoPosting: true } },

        // timezone bisnis
        schedulerTimeZone: { select: { timezone: true } },
      },
    });

    if (!root) return [];

    const tz = this.pickTz(root.schedulerTimeZone?.timezone);
    const start = filter.dateStart ?? fallbackStart;
    const end = filter.dateEnd ?? fallbackEnd;
    const nowTZ = moment.tz(new Date(), tz);

    const upcoming: UpcomingPost[] = [];

    /** 1) KUMPULKAN MANUAL (apa adanya) */
    for (const m of root.schedulerManualPostings) {
      upcoming.push({
        id: m.generatedImageContent.id,
        date: m.date,
        platforms: m.platforms,
        type: "manual",
        title: m.generatedImageContent.caption || "Postingan Tanpa Caption",
        category: m.generatedImageContent.category,
        schedulerManualPostingId: m.id,
        generatedImageContent: m.generatedImageContent,
        images: m.generatedImageContent.images,
      });
    }

    /** 2) KUMPULKAN AUTO */
    const connectedPlatforms: SocialPlatform[] = [
      ...(root.socialLinkedIn ? (["linked_in"] as SocialPlatform[]) : []),
      ...(root.socialFacebookPage
        ? (["facebook_page"] as SocialPlatform[])
        : []),
      ...(root.socialInstagramBusiness
        ? (["instagram_business"] as SocialPlatform[])
        : []),
    ];

    const autoEnabled = !!root.schedulerAutoPreference?.isAutoPosting;
    const candidatesAuto = (root.generatedImageContents ?? []).filter(
      (c) => !c.schedulerManualPostings
    );

    if (
      autoEnabled &&
      root.schedulerAutoPostings.length &&
      connectedPlatforms.length
    ) {
      // Bangun semua slot (tanggal & platforms efektif) dalam rentang
      type Slot = {
        when: Date;
        platforms: SocialPlatform[];
        hhmm: string;
        day: string;
      };
      const slots: Slot[] = [];

      const startTz = moment.tz(start, tz).startOf("day");
      const endTz = moment.tz(end, tz).endOf("day");

      // peta nama hari -> index
      const dayIdx = this.DAYS; // {Minggu:0,..}

      for (
        let cur = startTz.clone();
        cur.isSameOrBefore(endTz, "day");
        cur.add(1, "day")
      ) {
        const dow = cur.day(); // 0..6
        for (const ap of root.schedulerAutoPostings) {
          const targetDow = dayIdx[ap.day as keyof typeof dayIdx];
          if (typeof targetDow !== "number" || targetDow !== dow) continue;

          for (const t of ap.schedulerAutoPostingTimes) {
            const hhmm = moment(t.hhmm, ["HH:mm", "H:m"]).format("HH:mm");
            const whenM = this.combineDateAndTime(cur, hhmm, tz);
            if (whenM.isBefore(startTz) || whenM.isAfter(endTz)) continue;
            if (whenM.isBefore(nowTZ)) continue; // upcoming saja

            // platforms efektif = preferensi ∩ connected
            const eff = t.platforms.filter((p) =>
              connectedPlatforms.includes(p)
            );
            if (!eff.length) continue;

            slots.push({
              when: whenM.toDate(),
              platforms: eff,
              hhmm,
              day: ap.day,
            });
          }
        }
      }

      // urutkan slot kronologis
      slots.sort((a, b) => a.when.getTime() - b.when.getTime());

      // Pasangkan kandidat konten ke slot secara berurutan (1 konten = 1 slot)
      const n = Math.min(candidatesAuto.length, slots.length);
      for (let i = 0; i < n; i++) {
        const content = candidatesAuto[i];
        const slot = slots[i];
        upcoming.push({
          id: content.id,
          date: slot.when,
          platforms: slot.platforms.map(String), // string[]
          type: "auto",
          title: content.caption || "Postingan Tanpa Caption",
          category: content.category,
          schedulerManualPostingId: null,
          generatedImageContent: content,
          images: content.images,
        });
      }
    }

    /** 3) URUTKAN ASC */
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
      // Fallback window kalau filter kosong: hari ini .. +30 hari (TZ bisnis akan diterapkan belakangan)
      const fallbackStart = moment().startOf("day").toDate();
      const fallbackEnd = moment().add(30, "days").endOf("day").toDate();

      const root = await db.rootBusiness.findUnique({
        where: { id: rootBusinessId },
        select: {
          // koneksi platform untuk intersect
          socialLinkedIn: { select: { id: true } },
          socialFacebookPage: { select: { id: true } },
          socialInstagramBusiness: { select: { id: true } },

          // preferensi AUTO
          schedulerAutoPreference: { select: { isAutoPosting: true } },
          schedulerAutoPostings: {
            where: { isActive: true },
            select: {
              day: true,
              schedulerAutoPostingTimes: {
                select: { hhmm: true, platforms: true },
              },
            },
          },

          // MANUAL dalam rentang
          schedulerManualPostings: {
            where: {
              AND: [
                ...(filter.dateStart && filter.dateEnd
                  ? [{ date: { gte: filter.dateStart, lte: filter.dateEnd } }]
                  : []),
                {
                  generatedImageContent: { postedImageContents: { none: {} } },
                },
              ],
            },
            select: { platforms: true, date: true },
          },

          // kandidat konten untuk AUTO (ready, unposted) — include manual untuk exclude auto
          generatedImageContents: {
            where: {
              AND: [
                { readyToPost: true },
                { deletedAt: null },
                { postedImageContents: { none: {} } },
                ...(filter.dateStart && filter.dateEnd
                  ? [
                      {
                        createdAt: {
                          gte: filter.dateStart,
                          lte: filter.dateEnd,
                        },
                      },
                    ]
                  : []),
              ],
            },
            select: {
              id: true,
              images: true,
              caption: true,
              category: true,
              schedulerManualPostings: { select: { id: true } },
            },
            orderBy: { createdAt: "asc" },
          },

          // TZ bisnis
          schedulerTimeZone: { select: { timezone: true } },
        },
      });

      if (!root) return null;

      const tz = this.pickTz(root.schedulerTimeZone?.timezone);
      const start = filter.dateStart ?? fallbackStart;
      const end = filter.dateEnd ?? fallbackEnd;
      const nowTZ = moment.tz(new Date(), tz);

      // siapkan counter per platform
      const upcomingPlatforms: Record<SocialPlatform, number> =
        Object.fromEntries(
          this.PLATFORMS.map((p) => [p as SocialPlatform, 0])
        ) as Record<SocialPlatform, number>;

      /** 1) HITUNG MANUAL (langsung tambah per platform) */
      for (const item of root.schedulerManualPostings) {
        for (const p of item.platforms as SocialPlatform[]) {
          // validasi nama enum agar aman
          if ((p as any) in upcomingPlatforms) {
            upcomingPlatforms[p]++;
          }
        }
      }

      /** 2) HITUNG AUTO (preferensi ∩ koneksi, pairing konten dengan slot) */
      const connected: SocialPlatform[] = [
        ...(root.socialLinkedIn ? (["linked_in"] as SocialPlatform[]) : []),
        ...(root.socialFacebookPage
          ? (["facebook_page"] as SocialPlatform[])
          : []),
        ...(root.socialInstagramBusiness
          ? (["instagram_business"] as SocialPlatform[])
          : []),
      ];

      const autoEnabled = !!root.schedulerAutoPreference?.isAutoPosting;
      const candidatesAuto = (root.generatedImageContents ?? []).filter(
        (c) => !c.schedulerManualPostings
      );

      if (
        autoEnabled &&
        root.schedulerAutoPostings.length &&
        connected.length &&
        candidatesAuto.length
      ) {
        type Slot = {
          when: Date;
          platforms: SocialPlatform[];
          day: string;
          hhmm: string;
        };
        const slots: Slot[] = [];

        const startTz = moment.tz(start, tz).startOf("day");
        const endTz = moment.tz(end, tz).endOf("day");
        const dayIdx = this.DAYS; // {Minggu:0,..}

        for (
          let cur = startTz.clone();
          cur.isSameOrBefore(endTz, "day");
          cur.add(1, "day")
        ) {
          const dow = cur.day(); // 0..6
          for (const ap of root.schedulerAutoPostings) {
            const targetDow = dayIdx[ap.day as keyof typeof dayIdx];
            if (typeof targetDow !== "number" || targetDow !== dow) continue;

            for (const t of ap.schedulerAutoPostingTimes) {
              const hhmm = moment(t.hhmm, ["HH:mm", "H:m"]).format("HH:mm");
              const whenM = this.combineDateAndTime(cur, hhmm, tz);
              if (whenM.isBefore(startTz) || whenM.isAfter(endTz)) continue;
              if (whenM.isBefore(nowTZ)) continue;

              // platforms efektif
              const eff = (t.platforms as SocialPlatform[]).filter((p) =>
                connected.includes(p)
              );
              if (!eff.length) continue;

              slots.push({
                when: whenM.toDate(),
                platforms: eff,
                day: ap.day,
                hhmm,
              });
            }
          }
        }

        // urutkan slot & pasangkan 1:1 dgn konten auto
        slots.sort((a, b) => a.when.getTime() - b.when.getTime());
        const n = Math.min(candidatesAuto.length, slots.length);
        for (let i = 0; i < n; i++) {
          const slot = slots[i];
          for (const p of slot.platforms) {
            if (p in upcomingPlatforms) {
              upcomingPlatforms[p]++;
            }
          }
        }
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
