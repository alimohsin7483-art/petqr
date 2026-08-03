import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "auth-1" } } }) },
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: async () => ({
        id: "user-1",
        authUserId: "auth-1",
        role: "OWNER",
        deletedAt: null,
      }),
    },
  },
}));

const { requireRole, ForbiddenError } = await import("@/lib/auth");

describe("requireRole", () => {
  it("resolves when the user has an allowed role", async () => {
    const ctx = await requireRole("OWNER", "ADMIN");
    expect(ctx.user.role).toBe("OWNER");
  });

  it("throws ForbiddenError when the user's role isn't in the allow-list", async () => {
    await expect(requireRole("ADMIN")).rejects.toBeInstanceOf(ForbiddenError);
  });
});
