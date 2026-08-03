import "server-only";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "./client";
import { renderWhatsAppMessage, type WhatsAppTemplateKey } from "./templates";
import type { NotificationJob } from "@prisma/client";

async function resolveRecipientPhone(job: NotificationJob): Promise<string | null> {
  switch (job.entityType) {
    case "user": {
      const user = await prisma.user.findUnique({ where: { id: job.entityId } });
      return user?.phone ?? null;
    }
    case "pet": {
      const pet = await prisma.pet.findUnique({ where: { id: job.entityId }, include: { owner: true } });
      return pet?.owner.phone ?? null;
    }
    case "found_report": {
      const report = await prisma.foundReport.findUnique({
        where: { id: job.entityId },
        include: { pet: { include: { owner: true } } },
      });
      return report?.pet.owner.phone ?? null;
    }
    default:
      return null;
  }
}

async function ownerAllowsWhatsApp(phone: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { phone },
    include: { notificationPrefs: true },
  });
  return user?.notificationPrefs?.whatsappEnabled ?? true;
}

export async function sendWhatsAppForJob(job: NotificationJob): Promise<void> {
  const phone = await resolveRecipientPhone(job);
  if (!phone) throw new Error(`No WhatsApp recipient found for job ${job.id}`);

  const allowed = await ownerAllowsWhatsApp(phone);
  if (!allowed) return;

  const message = renderWhatsAppMessage(job.templateKey as WhatsAppTemplateKey, job.payload as Record<string, any>);
  await sendWhatsAppMessage(phone, message);
}
