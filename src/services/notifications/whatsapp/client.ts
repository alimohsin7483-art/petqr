import "server-only";

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

interface WhatsAppSendResult {
  messageId: string;
}

/**
 * Sends a WhatsApp message via Meta's Cloud API. Uses a plain text message
 * for now — swap `text` for `template` once your WhatsApp Business templates
 * are approved in Meta Business Manager (required for messages outside the
 * 24h customer-service window).
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp Cloud API is not configured");
  }

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/[^\d+]/g, ""),
      type: "text",
      text: { body },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? "WhatsApp send failed");
  }

  return { messageId: data.messages?.[0]?.id ?? "" };
}
