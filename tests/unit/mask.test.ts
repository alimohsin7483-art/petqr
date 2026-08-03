import { describe, it, expect } from "vitest";
import { maskPhone } from "@/lib/mask";

describe("maskPhone", () => {
  it("shows only the last 2 digits", () => {
    expect(maskPhone("+919876543210")).toBe("+•• •••• ••10");
  });

  it("never reveals more than 2 digits regardless of input format", () => {
    const masked = maskPhone("(987) 654-3210");
    const digitsInOutput = masked.replace(/[^\d]/g, "");
    expect(digitsInOutput.length).toBe(2);
  });

  it("handles short/invalid input safely without throwing", () => {
    expect(() => maskPhone("12")).not.toThrow();
    expect(maskPhone("12")).toBe("•••• ••••");
  });
});
