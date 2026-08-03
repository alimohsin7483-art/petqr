import "server-only";
import { prisma, withRLS } from "@/lib/db";
import type { FoundReportInput } from "@/validations/found-report";
import { queueNotification } from "@/services/notifications/queue";

export class PetNotFoundError extends Error {}

/** All found-report messages for pets this owner actually owns — powers the in-app inbox. */
export async function listFoundReportsForOwner(authUserId: string, ownerId: string) {
  return withRLS(authUserId, (tx) =>
    tx.foundReport.findMany({
      where: { pet: { ownerId } },
      orderBy: { createdAt: "desc" },
      include: { pet: { select: { name: true, publicSlug: true } } },
    })
  );
}

/** Count of not-yet-viewed messages — powers the dashboard badge. */
export async function countUnreadFoundReportsForOwner(authUserId: string, ownerId: string) {
  return withRLS(authUserId, (tx) =>
    tx.foundReport.count({ where: { pet: { ownerId }, isRead: false } })
  );
}

/** Marks every found report for this owner as read — called when they open the inbox. */
export async function markAllFoundReportsReadForOwner(authUserId: string, ownerId: string) {
  return withRLS(authUserId, (tx) =>
    tx.foundReport.updateMany({ where: { pet: { ownerId }, isRead: false }, data: { isRead: true } })
  );
}

async function resolvePetIdBySlug(slug: string): Promise<string | null> {
  const pet = await prisma.pet.findFirst({ where: { publicSlug: slug, deletedAt: null }, select: { id: true } });
  if (pet) return pet.id;

  const tag = await prisma.physicalTag.findUnique({ where: { slug } });
  if (tag?.status === "CLAIMED" && tag.petId) return tag.petId;

  return null;
}

/** Public read model — safe fields only, used by the /p/[slug] page and OG image route. */
export async function getPublicPetProfile(slug: string) {
  const pet = await prisma.pet.findFirst({
    where: { publicSlug: slug, deletedAt: null },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      avatarUrl: true,
      isLost: true,
      bio: true,
      showCallButton: true,
      showWhatsappButton: true,
      showLastSeenNote: true,
      owner: { select: { fullName: true } },
      lostReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { notes: true, lastSeenAt: true },
      },
    },
  });
  return pet;
}

/** Same shape as getPublicPetProfile, looked up by internal ID — used when a
 * request arrives via a claimed physical tag's slug rather than the pet's
 * own publicSlug. */
export async function getPublicPetProfileById(petId: string) {
  const pet = await prisma.pet.findFirst({
    where: { id: petId, deletedAt: null },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      avatarUrl: true,
      isLost: true,
      bio: true,
      showCallButton: true,
      showWhatsappButton: true,
      showLastSeenNote: true,
      owner: { select: { fullName: true } },
      lostReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { notes: true, lastSeenAt: true },
      },
    },
  });
  return pet;
}

export async function getOwnerContactPhoneByPetId(petId: string): Promise<string | null> {
  const pet = await prisma.pet.findFirst({
    where: { id: petId, deletedAt: null },
    select: { owner: { select: { phone: true } } },
  });
  return pet?.owner.phone ?? null;
}

const SCAN_ALERT_COOLDOWN_MINUTES = 30;

/**
 * Alerts the owner that their pet's tag was scanned — but not on every single
 * view. Two guardrails: (1) skipped entirely if the viewer is signed in as
 * the pet's own owner, so previewing your own page never self-notifies; (2)
 * rate-limited to once per cooldown window per pet, so a finder repeatedly
 * refreshing the page doesn't spam the owner's inbox.
 */
export async function notifyTagScanned(
  petId: string,
  viewerAuthUserId: string | null
): Promise<void> {
  const pet = await prisma.pet.findFirst({
    where: { id: petId, deletedAt: null },
    select: { name: true, isLost: true, owner: { select: { authUserId: true } } },
  });
  if (!pet) return;

  if (viewerAuthUserId && viewerAuthUserId === pet.owner.authUserId) return; // owner previewing their own page

  const recentAlert = await prisma.notificationJob.findFirst({
    where: {
      templateKey: "tag_scanned",
      entityId: petId,
      createdAt: { gte: new Date(Date.now() - SCAN_ALERT_COOLDOWN_MINUTES * 60_000) },
    },
  });
  if (recentAlert) return;

  await queueNotification({
    channel: "EMAIL",
    templateKey: "tag_scanned",
    entityType: "pet",
    entityId: petId,
    payload: { petName: pet.name, isLost: pet.isLost },
  });
}

export async function submitFoundReport(input: FoundReportInput) {
  const petId = await resolvePetIdBySlug(input.slug);
  if (!petId) throw new PetNotFoundError("Pet not found");

  const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { id: true, name: true } });
  if (!pet) throw new PetNotFoundError("Pet not found");

  const report = await prisma.foundReport.create({
    data: {
      petId: pet.id,
      finderName: input.finderName || null,
      finderPhone: input.finderPhone || null,
      finderEmail: input.finderEmail || null,
      message: input.message,
    },
  });

  return { ...report, petName: pet.name };
}

/**
 * Resolves the owner's real phone number for click-to-call/WhatsApp redirects.
 * Deliberately NOT exposed to the client — only used server-side by the
 * /api/contact redirect route, which bypasses RLS via the raw prisma client
 * (service-role equivalent) since there is no authenticated finder session.
 */
export async function getOwnerContactPhone(slug: string): Promise<string | null> {
  const pet = await prisma.pet.findFirst({
    where: { publicSlug: slug, deletedAt: null },
    select: { owner: { select: { phone: true } } },
  });
  return pet?.owner.phone ?? null;
}

export async function getContactInfoForRedirect(
  slug: string
): Promise<{ phone: string | null; showCallButton: boolean; showWhatsappButton: boolean } | null> {
  const petId = await resolvePetIdBySlug(slug);
  if (!petId) return null;

  const pet = await prisma.pet.findFirst({
    where: { id: petId, deletedAt: null },
    select: { showCallButton: true, showWhatsappButton: true, owner: { select: { phone: true } } },
  });
  if (!pet) return null;

  return {
    phone: pet.owner.phone,
    showCallButton: pet.showCallButton,
    showWhatsappButton: pet.showWhatsappButton,
  };
}
