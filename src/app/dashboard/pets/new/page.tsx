"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createPetSchema, petSpeciesValues, type CreatePetInput } from "@/validations/pets";
import { createPetAction } from "@/actions/pets";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function NewPetPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePetInput>({
    resolver: zodResolver(createPetSchema),
    defaultValues: { species: "DOG" },
  });

  async function onSubmit(values: CreatePetInput) {
    setServerError(null);
    const result = await createPetAction(values);
    // Success path redirects server-side to the new pet's page.
    if (result && "error" in result) setServerError(result.error);
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Add a pet
      </p>
      <h1 className="mb-8 font-display text-3xl font-medium text-ink">Register a new pet</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <Field label="Name" error={errors.name?.message} {...register("name")} />
        <Select label="Species" error={errors.species?.message} {...register("species")}>
          {petSpeciesValues.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Field label="Breed (optional)" error={errors.breed?.message} {...register("breed")} />
        <Field label="Color (optional)" error={errors.color?.message} {...register("color")} />
        <Field
          label="Bio (optional)"
          placeholder="Friendly, microchipped, responds to 'Bruno'…"
          error={errors.bio?.message}
          {...register("bio")}
        />
        {serverError && <p className="text-sm text-alert">{serverError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating tag…" : "Create pet & generate QR"}
        </Button>
      </form>
    </div>
  );
}
