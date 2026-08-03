import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const schema = readFileSync(resolve(__dirname, "../../prisma/schema.prisma"), "utf-8");

const REQUIRED_MODELS = [
  "User",
  "Organization",
  "Pet",
  "QrCode",
  "Vaccination",
  "MedicalRecord",
  "LostReport",
  "FoundReport",
  "Plan",
  "Subscription",
  "Invoice",
  "Payment",
  "NotificationJob",
  "AuditLog",
  "SupportTicket",
  "SystemSetting",
];

describe("prisma schema — structural guarantees", () => {
  it.each(REQUIRED_MODELS)("defines the %s model", (modelName) => {
    expect(schema).toMatch(new RegExp(`model ${modelName} \\{`));
  });

  it("every soft-deletable model keeps a deletedAt field", () => {
    // Spot-check the core tenant tables that RLS + soft-delete conventions apply to.
    for (const model of ["User", "Pet", "PetPhoto", "Vaccination", "MedicalRecord"]) {
      const match = schema.match(new RegExp(`model ${model} \\{[\\s\\S]*?\\n\\}`));
      expect(match, `model ${model} not found`).not.toBeNull();
      expect(match![0]).toMatch(/deletedAt\s+DateTime\?/);
    }
  });

  it("Pet.publicSlug is unique (required for QR code security)", () => {
    const match = schema.match(/model Pet \{[\s\S]*?\n\}/);
    expect(match![0]).toMatch(/publicSlug\s+String\s+@unique/);
  });
});
