"use server";

import { headers } from "next/headers";
import { foundReportSchema, type FoundReportInput } from "@/validations/found-report";
import { submitFoundReport, PetNotFoundError } from "@/services/pets/found-reports.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { queueNotification } from "@/services/notifications/queue";

type ActionResult = { error: string } | { success: true };

export async function submitFoundReportAction(input: FoundReportInput): Promise<ActionResult> {
  const parsed = foundReportSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };
  if (parsed.data.companyWebsite) return { success: true }; // honeypot tripped — pretend success

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const limited = await checkRateLimit(`found-report:${ip}`, 5, "1 h");
  if (!limited.success) return { error: "Too many submissions. Try again later." };

  try {
    const report = await submitFoundReport(parsed.data);
    await queueNotification({
      channel: "EMAIL",
      templateKey: "found_report_submitted",
      entityType: "found_report",
      entityId: report.id,
      payload: { message: parsed.data.message, petName: report.petName },
    });
    return { success: true };
  } catch (err) {
    if (err instanceof PetNotFoundError) return { error: "This pet tag isn't recognized." };
    return { error: "Couldn't submit. Try again." };
  }
}
