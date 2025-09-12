import { BaseService } from "./BaseService";
import db from "../config/db";
import { $Enums } from ".prisma/client";
import { FilterQueryType } from "src/middleware/use-filter";
import moment from "moment-timezone";

export class TierService extends BaseService {
  constructor() {
    super();
  }

  private DAY = 24 * 60 * 60 * 1000;

  async getBusinessAvailableToken(
    rootBusinessId: string,
    type?: $Enums.TokenType
  ) {
    const business = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        tokenIncomes: {
          select: {
            amount: true,
            tokenType: true,
          },
          where: {
            tokenType: type,
          },
        },
        tokenUsages: {
          select: {
            total: true,
            type: true,
          },
          where: {
            type: type,
          },
        },
      },
    });
    if (!business) return null;

    let availableToken = 0;
    let totalValidToken = 0;
    let totalUsedToken = 0;

    for (const income of business.tokenIncomes.filter((income) =>
      this.filterUsedValid(income.tokenType, type)
    )) {
      availableToken += income.amount;
      totalValidToken += income.amount;
    }

    for (const usage of business.tokenUsages.filter((usage) =>
      this.filterUsedValid(usage.type, type)
    )) {
      totalUsedToken += usage.total;
      availableToken -= usage.total;
    }

    const percentageUsage = totalValidToken
      ? (totalUsedToken / totalValidToken) * 100
      : 0;

    return {
      availableToken,
      totalValidToken,
      totalUsedToken,
      percentageUsage,
    };
  }

  async getAnalyticEachTypeToken(rootBusinessId: string) {
    const data = await Promise.all(
      Object.values($Enums.TokenType).map(async (type) => {
        console.log({ type });
        const result = await this.getBusinessAvailableToken(
          rootBusinessId,
          type
        );
        return { type, result };
      })
    );

    return data;
  }

  private filterUsedValid = (
    usageType: $Enums.TokenType,
    type?: $Enums.TokenType
  ) => (!type ? true : type === usageType);

  getBusinessSubscription = async (rootBusinessId: string) => {
    const business = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        paymentPurchases: {
          select: {
            productName: true,
            productType: true,
            subscriptionValidFor: true,
          },
          where: {
            appProductSubscriptionItemId: {
              not: null,
            },
            status: {
              equals: "Success",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!business)
      return {
        valid: false,
        expiredAt: null,
        subscription: null,
      };
    if (!business.paymentPurchases.length)
      return {
        valid: false,
        expiredAt: null,
        subscription: null,
      };

    const subscription = business.paymentPurchases[0];

    if (!subscription)
      return {
        valid: false,
        expiredAt: null,
        subscription: null,
      };

    const expiredAt = new Date(
      Date.now() + subscription.subscriptionValidFor * this.DAY
    );

    return {
      valid: expiredAt > new Date(),
      expiredAt,
      subscription: subscription,
    };
  };

  async getAnalyticsTokenUsage(
    rootBusinessId: string,
    filter: FilterQueryType
  ): Promise<OutputRow[] | null> {
    const GROUP_PER = filter.page; // DAY

    const root = await db.rootBusiness.findUnique({
      where: { id: rootBusinessId },
      select: {
        tokenUsages: {
          select: { createdAt: true, total: true, type: true },
        },
        schedulerTimeZone: { select: { timezone: true } },
      },
    });

    if (!root) return null;

    if (!root.schedulerTimeZone?.timezone) {
      await db.schedulerTimeZone.create({
        data: {
          rootBusinessId: rootBusinessId,
          timezone: "Asia/Jakarta",
        },
      });
      root.schedulerTimeZone = {
        timezone: "Asia/Jakarta",
      };
    }

    const tz =
      root.schedulerTimeZone?.timezone &&
      moment.tz.zone(root.schedulerTimeZone.timezone)
        ? root.schedulerTimeZone.timezone
        : "UTC";

    const rows = root.tokenUsages;

    // Kalau tidak ada data sama sekali:
    if (!rows || rows.length === 0) {
      // Masih perlu return range kosong kalau user kasih dateStart/dateEnd?
      // Kita tetap generate bucket kosong kalau keduanya ada:
      if (filter.dateStart && filter.dateEnd) {
        return this.generateEmptyRange(
          filter.dateStart,
          filter.dateEnd,
          GROUP_PER,
          tz,
          Object.values($Enums.TokenType) as string[]
        );
      }
      return [];
    }

    // Tentukan boundary waktu efektif (pakai user input bila ada, kalau tidak ambil dari data)
    const minCreatedAt = rows.reduce(
      (m, r) => (r.createdAt < m ? r.createdAt : m),
      rows[0].createdAt
    );
    const maxCreatedAt = rows.reduce(
      (m, r) => (r.createdAt > m ? r.createdAt : m),
      rows[0].createdAt
    );

    const dateStart = filter.dateStart ?? minCreatedAt;
    const dateEnd = filter.dateEnd ?? maxCreatedAt;

    // Normalisasi ke awal/akhir hari sesuai timezone
    const startTz = moment.tz(dateStart, tz).startOf("day");
    const endTz = moment.tz(dateEnd, tz).endOf("day");

    // Daftar enum yang harus selalu ada
    const allEnums = Object.values($Enums.TokenType) as string[];

    // Agregasi ke bucket keyed by bucketStart(YYYY-MM-DD)
    const bucketMap: Record<string, Record<string, number>> = {};

    const bucketIndexOf = (d: moment.Moment) => {
      const daysDiff = d.startOf("day").diff(startTz, "days");
      return Math.floor(daysDiff / GROUP_PER);
    };

    for (const r of rows) {
      const ct = moment.tz(r.createdAt, tz);
      if (ct.isBefore(startTz) || ct.isAfter(endTz)) continue;

      const idx = bucketIndexOf(ct);
      const bucketStart = moment(startTz)
        .add(idx * GROUP_PER, "days")
        .startOf("day");
      const key = bucketStart.format("YYYY-MM-DD");

      bucketMap[key] ??= {};
      bucketMap[key][r.type] = (bucketMap[key][r.type] ?? 0) + (r.total ?? 0);
    }

    // Generate seluruh bucket dari start..end step N hari, isi kosong 0
    const out: OutputRow[] = [];
    for (
      let cur = moment(startTz);
      cur.isSameOrBefore(endTz, "day");
      cur = cur.add(GROUP_PER, "days").startOf("day")
    ) {
      const key = cur.format("YYYY-MM-DD");
      const row: OutputRow = { date: key };
      for (const e of allEnums) {
        row[e] = bucketMap[key]?.[e] ?? 0;
      }
      out.push(row);
    }

    return out;
  }

  private generateEmptyRange(
    dateStart: Date,
    dateEnd: Date,
    groupPer: number,
    tz: string,
    allEnums: string[]
  ): OutputRow[] {
    const startTz = moment.tz(dateStart, tz).startOf("day");
    const endTz = moment.tz(dateEnd, tz).endOf("day");

    const out: OutputRow[] = [];
    for (
      let cur = moment(startTz);
      cur.isSameOrBefore(endTz, "day");
      cur = cur.add(groupPer, "days").startOf("day")
    ) {
      const key = cur.format("YYYY-MM-DD");
      const row: OutputRow = { date: key };
      for (const e of allEnums) row[e] = 0;
      out.push(row);
    }
    return out;
  }
}

type OutputRow = Record<string, number | string>;
