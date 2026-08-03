import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

// ── GET: Meta's one-time webhook verification handshake ──────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// ── POST: inbound messages + delivery status updates ─────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySignature(request.headers.get("x-hub-signature-256"), rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // Meta's payload shape: entry[].changes[].value.{messages[] | statuses[]}
  const changes = payload?.entry?.[0]?.changes?.[0]?.value;

  if (changes?.statuses) {
    for (const status of changes.statuses) {
      // status.status is one of: sent | delivered | read | failed
      // Module scope note: correlating this back to a specific notification_job
      // requires persisting the provider messageId at send time and querying
      // by it — worth adding once WhatsApp volume justifies a dedicated
      // delivery-log table. For now this is logged for observability.
      console.log("[whatsapp:status]", status.id, status.status, status.recipient_id);
    }
  }

  if (changes?.messages) {
    for (const message of changes.messages) {
      // Inbound replies from finders/owners — route to support or ignore for MVP.
      console.log("[whatsapp:inbound]", message.from, message.text?.body);
    }
  }

  // Meta requires a fast 200 response regardless of processing outcome.
  return NextResponse.json({ received: true });
}

function verifySignature(header: string | null, rawBody: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return process.env.NODE_ENV !== "production"; // lenient only outside prod

  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
