// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { redisClient } from "../config/redis";

const RATE_LIMIT_CAPACITY = parseInt(
  process.env.RATE_LIMIT_CAPACITY || "120",
  10
);
const RATE_LIMIT_REFILL_PER_SEC = Number(
  process.env.RATE_LIMIT_REFILL_PER_SEC ?? 2
);
const RATE_LIMIT_WINDOW_MS = parseInt(
  process.env.RATE_LIMIT_WINDOW_MS || "60000",
  10
);

// Namespace key Redis biar rapi
const RL_NS = process.env.RATE_LIMIT_NS || "rl";

/** ===== Types ===== */
type Options = {
  windowMs: number;
  refillPerSec: number;
  capacity: number;
  key: (req: Request) => string;
  allowlist?: (req: Request) => boolean;
  cost?: (req: Request) => number;
};

type LuaResult = [
  allowed: number,
  tokens: number,
  secondsToFull: number,
  retryAfter: number,
  capacity: number
];

// untuk akses req.user.id tanpa any

/** ===== Helpers ===== */
function normalizeIp(ip: string): string {
  if (!ip) return "unknown";
  if (ip.startsWith("::ffff:")) return ip.slice(7); // IPv4-mapped IPv6 -> IPv4
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.slice(0, 4).join(":") + "::/64"; // mask sederhana /64
  }
  return ip;
}
function getClientIp(req: Request): string {
  return normalizeIp(req.ip || "");
}
function getUserId(req: Request): string | undefined {
  return req.user?.id;
}
function readLoginIdentity(req: Request): string {
  const body = req.body as unknown;
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    const email = obj["email"];
    const username = obj["username"];
    if (typeof email === "string") return email;
    if (typeof username === "string") return username;
  }
  return "";
}
const keyIp = (prefix: string) => (req: Request) =>
  `${prefix}:${getClientIp(req)}`;
const keyUser = (prefix: string) => (req: Request) => {
  const id = getUserId(req);
  return id ? `${prefix}:${id}` : `${prefix}-ip:${getClientIp(req)}`;
};
const keyLoginUser = (prefix: string) => (req: Request) =>
  `${prefix}:${readLoginIdentity(req).toLowerCase().trim()}`;

const allowHealth = (req: Request) =>
  req.path.startsWith("/health") || req.path.startsWith("/metrics");

// Default cost policy (boleh di-override per limiter)
const costDefault = (req: Request): number => {
  if (/\/(export|generate|job)/.test(req.path)) return 10; // heavy ops
  if (req.method !== "GET") return 5; // write lebih mahal
  return 1;
};

/** ===== Lua script (atomik) =====
 * KEYS[1]  = redis key
 * ARGV[1]  = now(ms)
 * ARGV[2]  = capacity
 * ARGV[3]  = refillPerSec
 * ARGV[4]  = cost
 * ARGV[5]  = ttlSec
 * return: {allowed, tokens, secondsToFull, retryAfter, capacity}
 */
const LUA_CONSUME = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'updatedAt')
local tokens = tonumber(data[1])
local updatedAt = tonumber(data[2])

if (tokens == nil) or (updatedAt == nil) then
  tokens = capacity
  updatedAt = now
end

local elapsed = (now - updatedAt) / 1000.0
if elapsed < 0 then elapsed = 0 end
tokens = math.min(capacity, tokens + (elapsed * refill))
updatedAt = now

local allowed = 0
local retryAfter = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
else
  local need = cost - tokens
  local denom = (refill > 0) and refill or 0.001
  retryAfter = math.ceil(need / denom)
end

local denom2 = (refill > 0) and refill or 0.001
local secondsToFull = math.ceil((capacity - tokens) / denom2)

redis.call('HMSET', key, 'tokens', tokens, 'updatedAt', updatedAt)
if ttl > 0 then redis.call('EXPIRE', key, ttl) end

