import "server-only";
import { prisma } from "@/lib/db";
import type { NotificationChannel, Prisma } from "@prisma/client";

export async function queueNotification(job: {
  channel: NotificationChannel;
  templateKey: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}) {
  // Module 4 adds the cron-triggered worker that reads QUEUED jobs from this
  // table and actually sends via Resend / WhatsApp Cloud API. For now this
  // just durably records intent so nothing is lost once senders exist.
  return prisma.notificationJob.create({
    data: {
      channel: job.channel,
      templateKey: job.templateKey,
      entityType: job.entityType,
      entityId: job.entityId,
      // Prisma's generated Json input type is stricter than a plain object
      // type at the TS level (it's a recursive JsonValue union, not
      // Record<string, unknown>) even though any JSON-serializable object is
      // valid at runtime — cast through unknown to bridge the two.
      payload: job.payload as unknown as Prisma.InputJsonValue,
    },
  });
}
