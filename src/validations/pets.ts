import { z } from "zod";

export const petSpeciesValues = ["DOG", "CAT", "BIRD", "RABBIT", "REPTILE", "OTHER"] as const;

export const createPetSchema = z.object({
  name: z.string().trim().min(1, "Give your pet a name").max(60),
  species: z.enum(petSpeciesValues),
  breed: z.string().trim().max(80).optional().or(z.literal("")),
  color: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreatePetInput = z.infer<typeof createPetSchema>;

export const updatePetSchema = createPetSchema.partial().extend({
  petId: z.string().uuid(),
});
export type UpdatePetInput = z.infer<typeof updatePetSchema>;

export const toggleLostModeSchema = z.object({
  petId: z.string().uuid(),
  isLost: z.boolean(),
  lastSeenNotes: z.string().trim().max(300).optional().or(z.literal("")),
});
export type ToggleLostModeInput = z.infer<typeof toggleLostModeSchema>;

export const contactPrefsSchema = z.object({
  petId: z.string().uuid(),
  showCallButton: z.boolean(),
  showWhatsappButton: z.boolean(),
  showLastSeenNote: z.boolean(),
});
export type ContactPrefsInput = z.infer<typeof contactPrefsSchema>;
