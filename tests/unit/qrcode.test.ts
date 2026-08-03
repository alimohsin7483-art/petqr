import { describe, it, expect } from "vitest";
import { newPublicSlug, scanUrlForSlug } from "@/services/qr/qrcode";

describe("newPublicSlug", () => {
  it("generates a 10-character slug", () => {
    expect(newPublicSlug()).toHaveLength(10);
  });

  it("never includes visually ambiguous characters (0, O, 1, I, l)", () => {
    for (let i = 0; i < 200; i++) {
      const slug = newPublicSlug();
      expect(slug).not.toMatch(/[0O1Il]/);
    }
  });

  it("generates different slugs across calls", () => {
    const slugs = new Set(Array.from({ length: 50 }, () => newPublicSlug()));
    expect(slugs.size).toBe(50);
  });
});

describe("scanUrlForSlug", () => {
  it("builds the public scan URL from the app URL and slug", () => {
    expect(scanUrlForSlug("abc123XYZ4")).toBe("https://petlink.test/p/abc123XYZ4");
  });
});
