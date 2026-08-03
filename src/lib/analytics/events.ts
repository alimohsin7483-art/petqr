/**
 * Event name constants only — no "use client" here, deliberately.
 * track.ts (the actual trackEvent() function) touches `window` and must stay
 * a client boundary, but plain constants like these need to be importable
 * from Server Components too (e.g. dashboard pages passing an event name as
 * a prop into <EventOnMount>). Importing a value from a "use client" module
 * into a Server Component doesn't work the way you'd expect — Next.js treats
 * every export of a "use client" file as a client reference, so a Server
 * Component reading a plain constant from one gets `undefined` at runtime
 * instead of the real value. Keeping constants here avoids that entirely.
 */
export const ANALYTICS_EVENTS = {
  SIGNUP: "sign_up",
  LOGIN: "login",
  PET_CREATED: "pet_created",
  QR_GENERATED: "qr_generated",
  QR_SCANNED: "qr_scanned",
  LOST_MODE_ENABLED: "lost_mode_enabled",
  FOUND_REPORT_SUBMITTED: "found_report_submitted",
  SUBSCRIPTION_PURCHASED: "subscription_purchased",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILURE: "payment_failure",
  DASHBOARD_VIEWED: "dashboard_viewed",
  FEATURE_USED: "feature_used",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
