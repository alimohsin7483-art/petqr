import "server-only";
import { prisma } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { getPlanByKey } from "@/config/plans";
import { queueNotification } from "@/services/notifications/queue";
import { sendMetaConversionEvent } from "@/services/analytics/meta-capi";
import { markOrderPaid } from "@/services/shop/orders.service";
import type Stripe from "stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName ?? undefined,
    metadata: { petlinkUserId: user.id },
  });

  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

export async function createStripeCheckoutSession(userId: string, planKey: string): Promise<string> {
  const plan = await getPlanByKey(planKey);
  if (!plan.stripePriceId) throw new Error(`Plan "${planKey}" has no Stripe price configured`);

  const customerId = await getOrCreateStripeCustomer(userId);
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${APP_URL}/dashboard/billing?checkout=cancelled`,
    metadata: { petlinkUserId: userId, planKey },
    subscription_data: { metadata: { petlinkUserId: userId, planKey } },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function createStripePortalSession(userId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);
  const stripe = getStripeClient();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/dashboard/billing`,
  });
  return portal.url;
}

export async function createStripeTagCheckoutSession(
  userId: string,
  orderId: string,
  stripePriceId: string,
  quantity: number
): Promise<{ url: string; sessionId: string }> {
  const customerId = await getOrCreateStripeCustomer(userId);
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: stripePriceId, quantity }],
    shipping_address_collection: { allowed_countries: ["US", "IN", "GB", "CA", "AU"] },
    success_url: `${APP_URL}/dashboard/orders?checkout=success`,
    cancel_url: `${APP_URL}/shop?checkout=cancelled`,
    metadata: { petlinkOrderId: orderId },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url, sessionId: session.id };
}

export async function handleStripeTagCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.petlinkOrderId;
  if (!orderId || !session.payment_intent) return;

  const shippingDetails = (session as any).shipping_details ?? session.customer_details;

  await markOrderPaid({
    orderId,
    providerPaymentId: session.payment_intent as string,
    shipping: shippingDetails
      ? {
          name: shippingDetails.name,
          line1: shippingDetails.address?.line1,
          line2: shippingDetails.address?.line2,
          city: shippingDetails.address?.city,
          state: shippingDetails.address?.state,
          postalCode: shippingDetails.address?.postal_code,
          country: shippingDetails.address?.country,
        }
      : undefined,
  });
}

// ── Webhook event handlers ─────────────────────────────────────────────

export async function handleStripeCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.petlinkUserId;
  const planKey = session.metadata?.planKey;
  if (!userId || !planKey || !session.subscription) return;

  const plan = await getPlanByKey(planKey);
  const stripe = getStripeClient();
  const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);

  await prisma.subscription.upsert({
    where: { providerSubscriptionId: stripeSub.id },
    update: {
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
    create: {
      userId,
      planId: plan.id,
      provider: "STRIPE",
      providerCustomerId: stripeSub.customer as string,
      providerSubscriptionId: stripeSub.id,
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });
}

export async function handleStripeSubscriptionUpdated(sub: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { providerSubscriptionId: sub.id },
    data: {
      status: mapStripeStatus(sub.status),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

export async function handleStripeInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: invoice.subscription as string },
  });
  if (!subscription) return;

  const invoiceRow = await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      providerInvoiceId: invoice.id,
      amountDue: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoiceRow.id,
      provider: "STRIPE",
      providerPaymentId: (invoice.payment_intent as string) ?? undefined,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: "SUCCEEDED",
    },
  });

  await queueNotification({
    channel: "EMAIL",
    templateKey: "payment_success",
    entityType: "user",
    entityId: subscription.userId,
    payload: { amount: (invoice.amount_paid / 100).toFixed(2), currency: invoice.currency.toUpperCase() },
  });

  const user = await prisma.user.findUnique({ where: { id: subscription.userId } });
  if (user) {
    await sendMetaConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${invoice.id}`,
      email: user.email,
      value: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
    });
  }
}

export async function handleStripeInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: invoice.subscription as string },
  });
  if (!subscription) return;

  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE" } });

  await queueNotification({
    channel: "EMAIL",
    templateKey: "payment_failure",
    entityType: "user",
    entityId: subscription.userId,
    payload: { amount: (invoice.amount_due / 100).toFixed(2), currency: invoice.currency.toUpperCase() },
  });
}

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "TRIALING" as const;
    case "active":
      return "ACTIVE" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELED" as const;
    default:
      return "EXPIRED" as const;
  }
}
