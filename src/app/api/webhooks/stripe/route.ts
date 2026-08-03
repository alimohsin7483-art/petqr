import { NextResponse, type NextRequest } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import {
  handleStripeCheckoutCompleted,
  handleStripeSubscriptionUpdated,
  handleStripeInvoicePaid,
  handleStripeInvoiceFailed,
  handleStripeTagCheckoutCompleted,
} from "@/services/billing/stripe.service";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await handleStripeCheckoutCompleted(session);
        } else if (session.mode === "payment") {
          await handleStripeTagCheckoutCompleted(session);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleStripeSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleStripeInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleStripeInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break; // ignore event types we don't act on
    }
  } catch (err) {
    // Log and still 200 — Stripe retries on non-2xx, but a handler bug
    // shouldn't cause infinite redelivery storms. Sentry (Module 9) captures this.
    console.error("[stripe webhook handler error]", event.type, err);
  }

  return NextResponse.json({ received: true });
}
