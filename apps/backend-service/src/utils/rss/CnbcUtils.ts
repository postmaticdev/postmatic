import axios from "axios";
import { BaseUtils } from "../BaseUtils";
import * as cheerio from "cheerio";
import Redis from "ioredis/built";
import Parser from "rss-parser";
import db from "../../config/db";
import pLimit from "p-limit";

export interface CnbcParsedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  guid: string;
  isoDate: string;
}

export class CnbcUtils extends BaseUtils {
  private readonly REDIS_KEY = "cnbc:articles";
  private readonly REDIS_TTL = 60 * 15;

  constructor(private redis: Redis) {
    super();
  }

  async getArticles(rootBusinessId: string, ignoreCache = false) {
    const cacheKey = `${this.REDIS_KEY}:${rootBusinessId}`;

    // 1. Cek cache
    const cached = await this.redis.get(cacheKey);
    if (cached && !ignoreCache) {
      console.log("🧠 Redis hit:", cacheKey);
      const parsed = JSON.parse(cached, (key, value) => {
        if (key === "publishedAt") return new Date(value);
        return value;
      });
      return parsed;
    }

    console.log("🧠 Redis miss:", cacheKey);

    try {
      const knowledges = await db.rssKnowledge.findMany({
        where: {
          AND: [
            {
              rootBusinessId,
            },
            {
              isActive: true,
            },
            {
              deletedAt: null,
            },
            {
              masterRss: {
                publisher: "cnbc",
              },
            },
          ],
        },
        select: {
          masterRss: {
            select: {
              id: true,
              title: true,
              url: true,
            },
          },
        },
      });

      const rsses = knowledges.map((knowledge) => knowledge.masterRss);

      console.log("🔍 rsses.length:", rsses.length);

      const limit = pLimit(5);

      const allResults = await Promise.all(
        rsses.map((rss) =>
          limit(async () => {
            try {
              const result = await this.parse(rss.url);
              const items = result.items as CnbcParsedItem[];

              console.log(`✅ Parsed: ${rss.title} - ${items.length} items`);

              const mapped = items.map((item) => this.map(item, rss.id));
              return mapped;
            } catch (err) {
              const msg = (err as Error).message;
              if (msg.includes("Timeout")) {
                console.warn(`⏱️ Timeout: ${rss.url}`);
              } else {
                console.error(`❌ Failed: ${rss.title} (${rss.url})`, msg);
              }
              return [];
            }
          })
        )
      );

      const rssArticles = allResults.flat();

      await this.redis.set(
        cacheKey,
        JSON.stringify(rssArticles),
        "EX",
        this.REDIS_TTL
      );

      return rssArticles;
    } catch (error) {
      this.handleError("parseCnbc", error);
      return [];
    }
  }

  map = (item: CnbcParsedItem, masterRssId: string) => {
    return {
      title: item.title,
      url: item.link,
      publishedAt: new Date(item.isoDate),
      imageUrl: null,
      summary: item.contentSnippet,
      masterRssId,
      publisher: "cnbc",
    };
  };

  private async parse(url: string, timeoutMs = 5000) {
    const parser = new Parser();

    return Promise.race([
      parser.parseURL(url),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`⏰ Timeout fetching RSS: ${url}`)),
          timeoutMs
        )
      ),
    ]) as Promise<{ items: unknown[] }>;
  }
}
