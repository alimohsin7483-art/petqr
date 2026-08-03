import "server-only";
import { withRLS, prisma } from "@/lib/db";
import { newPublicSlug } from "@/services/qr/qrcode";
import type { CreatePetInput, UpdatePetInput } from "@/validations/pets";

export class PlanLimitError extends Error {}
export class NotFoundError extends Error {}

async function getActivePetLimit(userId: string): Promise<number> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  // No subscription row (shouldn't normally happen) falls back to the free tier's limit.
  return subscription?.plan.maxPets ?? 1;
}

export async function listPetsForOwner(authUserId: string, ownerId: string) {
  return withRLS(authUserId, (tx) =>
    tx.pet.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { qrCodes: { where: { isActive: true }, take: 1 } },
    })
  );
}

export async function getPetForOwner(authUserId: string, ownerId: string, petId: string) {
  const pet = await withRLS(authUserId, (tx) =>
    tx.pet.findFirst({
      where: { id: petId, ownerId, deletedAt: null },
      include: {
        qrCodes: { where: { isActive: true }, take: 1 },
        vaccinations: { orderBy: { administeredAt: "desc" } },
      },
    })
  );
  if (!pet) throw new NotFoundError("Pet not found");
  return pet;
}

export async function createPet(authUserId: string, ownerId: string, input: CreatePetInput) {
  const [limit, currentCount] = await Promise.all([
    getActivePetLimit(ownerId),
    prisma.pet.count({ where: { ownerId, deletedAt: null } }),
  ]);

  if (currentCount >= limit) {
    throw new PlanLimitError(
      `Your current plan allows up to ${limit} pet${limit === 1 ? "" : "s"}. Upgrade to add more.`
    );
  }

  // Slugs are short — retry on the rare collision rather than trusting a single draw.
  let slug = newPublicSlug();
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await prisma.pet.findUnique({ where: { publicSlug: slug } });
    if (!existing) break;
    slug = newPublicSlug();
  }

  return withRLS(authUserId, (tx) =>
    tx.pet.create({
      data: {
        ownerId,
        publicSlug: slug,
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        color: input.color || null,
        bio: input.bio || null,
        qrCodes: { create: { slug, isActive: true } },
      },
      include: { qrCodes: true },
    })
  );
}

export async function updatePet(authUserId: string, ownerId: string, input: UpdatePetInput) {
  const { petId, ...rest } = input;
  return withRLS(authUserId, async (tx) => {
    const pet = await tx.pet.findFirst({ where: { id: petId, ownerId, deletedAt: null } });
    if (!pet) throw new NotFoundError("Pet not found");

    return tx.pet.update({
      where: { id: petId },
      data: {
        ...(rest.name !== undefined ? { name: rest.name } : {}),
        ...(rest.species !== undefined ? { species: rest.species } : {}),
        ...(rest.breed !== undefined ? { breed: rest.breed || null } : {}),
        ...(rest.color !== undefined ? { color: rest.color || null } : {}),
        ...(rest.bio !== undefined ? { bio: rest.bio || null } : {}),
      },
    });
  });
}

export async function toggleLostMode(
  authUserId: string,
  ownerId: string,
  petId: string,
  isLost: boolean,
  notes?: string
) {
  return withRLS(authUserId, async (tx) => {
    const pet = await tx.pet.findFirst({ where: { id: petId, ownerId, deletedAt: null } });
    if (!pet) throw new NotFoundError("Pet not found");

    const updated = await tx.pet.update({
      where: { id: petId },
      data: { isLost, lostSince: isLost ? new Date() : null },
    });

    if (isLost) {
      await tx.lostReport.create({
        data: { petId, lastSeenAt: new Date(), notes: notes || null },
      });
    }

    return updated;
  });
}

export async function deletePet(authUserId: string, ownerId: string, petId: string) {
  return withRLS(authUserId, async (tx) => {
    const pet = await tx.pet.findFirst({ where: { id: petId, ownerId, deletedAt: null } });
    if (!pet) throw new NotFoundError("Pet not found");
    return tx.pet.update({ where: { id: petId }, data: { deletedAt: new Date() } });
  });
}

export async function updateContactPrefs(
  authUserId: string,
  ownerId: string,
  petId: string,
  prefs: { showCallButton: boolean; showWhatsappButton: boolean; showLastSeenNote: boolean }
) {
  return withRLS(authUserId, async (tx) => {
    const pet = await tx.pet.findFirst({ where: { id: petId, ownerId, deletedAt: null } });
    if (!pet) throw new NotFoundError("Pet not found");
    return tx.pet.update({ where: { id: petId }, data: prefs });
  });
}
