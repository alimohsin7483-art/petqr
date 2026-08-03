import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import {
  handleRazorpaySubscriptionCharged,
  handleRazorpaySubscriptionCancelled,
  handleRazorpayPaymentFailed,
  handleRazorpayOrderPaid,
} from "@/services/billing/razorpay.service";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);

  try {
    switch (payload.event) {
      case "subscription.charged":
        await handleRazorpaySubscriptionCharged(payload.payload);
        break;
      case "payment.captured":
        await handleRazorpayOrderPaid(payload.payload);
        break;
      case "subscription.cancelled":
        await handleRazorpaySubscriptionCancelled(payload.payload);
        break;
      case "payment.failed":
        await handleRazorpayPaymentFailed(payload.payload);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[razorpay webhook handler error]", payload.event, err);
  }

  return NextResponse.json({ received: true });
}
