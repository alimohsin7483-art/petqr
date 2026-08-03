import "server-only";
import { prisma } from "@/lib/db";
import { getResendClient, RESEND_FROM } from "@/lib/resend";
import { renderEmail, type EmailTemplateKey } from "./templates";
import type { NotificationJob } from "@prisma/client";

/**
 * Resolves the email address to send to for a given job's polymorphic
 * entity reference. Each entityType knows how to find its own recipient.
 */
async function resolveRecipient(job: NotificationJob): Promise<string | null> {
  switch (job.entityType) {
    case "admin": {
      return process.env.ADMIN_NOTIFICATION_EMAIL ?? null;
    }
    case "user": {
      const user = await prisma.user.findUnique({ where: { id: job.entityId } });
      return user?.email ?? null;
    }
    case "pet": {
      const pet = await prisma.pet.findUnique({
        where: { id: job.entityId },
        include: { owner: true },
      });
      return pet?.owner.email ?? null;
    }
    case "found_report": {
      const report = await prisma.foundReport.findUnique({
        where: { id: job.entityId },
        include: { pet: { include: { owner: true } } },
      });
      return report?.pet.owner.email ?? null;
    }
    default:
      return null;
  }
}

async function ownerAllowsEmail(job: NotificationJob): Promise<boolean> {
  const email = await resolveRecipient(job);
  if (!email) return false;
  const user = await prisma.user.findFirst({
    where: { email },
    include: { notificationPrefs: true },
  });
  // Default to allowed if no preference row exists yet.
  return user?.notificationPrefs?.emailEnabled ?? true;
}

export async function sendEmailForJob(job: NotificationJob): Promise<void> {
  const recipient = await resolveRecipient(job);
  if (!recipient) throw new Error(`No email recipient found for job ${job.id}`);

  const allowed = await ownerAllowsEmail(job);
  if (!allowed) return; // respected opt-out — treated as a successful no-op, not a failure

  const { subject, html } = renderEmail(job.templateKey as EmailTemplateKey, job.payload as Record<string, any>);

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to: recipient,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
}
