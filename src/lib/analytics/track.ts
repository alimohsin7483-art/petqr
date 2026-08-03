"use client";

import { ANALYTICS_EVENTS, type AnalyticsEventName } from "./events";
export { ANALYTICS_EVENTS };
export type { AnalyticsEventName };

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/** Maps our internal event names to the closest standard Meta Pixel event, where one exists. */
const META_STANDARD_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  sign_up: "CompleteRegistration",
  subscription_purchased: "Purchase",
  payment_success: "Purchase",
};

export function trackEvent(
  name: AnalyticsEventName,
  params: Record<string, unknown> = {},
  eventId?: string
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });

  window.gtag?.("event", name, params);

  const metaEvent = META_STANDARD_EVENT_MAP[name];
  if (metaEvent) {
    window.fbq?.("track", metaEvent, params, eventId ? { eventID: eventId } : undefined);
  } else {
    window.fbq?.("trackCustom", name, params);
  }
}
