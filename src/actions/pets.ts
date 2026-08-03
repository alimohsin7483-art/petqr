"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createPetSchema,
  updatePetSchema,
  toggleLostModeSchema,
  contactPrefsSchema,
  type CreatePetInput,
  type UpdatePetInput,
  type ToggleLostModeInput,
  type ContactPrefsInput,
} from "@/validations/pets";
import * as petsService from "@/services/pets/pets.service";
import { queueNotification } from "@/services/notifications/queue";

type ActionResult = { error: string } | { success: true };

export async function createPetAction(input: CreatePetInput): Promise<ActionResult> {
  const parsed = createPetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  try {
    const { authUser, user } = await getCurrentUser();
    const pet = await petsService.createPet(authUser.id, user.id, parsed.data);

    await queueNotification({
      channel: "EMAIL",
      templateKey: "pet_registered",
      entityType: "pet",
      entityId: pet.id,
      payload: { petId: pet.id, petName: pet.name },
    });
    if (user.phone) {
      await queueNotification({
        channel: "WHATSAPP",
        templateKey: "pet_registered",
        entityType: "pet",
        entityId: pet.id,
        payload: { petId: pet.id, petName: pet.name },
      });
    }

    revalidatePath("/dashboard/pets");
    redirect(`/dashboard/pets/${pet.id}?created=true`);
  } catch (err) {
    if (err instanceof petsService.PlanLimitError) return { error: err.message };
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: "Couldn't create pet. Try again." };
  }
}

export async function updatePetAction(input: UpdatePetInput): Promise<ActionResult> {
  const parsed = updatePetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  try {
    const { authUser, user } = await getCurrentUser();
    await petsService.updatePet(authUser.id, user.id, parsed.data);
    revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
    return { success: true };
  } catch {
    return { error: "Couldn't save changes. Try again." };
  }
}

export async function toggleLostModeAction(input: ToggleLostModeInput): Promise<ActionResult> {
  const parsed = toggleLostModeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  try {
    const { authUser, user } = await getCurrentUser();
    const pet = await petsService.toggleLostMode(
      authUser.id,
      user.id,
      parsed.data.petId,
      parsed.data.isLost,
      parsed.data.lastSeenNotes
    );

    const templateKey = parsed.data.isLost ? "lost_mode_enabled" : "lost_mode_disabled";
    await queueNotification({
      channel: "EMAIL",
      templateKey,
      entityType: "pet",
      entityId: pet.id,
      payload: { petId: pet.id, petName: pet.name, petSlug: pet.publicSlug },
    });
    if (parsed.data.isLost && user.phone) {
      await queueNotification({
        channel: "WHATSAPP",
        templateKey: "lost_mode_enabled",
        entityType: "pet",
        entityId: pet.id,
        payload: { petId: pet.id, petName: pet.name, petSlug: pet.publicSlug },
      });
    }

    revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
    revalidatePath(`/p`); // public page cache for this pet is revalidated by slug on read
    return { success: true };
  } catch {
    return { error: "Couldn't update lost mode. Try again." };
  }
}

export async function deletePetAction(petId: string): Promise<ActionResult> {
  try {
    const { authUser, user } = await getCurrentUser();
    await petsService.deletePet(authUser.id, user.id, petId);
    revalidatePath("/dashboard/pets");
    return { success: true };
  } catch {
    return { error: "Couldn't remove pet. Try again." };
  }
}

export async function updateContactPrefsAction(input: ContactPrefsInput): Promise<ActionResult> {
  const parsed = contactPrefsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };

  try {
    const { authUser, user } = await getCurrentUser();
    await petsService.updateContactPrefs(authUser.id, user.id, parsed.data.petId, {
      showCallButton: parsed.data.showCallButton,
      showWhatsappButton: parsed.data.showWhatsappButton,
      showLastSeenNote: parsed.data.showLastSeenNote,
    });
    revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
    return { success: true };
  } catch {
    return { error: "Couldn't save preferences. Try again." };
  }
}
