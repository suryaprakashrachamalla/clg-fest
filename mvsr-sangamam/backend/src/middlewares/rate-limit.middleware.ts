import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/response.util";

interface RateBucket {
  tokens: number;
  last: number;
}

const buckets = new Map<string, RateBucket>();

// Cleanup stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) {
    if (now - b.last > 300_000) buckets.delete(key);
  }
}, 300_000).unref();

export function rateLimitCheck(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: limit, last: now };
  const refill = ((now - b.last) / windowMs) * limit;
  b.tokens = Math.min(limit, b.tokens + refill);
  b.last = now;

  if (b.tokens < 1) {
    throw new HttpError(429, "Too many requests. Please wait a moment and try again.", "RATE_LIMITED");
  }
  b.tokens -= 1;
  buckets.set(key, b);
}

export function rateLimitMiddleware(limit: number, windowMs: number, keyPrefix: string = "rl") {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    try {
      rateLimitCheck(key, limit, windowMs);
      next();
    } catch (err) {
      next(err);
    }
  };
}
