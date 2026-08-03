import { describe, it, expect } from "vitest";
import { createPetSchema } from "@/validations/pets";
import { foundReportSchema } from "@/validations/found-report";

describe("createPetSchema", () => {
  it("accepts a minimal valid pet", () => {
    const result = createPetSchema.safeParse({ name: "Bruno", species: "DOG" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createPetSchema.safeParse({ name: "", species: "DOG" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid species", () => {
    const result = createPetSchema.safeParse({ name: "Bruno", species: "DRAGON" });
    expect(result.success).toBe(false);
  });
});

describe("foundReportSchema", () => {
  it("accepts a report with just a message", () => {
    const result = foundReportSchema.safeParse({
      slug: "abc123",
      message: "Found near the park, safe with me.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = foundReportSchema.safeParse({ slug: "abc123", message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when the honeypot field is filled in", () => {
    const result = foundReportSchema.safeParse({
      slug: "abc123",
      message: "Found your dog",
      companyWebsite: "https://spambot.example.com",
    });
    expect(result.success).toBe(false);
  });
});
