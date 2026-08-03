import { describe, it, expect, beforeEach, vi } from "vitest";

describe("checkRateLimit — fails open without Redis config", () => {
  beforeEach(() => {
    delete process.env.RATE_LIMIT_REDIS_URL;
    vi.resetModules();
  });

  it("allows the request when RATE_LIMIT_REDIS_URL is not set", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const result = await checkRateLimit("test-key", 5, "1 h");
    expect(result.success).toBe(true);
  });
});
