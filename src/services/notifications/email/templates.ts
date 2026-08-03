import { emailLayout } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export type EmailTemplateKey =
  | "welcome"
  | "pet_registered"
  | "lost_mode_enabled"
  | "lost_mode_disabled"
  | "found_report_submitted"
  | "vaccination_reminder"
  | "subscription_reminder"
  | "payment_success"
  | "payment_failure"
  | "order_shipped"
  | "tag_scanned"
  | "admin_notification";

export interface EmailContent {
  subject: string;
  html: string;
}

/**
 * Renders subject + HTML for a given template key and payload. Keeping this
 * as one exhaustive switch (rather than scattered files) makes it obvious
 * at a glance which templates exist and what payload shape each expects —
 * important since payloads round-trip through a JSON column.
 */
export function renderEmail(templateKey: EmailTemplateKey, payload: Record<string, any>): EmailContent {
  switch (templateKey) {
    case "welcome":
      return {
        subject: "Welcome to PetLink",
        html: emailLayout({
          heading: `Welcome, ${payload.fullName ?? "there"}`,
          body: `Your account is ready. Register your first pet to generate a secure, scannable ID tag — anyone who finds them can reach you in seconds, no app required.`,
          ctaLabel: "Add your first pet",
          ctaUrl: `${APP_URL}/dashboard/pets/new`,
        }),
      };

    case "pet_registered":
      return {
        subject: `${payload.petName}'s tag is ready`,
        html: emailLayout({
          heading: `${payload.petName} is on PetLink`,
          body: `We generated a secure QR tag for ${payload.petName}. Download it, print it, and attach it to their collar — scanning it instantly shows your contact info to whoever finds them.`,
          ctaLabel: "View tag & QR code",
          ctaUrl: `${APP_URL}/dashboard/pets/${payload.petId}`,
        }),
      };

    case "lost_mode_enabled":
      return {
        subject: `Lost mode is on for ${payload.petName}`,
        html: emailLayout({
          heading: `${payload.petName} is marked lost`,
          body: `Their public tag page now shows a lost banner, and anyone scanning it will be prompted to help. We'll notify you the moment someone submits a found report.`,
          ctaLabel: "View public tag page",
          ctaUrl: `${APP_URL}/p/${payload.petSlug}`,
        }),
      };

    case "lost_mode_disabled":
      return {
        subject: `${payload.petName} is marked as found`,
        html: emailLayout({
          heading: `Glad ${payload.petName} is safe`,
          body: `Lost mode has been turned off. Their tag page is back to normal.`,
        }),
      };

    case "found_report_submitted":
      return {
        subject: `Someone found ${payload.petName ?? "your pet"}`,
        html: emailLayout({
          heading: "A finder just reached out",
          body: `<strong>Message:</strong> ${escapeHtml(payload.message ?? "")}`,
          ctaLabel: "View pet dashboard",
          ctaUrl: `${APP_URL}/dashboard/pets`,
        }),
      };

    case "vaccination_reminder":
      return {
        subject: `${payload.petName}'s ${payload.vaccineName} is due soon`,
        html: emailLayout({
          heading: "Vaccination reminder",
          body: `${payload.petName}'s ${payload.vaccineName} vaccination is due on ${payload.dueDate}. Keeping records current helps if they're ever lost and a shelter or vet scans their tag.`,
          ctaLabel: "Update medical records",
          ctaUrl: `${APP_URL}/dashboard/pets/${payload.petId}`,
        }),
      };

    case "subscription_reminder":
      return {
        subject: "Your PetLink plan renews soon",
        html: emailLayout({
          heading: "Upcoming renewal",
          body: `Your ${payload.planName} plan renews on ${payload.renewsAt}. No action needed if everything looks right.`,
          ctaLabel: "Manage billing",
          ctaUrl: `${APP_URL}/dashboard/billing`,
        }),
      };

    case "payment_success":
      return {
        subject: "Payment received",
        html: emailLayout({
          heading: "Thanks — payment received",
          body: `We received your payment of ${payload.amount} ${payload.currency}. Your invoice is available in your billing dashboard.`,
          ctaLabel: "View invoice",
          ctaUrl: `${APP_URL}/dashboard/billing`,
        }),
      };

    case "payment_failure":
      return {
        subject: "We couldn't process your payment",
        html: emailLayout({
          heading: "Payment didn't go through",
          body: `We couldn't charge your card for ${payload.amount} ${payload.currency}. Update your payment method to avoid any interruption.`,
          ctaLabel: "Update payment method",
          ctaUrl: `${APP_URL}/dashboard/billing`,
        }),
      };

    case "order_shipped":
      return {
        subject: `Your ${payload.productName ?? "PetLink tag"} has shipped`,
        html: emailLayout({
          heading: "Your order is on its way",
          body: `Your ${payload.productName ?? "tag"} (${payload.quantity ?? 1}x) has shipped${
            payload.trackingNote ? ` — ${payload.trackingNote}` : ""
          }. Once it arrives, scan it to link it to your pet.`,
          ctaLabel: "View your orders",
          ctaUrl: `${APP_URL}/dashboard/orders`,
        }),
      };

    case "tag_scanned":
      return {
        subject: `${payload.petName ?? "Your pet"}'s tag was just scanned`,
        html: emailLayout({
          heading: "Someone scanned a tag",
          body: `${payload.petName ?? "Your pet"}'s tag was scanned ${
            payload.isLost ? "— they're currently marked lost, so this could be good news." : "just now."
          } If this wasn't you checking the page, it might be worth a look.`,
          ctaLabel: "View pet profile",
          ctaUrl: `${APP_URL}/dashboard/pets`,
        }),
      };

    case "admin_notification":
      return {
        subject: payload.subject ?? "PetLink admin notification",
        html: emailLayout({ heading: payload.subject ?? "Admin notification", body: escapeHtml(payload.message ?? "") }),
      };
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
