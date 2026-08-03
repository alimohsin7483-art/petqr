import "server-only";
import { prisma, withRLS } from "@/lib/db";
import { assignTagsToOrder } from "./tags.service";
import { queueNotification } from "@/services/notifications/queue";
import { sendMetaConversionEvent } from "@/services/analytics/meta-capi";

export async function createPendingOrder(params: {
  userId: string;
  productId: string;
  quantity: number;
  provider: "STRIPE" | "RAZORPAY";
  amount: number;
  currency: string;
}) {
  return prisma.order.create({
    data: {
      userId: params.userId,
      productId: params.productId,
      quantity: params.quantity,
      provider: params.provider,
      amount: params.amount,
      currency: params.currency,
      status: "PENDING_PAYMENT",
    },
  });
}

export async function attachProviderOrderId(orderId: string, providerOrderId: string) {
  return prisma.order.update({ where: { id: orderId }, data: { providerOrderId } });
}

/**
 * Marks an order paid, assigns physical tags from inventory, and notifies
 * the buyer. Called exclusively from webhook handlers (Stripe/Razorpay) —
 * this is the one place order state transitions to PAID.
 */
export async function markOrderPaid(params: {
  orderId: string;
  providerPaymentId: string;
  shipping?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
}) {
  const order = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      status: "PAID",
      providerPaymentId: params.providerPaymentId,
      ...(params.shipping
        ? {
            shippingName: params.shipping.name,
            shippingLine1: params.shipping.line1,
            shippingLine2: params.shipping.line2,
            shippingCity: params.shipping.city,
            shippingState: params.shipping.state,
            shippingPostalCode: params.shipping.postalCode,
            shippingCountry: params.shipping.country,
            shippingPhone: params.shipping.phone,
          }
        : {}),
    },
    include: { user: true, product: true },
  });

  await assignTagsToOrder(order.id, order.quantity);

  await queueNotification({
    channel: "EMAIL",
    templateKey: "payment_success",
    entityType: "user",
    entityId: order.userId,
    payload: { amount: order.amount.toString(), currency: order.currency },
  });

  // Notify the business (you) that a new paid order needs fulfillment —
  // separate from the buyer's own payment-confirmation email above.
  await queueNotification({
    channel: "EMAIL",
    templateKey: "admin_notification",
    entityType: "admin",
    entityId: order.id,
    payload: {
      subject: `New order: ${order.product.name} × ${order.quantity}`,
      message: `${order.user.email} just paid ${order.currency} ${order.amount.toString()} for ${order.quantity}x ${order.product.name}. Check /admin/orders to see the assigned tag and shipping address.`,
    },
  });

  await sendMetaConversionEvent({
    eventName: "Purchase",
    eventId: `order_${order.id}`,
    email: order.user.email,
    value: Number(order.amount),
    currency: order.currency,
  });

  return order;
}

export async function markOrderShipped(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "SHIPPED" },
    include: { user: true, product: true },
  });

  await queueNotification({
    channel: "EMAIL",
    templateKey: "order_shipped",
    entityType: "user",
    entityId: order.userId,
    payload: { productName: order.product.name, quantity: order.quantity },
  });

  return order;
}

export async function listOrdersForUser(authUserId: string, userId: string) {
  return withRLS(authUserId, (tx) =>
    tx.order.findMany({
      where: { userId },
      include: { product: true, physicalTags: true },
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function listAllOrdersForAdmin(page = 1) {
  const PAGE_SIZE = 25;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { email: true } }, product: true, physicalTags: true },
    }),
    prisma.order.count(),
  ]);
  return { orders, total, pages: Math.ceil(total / PAGE_SIZE) };
}
