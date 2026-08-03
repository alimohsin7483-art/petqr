import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema, resetPasswordSchema } from "@/validations/auth";

describe("signUpSchema", () => {
  it("accepts a valid signup payload", () => {
    const result = signUpSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "Sup3rSecret!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = signUpSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "lowercase123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 10 characters", () => {
    const result = signUpSchema.safeParse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "Sh0rt!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      fullName: "Jane Doe",
      email: "not-an-email",
      password: "Sup3rSecret!",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("requires a non-empty password", () => {
    const result = signInSchema.safeParse({ email: "jane@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Sup3rSecret!",
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching strong passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Sup3rSecret!",
      confirmPassword: "Sup3rSecret!",
    });
    expect(result.success).toBe(true);
  });
});
