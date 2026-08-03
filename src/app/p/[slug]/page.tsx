import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicPetProfile,
  getPublicPetProfileById,
  getOwnerContactPhone,
  getOwnerContactPhoneByPetId,
  notifyTagScanned,
} from "@/services/pets/found-reports.service";
import { findTagBySlug } from "@/services/shop/tags.service";
import { listPetsForOwner } from "@/services/pets/pets.service";
import { getCurrentUser } from "@/lib/auth";
import { LostBanner, SpeciesTag } from "@/components/pet/badges";
import { FoundReportForm } from "@/components/pet/found-report-form";
import { ClaimTagForm } from "@/components/shop/claim-tag-form";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { maskPhone } from "@/lib/mask";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let pet = await getPublicPetProfile(slug);

  if (!pet) {
    const tag = await findTagBySlug(slug);
    if (tag?.status === "CLAIMED" && tag.petId) {
      pet = await getPublicPetProfileById(tag.petId);
    } else if (tag) {
      return { title: "Claim your PetLink tag", robots: { index: false } };
    }
  }

  if (!pet) return { title: "Tag not found" };

  const title = pet.isLost ? `Help find ${pet.name} · PetLink` : `${pet.name} · PetLink`;
  const description = pet.isLost
    ? `${pet.name} is reported lost. Scan or tap to reach the owner.`
    : `${pet.name}'s PetLink profile. Scan the tag to reach the owner.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [`/api/og/${slug}`] },
    twitter: { card: "summary_large_image", title, description, images: [`/api/og/${slug}`] },
    robots: { index: false }, // individual pet pages aren't meant for search indexing
  };
}

export default async function PublicPetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let pet = await getPublicPetProfile(slug);
  let phone = pet ? await getOwnerContactPhone(slug) : null;

  if (!pet) {
    const tag = await findTagBySlug(slug);
    if (!tag) notFound();

    if (tag.status === "UNCLAIMED") {
      return <ClaimTagPage slug={slug} />;
    }

    // Claimed — resolve through the linked pet instead.
    pet = await getPublicPetProfileById(tag.petId!);
    if (!pet) notFound();
    phone = await getOwnerContactPhoneByPetId(tag.petId!);
  }

  // Fire the "your pet's tag was scanned" alert — guardrails (cooldown,
  // owner-preview exclusion) live inside notifyTagScanned itself.
  let viewerAuthUserId: string | null = null;
  try {
    const { authUser } = await getCurrentUser();
    viewerAuthUserId = authUser.id;
  } catch {
    // Not signed in — a real finder, which is exactly who should trigger the alert.
  }
  await notifyTagScanned(pet.id, viewerAuthUserId);

  return (
    <div className="flex min-h-screen justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-[440px]">
        <EventOnMount
          event={ANALYTICS_EVENTS.QR_SCANNED}
          params={{ slug, isLost: pet.isLost }}
        />
        <div className="rounded-tag border border-line bg-white/60 p-8">
          <LostBanner
            isLost={pet.isLost}
            lastSeenNote={pet.showLastSeenNote ? pet.lostReports?.[0]?.notes : null}
            lastSeenAt={pet.lostReports?.[0]?.lastSeenAt}
          />

          <div className="mb-6 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pet.avatarUrl ?? "/pet-placeholder.png"}
              alt={pet.name}
              className="h-20 w-20 rounded-full border border-line object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-medium text-ink">{pet.name}</h1>
              <div className="mt-1 flex gap-2">
                <SpeciesTag species={pet.species} />
                {pet.breed && (
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
                    {pet.breed}
                  </span>
                )}
              </div>
            </div>
          </div>

          {pet.bio && <p className="mb-6 text-sm text-ink/70">{pet.bio}</p>}

          {phone && (pet.showCallButton || pet.showWhatsappButton) && (
            <div className="mb-6 rounded-tag border border-line bg-paper p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/50">
                Reach {pet.owner.fullName?.split(" ")[0] ?? "the owner"}
              </p>
              <p className="mb-4 font-mono text-sm text-ink/60">{maskPhone(phone)}</p>
              <div className="flex gap-3">
                {pet.showCallButton && (
                  <a
                    href={`/api/contact/${slug}?type=call`}
                    className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-sm font-medium text-paper hover:bg-brass-dark"
                  >
                    Call
                  </a>
                )}
                {pet.showWhatsappButton && (
                  <a
                    href={`/api/contact/${slug}?type=whatsapp`}
                    className="flex-1 rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink hover:border-brass"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
              Or send a message instead
            </p>
            <FoundReportForm slug={slug} />
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-ink/30">
          Protected by PetLink · petlink.app
        </p>
      </div>
    </div>
  );
}

/** Shown when a physical tag has been paid for and shipped, but not yet linked to a pet. */
async function ClaimTagPage({ slug }: { slug: string }) {
  let signedIn = false;
  let pets: { id: string; name: string }[] = [];

  try {
    const { authUser, user } = await getCurrentUser();
    signedIn = true;
    pets = await listPetsForOwner(authUser.id, user.id);
  } catch {
    signedIn = false;
  }

  return (
    <div className="flex min-h-screen justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="rounded-tag border border-line bg-white/60 p-8">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
            New tag
          </p>
          <h1 className="mb-2 font-display text-2xl font-medium text-ink">
            Let's set up this tag
          </h1>
          <p className="mb-6 text-sm text-ink/60">
            This tag hasn't been linked to a pet yet. Sign in to connect it to one of your pets,
            or register a new one.
          </p>

          {signedIn ? (
            <ClaimTagForm slug={slug} existingPets={pets} />
          ) : (
            <Link href={`/sign-in?next=/p/${slug}`}>
              <button className="w-full rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-paper hover:bg-brass-dark">
                Sign in to claim this tag
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
