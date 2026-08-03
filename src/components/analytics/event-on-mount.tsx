"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics/track";

export function EventOnMount({
  event,
  params = {},
  stripQueryParam,
}: {
  event: AnalyticsEventName;
  params?: Record<string, unknown>;
  /** Query param to strip from the URL after firing, so a page refresh doesn't refire the event. */
  stripQueryParam?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    trackEvent(event, params);
    if (stripQueryParam) {
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