return {allowed, tokens, secondsToFull, retryAfter, capacity}
`;

// parse dan validasi hasil Lua tanpa any
function parseLuaResult(result: unknown): LuaResult {
  if (!Array.isArray(result) || result.length < 5) {
    // fallback aman
    return [1, RATE_LIMIT_CAPACITY, 0, 0, RATE_LIMIT_CAPACITY];
  }
  const toNum = (v: unknown): number => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return [
    toNum(result[0]),
    toNum(result[1]),
    toNum(result[2]),
    toNum(result[3]),
    toNum(result[4]),
  ];
}

/** ===== Core factory (pakai Redis) ===== */
const set = (opts: Options): RequestHandler => {
  const getCost = opts.cost ?? costDefault;
  const TTL_SEC = Math.max(
    2 * (opts.capacity / Math.max(opts.refillPerSec, 0.001)),
    300
  );

  return (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      if (opts.allowlist?.(req)) return next();

      const now = Date.now();
      const localKey = opts.key(req) || "unknown";
      const redisKey = `${RL_NS}:${localKey}`;
      const cost = Math.max(1, getCost(req));

      let raw: unknown;
      try {
        raw = await redisClient.eval(
          LUA_CONSUME,
          1,
          redisKey,
          String(now),
          String(opts.capacity),
          String(opts.refillPerSec),
          String(cost),
          String(Math.ceil(TTL_SEC))
        );
      } catch (e) {
        console.error("[RATE LIMIT][ERROR Redis]:", e);
        return next(); // fail-open
      }

      const [allowed, tokens, secondsToFull, retryAfterSec, capacity] =
        parseLuaResult(raw);

      // === Debugging log (dipertahankan) ===
      console.log("[RATE LIMIT] : ", localKey, " - ", tokens, " - ", capacity);

      if (allowed !== 1) {
        console.log("[RATE LIMIT] : HIT LIMIT FOR : ", localKey);

        res.setHeader("Retry-After", retryAfterSec);
        res.setHeader("RateLimit-Limit", capacity);
        res.setHeader("RateLimit-Remaining", Math.max(0, Math.floor(tokens)));
        res.setHeader(
          "RateLimit-Reset",
          Math.floor(now / 1000 + secondsToFull)
        );
        return res.status(429).json({
          metaData: { code: 429, message: "Too Many Requests" },
          responseMessage: "Too Many Requests",
          errors: {
            wait: retryAfterSec,
            limit: capacity,
            remaining: Math.max(0, Math.floor(tokens)),
            reset: Math.floor(now / 1000 + secondsToFull),
            message: `Retry after ${retryAfterSec} seconds`,
          },
        });
      }

      res.setHeader("RateLimit-Limit", capacity);
      res.setHeader("RateLimit-Remaining", Math.max(0, Math.floor(tokens)));
      res.setHeader("RateLimit-Reset", Math.floor(now / 1000 + secondsToFull));
      return next();
    })().catch(next);
  };
};

/** ===== Bundled limiters (prefix key → bucket terpisah) ===== */
export const useRateLimiter = {
  // 1) Global jaring kasar — per-IP, cukup longgar
  global: set({
    windowMs: RATE_LIMIT_WINDOW_MS,
    capacity: RATE_LIMIT_CAPACITY,
    refillPerSec: RATE_LIMIT_REFILL_PER_SEC,
    key: keyIp("g"),
    allowlist: allowHealth,
  }),

  // 2) Public routes — per-IP
  public: set({
    windowMs: RATE_LIMIT_WINDOW_MS,
    capacity: Math.max(80, Math.floor(RATE_LIMIT_CAPACITY * 0.8)),
    refillPerSec: Math.max(
      1,
      Number((RATE_LIMIT_REFILL_PER_SEC * 1.0).toFixed(2))
    ),
    key: keyIp("pub"),
    // cost: (req) => 1,
  }),

  // 3) Protected routes — per-user (fallback IP)
  auth: set({
    windowMs: RATE_LIMIT_WINDOW_MS,
    capacity: Math.max(150, Math.floor(RATE_LIMIT_CAPACITY * 1.5)),
    refillPerSec: Math.max(
      2,
      Number((RATE_LIMIT_REFILL_PER_SEC * 1.5).toFixed(2))
    ),
    key: keyUser("u"),
  }),

  // 4) Login (per-IP)
  loginIp: set({
    windowMs: 60_000,
    capacity: 10,
    refillPerSec: 10 / 60,
    key: keyIp("login-ip"),
    cost: () => 1,
  }),

  // 5) Login (per-username/email) — pastikan body-parser aktif sebelum ini
  loginUser: set({
    windowMs: 60_000,
    capacity: 5,
    refillPerSec: 5 / 60,
    key: keyLoginUser("login-user"),
    cost: () => 1,
  }),

  // 6) Heavy ops (export/generate/job) — per-user
  heavy: set({
    windowMs: 60_000,
    capacity: 30,
    refillPerSec: 1,
    key: keyUser("heavy"),
    cost: (req) =>
      /\/(job|export|generate)/.test(req.path)
        ? 10
        : req.method !== "GET"
        ? 5
        : 1,
  }),

  // 7) Uploads — per-user
  uploads: set({
    windowMs: 60_000,
    capacity: 20,
    refillPerSec: 20 / 60,
    key: keyUser("up"),
    cost: (req) => (req.method === "POST" ? 3 : 1),
  }),
};
