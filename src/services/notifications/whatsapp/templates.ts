export type WhatsAppTemplateKey =
  | "welcome"
  | "pet_registered"
  | "lost_mode_enabled"
  | "found_report_submitted"
  | "vaccination_reminder";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export function renderWhatsAppMessage(
  templateKey: WhatsAppTemplateKey,
  payload: Record<string, any>
): string {
  switch (templateKey) {
    case "welcome":
      return `Welcome to PetLink, ${payload.fullName ?? "there"}! Add your first pet to get a scannable ID tag: ${APP_URL}/dashboard/pets/new`;
    case "pet_registered":
      return `${payload.petName}'s PetLink tag is ready. Download the QR code here: ${APP_URL}/dashboard/pets/${payload.petId}`;
    case "lost_mode_enabled":
      return `Lost mode is ON for ${payload.petName}. Their public tag now shows a lost banner: ${APP_URL}/p/${payload.petSlug}`;
    case "found_report_submitted":
      return `Someone just found ${payload.petName ?? "your pet"} and left a message: "${payload.message}"`;
    case "vaccination_reminder":
      return `${payload.petName}'s ${payload.vaccineName} vaccination is due on ${payload.dueDate}.`;
  }
}
