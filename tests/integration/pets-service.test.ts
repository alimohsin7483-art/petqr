import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  subscription: { findFirst: vi.fn() },
  pet: { count: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
  withRLS: async (_authUserId: string, callback: (tx: any) => any) => callback(mockPrisma),
}));

const { createPet, PlanLimitError } = await import("@/services/pets/pets.service");

describe("createPet — plan limit enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws PlanLimitError when the owner is already at their plan's pet limit", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      plan: { maxPets: 1 },
    });
    mockPrisma.pet.count.mockResolvedValue(1); // already at the free-tier limit

    await expect(
      createPet("auth-user-1", "owner-1", { name: "Bruno", species: "DOG" })
    ).rejects.toBeInstanceOf(PlanLimitError);

    expect(mockPrisma.pet.create).not.toHaveBeenCalled();
  });

  it("allows creation when under the plan limit", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      plan: { maxPets: 5 },
    });
    mockPrisma.pet.count.mockResolvedValue(1);
    mockPrisma.pet.findUnique.mockResolvedValue(null); // slug is free
    mockPrisma.pet.create.mockResolvedValue({
      id: "pet-1",
      name: "Bruno",
      publicSlug: "abc1234567",
      qrCodes: [{ slug: "abc1234567" }],
    });

    const pet = await createPet("auth-user-1", "owner-1", { name: "Bruno", species: "DOG" });

    expect(pet.name).toBe("Bruno");
    expect(mockPrisma.pet.create).toHaveBeenCalledTimes(1);
  });

  it("falls back to the free tier limit (1 pet) when no subscription row exists", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.pet.count.mockResolvedValue(1);

    await expect(
      createPet("auth-user-1", "owner-1", { name: "Bruno", species: "DOG" })
    ).rejects.toBeInstanceOf(PlanLimitError);
  });
});
