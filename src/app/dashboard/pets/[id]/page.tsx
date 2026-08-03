import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPetForOwner, NotFoundError } from "@/services/pets/pets.service";
import { SpeciesTag } from "@/components/pet/badges";
import { LostModeToggle } from "@/components/pet/lost-mode-toggle";
import { ContactPrefsPanel } from "@/components/pet/contact-prefs-panel";
import { Button } from "@/components/ui/button";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { SuccessBurst } from "@/components/motion/success-burst";

export default async function PetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const { authUser, user } = await requireUser();

  let pet;
  try {
    pet = await getPetForOwner(authUser.id, user.id, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${pet.publicSlug}`;

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16">
      <SuccessBurst trigger={created === "true"} />
      {created === "true" && (
        <>
          <EventOnMount
            event={ANALYTICS_EVENTS.PET_CREATED}
            params={{ petId: pet.id, species: pet.species }}
            stripQueryParam="created"
          />
          <EventOnMount event={ANALYTICS_EVENTS.QR_GENERATED} params={{ petId: pet.id }} />
        </>
      )}
      <div className="mb-8 flex items-center gap-3">
        <h1 className="font-display text-3xl font-medium text-ink">{pet.name}</h1>
        <SpeciesTag species={pet.species} />
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-tag border border-line bg-white/50 p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${pet.id}`}
            alt={`QR code for ${pet.name}`}
            className="mx-auto mb-4 h-40 w-40 rounded-lg border border-line"
          />
          <a href={`/api/qr/${pet.id}`} download className="text-sm text-brass-dark underline underline-offset-4">
            Download QR (PNG)
          </a>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-tag border border-line bg-white/50 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Public scan page</p>
          <p className="break-all font-mono text-sm text-ink">{scanUrl}</p>
          <Link href={`/p/${pet.publicSlug}`} target="_blank">
            <Button variant="ghost" className="w-auto">
              Preview public page →
            </Button>
          </Link>
        </div>
      </div>

      <LostModeToggle petId={pet.id} isLost={pet.isLost} />

      <div className="mt-6">
        <ContactPrefsPanel
          petId={pet.id}
          initialShowCall={pet.showCallButton}
          initialShowWhatsapp={pet.showWhatsappButton}
          initialShowLastSeenNote={pet.showLastSeenNote}
        />
      </div>
    </div>
  );
}
