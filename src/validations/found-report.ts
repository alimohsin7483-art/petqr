import { z } from "zod";

export const foundReportSchema = z.object({
  slug: z.string().min(1),
  finderName: z.string().trim().max(120).optional().or(z.literal("")),
  finderPhone: z.string().trim().max(20).optional().or(z.literal("")),
  finderEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().trim().min(1, "Add a short note so the owner has context").max(500),
  // Honeypot field — real users never fill this in; bots often do.
  companyWebsite: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});
export type FoundReportInput = z.infer<typeof foundReportSchema>;
