import "server-only";
import { prisma } from "@/lib/db";
import { newPublicSlug } from "@/services/qr/qrcode";

export class TagNotFoundError extends Error {}
export class TagAlreadyClaimedError extends Error {}
export class NoUnclaimedTagsError extends Error {}

/** Admin: pre-generates a batch of unclaimed physical tags before anything is sold. */
export async function generateTagBatch(count: number): Promise<{ id: string; slug: string }[]> {
  const created: { id: string; slug: string }[] = [];

  for (let i = 0; i < count; i++) {
    let slug = newPublicSlug();
    // Check both tables — a physical tag slug must never collide with a
    // digital pet slug either, since both eventually resolve through /p/[slug].
    for (let attempt = 0; attempt < 3; attempt++) {
      const [existingTag, existingPet] = await Promise.all([
        prisma.physicalTag.findUnique({ where: { slug } }),
        prisma.pet.findUnique({ where: { publicSlug: slug } }),
      ]);
      if (!existingTag && !existingPet) break;
      slug = newPublicSlug();
    }

    const tag = await prisma.physicalTag.create({ data: { slug } });
    created.push({ id: tag.id, slug: tag.slug });
  }

  return created;
}

/**
 * Assigns `quantity` unclaimed, unassigned physical tags to a newly-paid
 * order. Called from the payment-success webhook handlers — never from a
 * user-facing action, since inventory assignment must be atomic and trusted.
 */
export async function assignTagsToOrder(orderId: string, quantity: number): Promise<void> {
  const available = await prisma.physicalTag.findMany({
    where: { orderId: null },
    take: quantity,
    orderBy: { createdAt: "asc" },
  });

  if (available.length < quantity) {
    // Don't fail the payment over this — flag it for manual fulfillment instead.
    console.error(
      `[shop] Not enough unassigned physical tags for order ${orderId}: needed ${quantity}, found ${available.length}`
    );
  }

  await Promise.all(
    available.map((tag) => prisma.physicalTag.update({ where: { id: tag.id }, data: { orderId } }))
  );
}

export async function findTagBySlug(slug: string) {
  return prisma.physicalTag.findUnique({ where: { slug } });
}

/**
 * Links an unclaimed physical tag to a pet — either an existing pet the
 * signed-in user already owns, or a brand-new one created on the spot.
 */
export async function claimPhysicalTag(
  slug: string,
  ownerId: string,
  petId: string
): Promise<void> {
  const tag = await prisma.physicalTag.findUnique({ where: { slug } });
  if (!tag) throw new TagNotFoundError("This tag code wasn't recognized.");
  if (tag.status === "CLAIMED") throw new TagAlreadyClaimedError("This tag has already been claimed.");

  const pet = await prisma.pet.findFirst({ where: { id: petId, ownerId, deletedAt: null } });
  if (!pet) throw new Error("Pet not found or not owned by this user.");

  await prisma.physicalTag.update({
    where: { id: tag.id },
    data: { status: "CLAIMED", petId, claimedAt: new Date() },
  });
}
