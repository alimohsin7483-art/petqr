import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("security headers", () => {
  it("applies the expected security headers to every route", async () => {
    const headerGroups = await nextConfig.headers!();
    const allHeaders = headerGroups[0].headers.map((h) => h.key);

    expect(allHeaders).toContain("X-Frame-Options");
    expect(allHeaders).toContain("X-Content-Type-Options");
    expect(allHeaders).toContain("Strict-Transport-Security");
    expect(allHeaders).toContain("Content-Security-Policy");
    expect(allHeaders).toContain("Referrer-Policy");
  });

  it("sets X-Frame-Options to DENY (prevents clickjacking on every page)", async () => {
    const headerGroups = await nextConfig.headers!();
    const xfo = headerGroups[0].headers.find((h) => h.key === "X-Frame-Options");
    expect(xfo?.value).toBe("DENY");
  });
});
