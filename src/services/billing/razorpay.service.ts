import "server-only";
import { prisma } from "@/lib/db";
import { getRazorpayClient } from "@/lib/razorpay";
import { getPlanByKey } from "@/config/plans";
import { queueNotification } from "@/services/notifications/queue";
import { sendMetaConversionEvent } from "@/services/analytics/meta-capi";
import { markOrderPaid } from "@/services/shop/orders.service";
import crypto from "crypto";

/**
 * Creates a Razorpay Order (their one-time-payment primitive, distinct from
 * their subscription API) and returns what the client-side checkout widget
 * needs to open. Unlike Stripe Checkout, Razorpay's one-time flow requires
 * a client-side widget rather than a hosted redirect URL.
 */
export async function createRazorpayTagOrder(
  orderId: string,
  amountInSubunits: number,
  currency: string
): Promise<{ razorpayOrderId: string; amount: number; currency: string }> {
  const razorpay = getRazorpayClient();
  const rpOrder = await razorpay.orders.create({
    amount: amountInSubunits,
    currency,
    receipt: orderId,
    notes: { petlinkOrderId: orderId },
  });

  return { razorpayOrderId: rpOrder.id, amount: amountInSubunits, currency };
}

/**
 * Verifies the signature the Razorpay checkout widget returns to the client
 * after a successful payment. This is the immediate confirmation path;
 * `handleRazorpayOrderPaid` (webhook) is the durable fallback in case the
 * browser closes before this verification call completes.
 */
export function verifyRazorpayPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function handleRazorpayOrderPaid(payload: any) {
  const paymentEntity = payload.payment.entity;
  const orderId = paymentEntity.notes?.petlinkOrderId;
  if (!orderId) return; // not a tag-store order — likely a subscription charge, handled elsewhere

  await markOrderPaid({
    orderId,
    providerPaymentId: paymentEntity.id,
  });
}

/**
 * Creates a Razorpay subscription and returns its hosted short_url —
 * redirect the user there to complete payment (Razorpay's checkout is
 * hosted, unlike Stripe Checkout which we also redirect to, so both
 * providers follow the same "get a URL, redirect" pattern from the caller's
 * perspective).
 */
export async function createRazorpaySubscription(userId: string, planKey: string): Promise<string> {
  const plan = await getPlanByKey(planKey);
  if (!plan.razorpayPlanId) throw new Error(`Plan "${planKey}" has no Razorpay plan configured`);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const razorpay = getRazorpayClient();

  const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpayPlanId,
    customer_notify: 1,
    total_count: 120, // ~10 years of monthly cycles; Razorpay requires a bound
    notes: { petlinkUserId: userId, planKey },
  });

  await prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      provider: "RAZORPAY",
      providerSubscriptionId: subscription.id,
      status: "TRIALING",
    },
  });

  return (subscription as any).short_url;
}

export async function handleRazorpaySubscriptionCharged(payload: any) {
  const subEntity = payload.subscription.entity;
  const paymentEntity = payload.payment.entity;

  const subscription = await prisma.subscription.findFirst({
    where: { providerSubscriptionId: subEntity.id },
  });
  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE", currentPeriodEnd: new Date(subEntity.current_end * 1000) },
  });

  const invoice = await prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      providerInvoiceId: paymentEntity.invoice_id ?? undefined,
      amountDue: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      provider: "RAZORPAY",
      providerPaymentId: paymentEntity.id,
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: "SUCCEEDED",
    },
  });

  await queueNotification({
    channel: "EMAIL",
    templateKey: "payment_success",
    entityType: "user",
    entityId: subscription.userId,
    payload: { amount: (paymentEntity.amount / 100).toFixed(2), currency: paymentEntity.currency },
  });

  const user = await prisma.user.findUnique({ where: { id: subscription.userId } });
  if (user) {
    await sendMetaConversionEvent({
      eventName: "Purchase",
      eventId: `razorpay_${paymentEntity.id}`,
      email: user.email,
      phone: user.phone ?? undefined,
      value: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
    });
  }
}

export async function handleRazorpaySubscriptionCancelled(payload: any) {
  const subEntity = payload.subscription.entity;
  await prisma.subscription.updateMany({
    where: { providerSubscriptionId: subEntity.id },
    data: { status: "CANCELED" },
  });
}

export async function handleRazorpayPaymentFailed(payload: any) {
  const paymentEntity = payload.payment.entity;
  const subscriptionId = paymentEntity.notes?.petlinkSubscriptionId;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!subscription) return;

  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE" } });

  await queueNotification({
    channel: "EMAIL",
    templateKey: "payment_failure",
    entityType: "user",
    entityId: subscription.userId,
    payload: { amount: (paymentEntity.amount / 100).toFixed(2), currency: paymentEntity.currency },
  });
}
