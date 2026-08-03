"use client";

import { useState } from "react";
import { claimPhysicalTagAction, createPetAndClaimTagAction } from "@/actions/shop";
import { petSpeciesValues } from "@/validations/pets";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SuccessBurst } from "@/components/motion/success-burst";
import { motion } from "framer-motion";

export function ClaimTagForm({
  slug,
  existingPets,
}: {
  slug: string;
  existingPets: { id: string; name: string }[];
}) {
  const [mode, setMode] = useState<"existing" | "new">(existingPets.length > 0 ? "existing" : "new");
  const [selectedPetId, setSelectedPetId] = useState(existingPets[0]?.id ?? "");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result =
      mode === "existing"
        ? await claimPhysicalTagAction(slug, selectedPetId)
        : await createPetAndClaimTagAction(slug, { name, species: species as any });

    setPending(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    setClaimed(true);
  }

  if (claimed) {
    return (
      <div className="relative rounded-tag border border-found/30 bg-found/5 p-6 text-center">
        <SuccessBurst trigger={claimed} />
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="font-medium text-found"
        >
          Tag claimed! Refresh this page to see the profile.
        </motion.p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {existingPets.length > 0 && (
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={mode === "existing" ? "font-medium text-ink underline" : "text-ink/50"}
          >
            Use an existing pet
          </button>
          <span className="text-ink/30">·</span>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={mode === "new" ? "font-medium text-ink underline" : "text-ink/50"}
          >
            Register a new pet
          </button>
        </div>
      )}

      {mode === "existing" ? (
        <Select
          label="Which pet is this tag for?"
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
        >
          {existingPets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </Select>
      ) : (
        <>
          <Field label="Pet name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Select label="Species" value={species} onChange={(e) => setSpecies(e.target.value)}>
            {petSpeciesValues.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </>
      )}

      {error && <p className="text-sm text-alert">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Claiming…" : "Claim this tag"}
      </Button>
    </form>
  );
}
