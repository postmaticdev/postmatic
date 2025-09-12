// cache.ts
import { AppUser } from "../utils/auth";
import { redisClient } from "./redis"; // ioredis instance
import type Redis from "ioredis";

/** ---------- Util khusus ioredis ---------- */

function jsonRevive<T>(s: string): T {
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  return JSON.parse(s, (_k, v) =>
    typeof v === "string" && iso.test(v) ? new Date(v) : v
  );
}

async function scanAllKeys(
  client: Redis,
  pattern: string,
  count = 1000
): Promise<string[]> {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const [next, batch] = await client.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      String(count)
    );
    keys.push(...batch);
    cursor = next;
  } while (cursor !== "0");
  return keys;
}

/** ---------- Factory: Map-like di atas ioredis ---------- */

function createRedisMap<V>(opts: { prefix: string; ttlSeconds: number }) {
  const { prefix, ttlSeconds } = opts;
  const client = redisClient as Redis;

  const k = (key: string) => `${prefix}:${key}`;

  return {
    /** Map.get(key) -> Promise<V | undefined> */
    async get(key: string): Promise<V | undefined> {
      const raw = await client.get(k(key));
      if (raw == null) return undefined;
      try {
        return jsonRevive<V>(raw);
      } catch {
        // fallback jika bukan JSON
        return raw as unknown as V;
      }
    },

    /** Map.set(key, value, ttlOverride?) */
    async set(key: string, value: V, ttlOverride?: number): Promise<void> {
      const ttl = typeof ttlOverride === "number" ? ttlOverride : ttlSeconds;
      await client.set(k(key), JSON.stringify(value), "EX", ttl);
    },

    /** Map.has(key) */
    async has(key: string): Promise<boolean> {
      return (await client.exists(k(key))) === 1;
    },

    /** Map.delete(key) -> boolean */
    async delete(key: string): Promise<boolean> {
      return (await client.del(k(key))) > 0;
    },

    /** Map.clear() -> hapus semua key berprefix ini (pakai SCAN, bukan KEYS) */
    async clear(): Promise<void> {
      const keys = await scanAllKeys(client, `${prefix}:*`);
      if (keys.length) await client.del(...keys);
    },

    /** Tambahan util opsional */
    async size(): Promise<number> {
      const keys = await scanAllKeys(client, `${prefix}:*`);
      return keys.length;
    },

    async keys(): Promise<string[]> {
      const keys = await scanAllKeys(client, `${prefix}:*`);
      return keys.map((full) => full.slice(prefix.length + 1));
    },

    async values(): Promise<V[]> {
      const keys = await scanAllKeys(client, `${prefix}:*`);
      if (!keys.length) return [];
      const raws = await client.mget(...keys);
      const out: V[] = [];
      for (const r of raws) {
        if (r == null) continue;
        try {
          out.push(jsonRevive<V>(r));
        } catch {
          out.push(r as unknown as V);
        }
      }
      return out;
    },

    async entries(): Promise<[string, V][]> {
      const keys = await scanAllKeys(client, `${prefix}:*`);
      if (!keys.length) return [];
      const vals = await this.values();
      return keys.map(
        (full, i) => [full.slice(prefix.length + 1), vals[i]] as [string, V]
      );
    },

    /** Opsional: perpanjang TTL tanpa mengubah value */
    async touch(key: string, ttlOverride?: number): Promise<boolean> {
      const ttl = typeof ttlOverride === "number" ? ttlOverride : ttlSeconds;
      const ok = await client.expire(k(key), ttl);
      return ok === 1;
    },
  };
}

/** ---------- Instances (drop-in pengganti Map) ---------- */
const TTL_30_MIN = 30 * 60;
const TTL_10_MIN = 10 * 60;

export const cachedUser = createRedisMap<AppUser>({
  prefix: "cache:cachedUser",
  ttlSeconds: TTL_30_MIN,
});

export const cachedOwnedBusinesses = createRedisMap<string[]>({
  prefix: "cache:cachedOwnedBusinesses",
  ttlSeconds: TTL_30_MIN,
});

export const cachedResetPasswordUser = createRedisMap<{
  token: string;
  time: number;
}>({
  prefix: "cache:cachedResetPasswordUser",
  ttlSeconds: TTL_10_MIN,
});
