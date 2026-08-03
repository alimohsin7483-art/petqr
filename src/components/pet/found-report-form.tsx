"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { foundReportSchema, type FoundReportInput } from "@/validations/found-report";
import { submitFoundReportAction } from "@/actions/found-reports";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics/track";

export function FoundReportForm({ slug }: { slug: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FoundReportInput>({
    resolver: zodResolver(foundReportSchema),
    defaultValues: { slug },
  });

  async function onSubmit(values: FoundReportInput) {
    setServerError(null);
    const result = await submitFoundReportAction(values);
    if (result && "error" in result) {
      setServerError(result.error);
      return;
    }
    trackEvent(ANALYTICS_EVENTS.FOUND_REPORT_SUBMITTED, { slug });
    setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-tag border border-found/30 bg-found/5 p-5 text-sm text-found">
        Thanks — the owner has been notified. Stay nearby if it's safe to do so.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <input type="hidden" value={slug} {...register("slug")} />
      {/* Honeypot — hidden from real users via CSS, not from screen readers by removal from DOM order. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" tabIndex={-1} autoComplete="off" {...register("companyWebsite")} />
      </div>

      <Field label="Your name (optional)" error={errors.finderName?.message} {...register("finderName")} />
      <Field
        label="Your phone (optional)"
        type="tel"
        error={errors.finderPhone?.message}
        {...register("finderPhone")}
      />
      <Field
        label="Your email (optional)"
        type="email"
        error={errors.finderEmail?.message}
        {...register("finderEmail")}
      />
      <Field
        label="Message"
        placeholder="Found near the park on 5th, safe with me…"
        error={errors.message?.message}
        {...register("message")}
      />
      {serverError && <p className="text-sm text-alert">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Notify the owner"}
      </Button>
    </form>
  );
}
