// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

type Options = {
  windowMs: number; // jendela reset (untuk header info)
  refillPerSec: number; // token yang ditambah per detik
  capacity: number; // kapasitas bucket
  key: (req: Request) => string; // identitas (IP/userId/apiKey)
  allowlist?: (req: Request) => boolean;
};

type Bucket = { tokens: number; updatedAt: number };

export const useRateLimiter = (opts: Options): RequestHandler => {
  const buckets = new Map<string, Bucket>();

  return function (req: Request, res: Response, next: NextFunction) {
    if (opts.allowlist?.(req)) return next();

    const now = Date.now();
    const key = opts.key(req);
    const b = buckets.get(key) ?? { tokens: opts.capacity, updatedAt: now };

    // refill
    const elapsedSec = (now - b.updatedAt) / 1000;
    b.tokens = Math.min(
      opts.capacity,
      b.tokens + elapsedSec * opts.refillPerSec
    );
    b.updatedAt = now;

    if (b.tokens < 1) {
      // hit limit
      const retryAfterSec = Math.ceil((1 - b.tokens) / opts.refillPerSec);
      res.setHeader("Retry-After", retryAfterSec);
      res.setHeader("RateLimit-Limit", opts.capacity);
      res.setHeader("RateLimit-Remaining", Math.max(0, Math.floor(b.tokens)));
      res.setHeader(
        "RateLimit-Reset",
        Math.floor((now + opts.windowMs) / 1000)
      );
      return res.status(429).json({
        metaData: { code: 429, message: "Too Many Requests" },
        responseMessage: "Too Many Requests",
      });
    }

    // consume
    b.tokens -= 1;
    buckets.set(key, b);

    // headers informatif (RFC-ish)
    res.setHeader("RateLimit-Limit", opts.capacity);
    res.setHeader("RateLimit-Remaining", Math.max(0, Math.floor(b.tokens)));
    res.setHeader("RateLimit-Reset", Math.floor((now + opts.windowMs) / 1000));
    next();
  };
};
