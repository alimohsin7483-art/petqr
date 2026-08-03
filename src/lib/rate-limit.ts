import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.RATE_LIMIT_REDIS_URL
  ? Redis.fromEnv()
  : null;

/**
 * Sliding-window rate limit. Falls back to allowing all requests if Redis
 * isn't configured (local dev without Upstash) — logs a warning so this
 * never fails silently in production.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  window: `${number} ${"s" | "m" | "h"}`
): Promise<{ success: boolean }> {
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      console.warn("RATE_LIMIT_REDIS_URL not set — rate limiting is disabled in production.");
    }
    return { success: true };
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: "petlink:ratelimit",
  });

  const { success } = await ratelimit.limit(key);
  return { success };
}
