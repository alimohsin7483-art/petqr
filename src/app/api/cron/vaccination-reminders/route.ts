import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const dueSoon = await prisma.vaccination.findMany({
    where: {
      nextDueAt: { lte: sevenDaysOut, gte: new Date() },
      deletedAt: null,
    },
    include: { pet: true },
  });

  let queued = 0;
  for (const v of dueSoon) {
    // Idempotency: skip if a reminder for this exact vaccination was already
    // queued today, so the daily cron doesn't spam owners on re-runs.
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.notificationJob.findFirst({
      where: {
        templateKey: "vaccination_reminder",
        entityType: "pet",
        entityId: v.petId,
        createdAt: { gte: startOfDay },
      },
    });
    if (existing) continue;

    await prisma.notificationJob.create({
      data: {
        channel: "EMAIL",
        templateKey: "vaccination_reminder",
        entityType: "pet",
        entityId: v.petId,
        payload: {
          petId: v.petId,
          petName: v.pet.name,
          vaccineName: v.name,
          dueDate: v.nextDueAt?.toDateString(),
        },
      },
    });
    queued++;
  }

  return NextResponse.json({ checked: dueSoon.length, queued });
}
