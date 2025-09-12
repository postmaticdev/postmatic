import axios from "axios";
import { BaseUtils } from "../BaseUtils";
import * as cheerio from "cheerio";
import Redis from "ioredis/built";
import Parser from "rss-parser";
import db from "../../config/db";
import pLimit from "p-limit";

export interface AntaraParsedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
  guid?: string;
  isoDate: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  ["content:encoded"]?: string;
}

export class AntaraUtils extends BaseUtils {
  private readonly REDIS_KEY = "antara:articles";
  private readonly REDIS_TTL = 60 * 15;
  constructor(private redis: Redis) {
    super();
  }

  map = async (item: AntaraParsedItem, masterRssId: string) => {
    console.log("📄 Mapping artikel:", item.title);

    let imageUrl: string | null = null;

    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url;
    } else if (item["content:encoded"]) {
      const match = item["content:encoded"].match(
        /<img[^>]+src=["']([^"']+)["']/
      );
      if (match?.[1]) {
        imageUrl = match[1];
      }
    }

    const fullContent = await this.fullContent(item.link);

    return {
      title: item.title,
      url: item.link,
      publishedAt: new Date(item.isoDate),
      imageUrl,
      summary: fullContent || item.content || item.contentSnippet || "",
      masterRssId,
      publisher: "antara",
    };
  };

  private async fullContent(url: string): Promise<string> {
    try {
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const paragraphs: string[] = [];

      $(".post-content p").each((_, el) => {
        const text = $(el).text().trim();

        const isGarbage =
          text.includes("(adsbygoogle") ||
          text.toLowerCase().includes("copyright") ||
          text.toLowerCase().includes("dilarang keras") ||
          text.toLowerCase().startsWith("pewarta:") ||
          text.toLowerCase().startsWith("editor:");

        if (text && !isGarbage) {
          paragraphs.push(text);
        }
      });

      return paragraphs.join("\n\n");
    } catch {
      return "";
    }
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
                publisher: "antara",
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
              console.log(`📄 ANTARA Parsing: ${rss.title} (${rss.url})`);
              const result = await this.parse(rss.url);
              const items = result.items as AntaraParsedItem[];

              console.log(`✅ Parsed: ${rss.title} - ${items.length} items`);

              const mapped = items.map((item) => this.map(item, rss.id));
              const fullMapped = await Promise.all(mapped);
              return fullMapped;
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
      this.handleError("parseAntara", error);
      return [];
    }
  }

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
