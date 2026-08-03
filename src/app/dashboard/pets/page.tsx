import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listPetsForOwner } from "@/services/pets/pets.service";
import { Button } from "@/components/ui/button";
import { SpeciesTag } from "@/components/pet/badges";

export default async function PetsListPage() {
  const { authUser, user } = await requireUser();
  const pets = await listPetsForOwner(authUser.id, user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
            Your pets
          </p>
          <h1 className="font-display text-3xl font-medium text-ink">Every tag, one place</h1>
        </div>
        <Link href="/dashboard/pets/new">
          <Button className="w-auto">Add a pet</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-tag border border-dashed border-line p-10 text-center">
          <p className="mb-4 text-sm text-ink/60">
            No pets yet. Register your first one and we'll generate a scannable tag instantly.
          </p>
          <Link href="/dashboard/pets/new">
            <Button className="mx-auto w-auto">Add your first pet</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pets.map((pet) => (
            <li key={pet.id}>
              <Link
                href={`/dashboard/pets/${pet.id}`}
                className="flex items-center justify-between rounded-tag border border-line bg-white/50 px-6 py-4 transition-colors hover:border-brass"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg text-ink">{pet.name}</span>
                  <SpeciesTag species={pet.species} />
                  {pet.isLost && (
                    <span className="rounded-full bg-alert/10 px-2.5 py-0.5 text-xs font-medium text-alert">
                      Lost
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-ink/40">/{pet.publicSlug}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
