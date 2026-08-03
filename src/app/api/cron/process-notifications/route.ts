import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmailForJob } from "@/services/notifications/email/send";
import { sendWhatsAppForJob } from "@/services/notifications/whatsapp/send";

const MAX_ATTEMPTS = 4;
const BATCH_SIZE = 25;

function backoffMinutes(attempt: number): number {
  // 2, 8, 20 minutes — then FAILED for good on the 4th attempt.
  return [2, 8, 20][attempt - 1] ?? 20;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: { in: ["QUEUED", "RETRYING"] },
      scheduledFor: { lte: new Date() },
    },
    orderBy: { scheduledFor: "asc" },
    take: BATCH_SIZE,
  });

  const results = { sent: 0, failed: 0, retried: 0 };

  for (const job of jobs) {
    await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "SENDING" } });

    try {
      if (job.channel === "EMAIL") {
        await sendEmailForJob(job);
      } else if (job.channel === "WHATSAPP") {
        await sendWhatsAppForJob(job);
      } else {
        throw new Error(`Unsupported channel for MVP worker: ${job.channel}`);
      }

      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      results.sent++;
    } catch (err) {
      const attempts = job.attempts + 1;
      const message = err instanceof Error ? err.message : "Unknown error";

      if (attempts >= MAX_ATTEMPTS) {
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: { status: "FAILED", attempts, lastError: message },
        });
        results.failed++;
      } else {
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: "RETRYING",
            attempts,
            lastError: message,
            scheduledFor: new Date(Date.now() + backoffMinutes(attempts) * 60_000),
          },
        });
        results.retried++;
      }
    }
  }

  return NextResponse.json({ processed: jobs.length, ...results });
}
