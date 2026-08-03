import "server-only";
import crypto from "crypto";

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface CapiEventInput {
  eventName: string; // e.g. "CompleteRegistration", "Purchase"
  eventId: string; // shared with the matching client-side pixel fire, for de-duplication
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
}

/**
 * Sends a server-side event to Meta's Conversions API. Silently no-ops if
 * not configured — this is a supplementary signal for ad attribution, not
 * something the app's core logic should ever depend on.
 */
export async function sendMetaConversionEvent(input: CapiEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) userData.ph = [sha256(input.phone.replace(/\D/g, ""))];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;

  const body = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.sourceUrl ?? process.env.NEXT_PUBLIC_APP_URL,
        action_source: "website",
        user_data: userData,
        custom_data: {
          ...(input.value !== undefined ? { value: input.value } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
        },
      },
    ],
  };

  try {
    await fetch(`${GRAPH_BASE}/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Never let an analytics call break the actual user-facing flow.
    console.error("[meta capi] send failed", err);
  }
}
