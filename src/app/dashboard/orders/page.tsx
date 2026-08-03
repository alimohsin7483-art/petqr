import { requireUser } from "@/lib/auth";
import { listOrdersForUser } from "@/services/shop/orders.service";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Preparing to ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { authUser, user } = await requireUser();
  const { checkout } = await searchParams;
  const orders = await listOrdersForUser(authUser.id, user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {checkout === "success" && (
        <EventOnMount
          event={ANALYTICS_EVENTS.SUBSCRIPTION_PURCHASED}
          params={{ type: "physical_tag" }}
          stripQueryParam="checkout"
        />
      )}
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Orders
      </p>
      <h1 className="mb-8 font-display text-3xl font-medium text-ink">Your orders</h1>

      {checkout === "success" && (
        <p className="mb-6 rounded-tag border border-found/30 bg-found/5 p-4 text-sm text-found">
          Payment received — your tag will ship soon.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-tag border border-line bg-white/50 p-5">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium text-ink">{order.product.name}</p>
              <span className="font-mono text-xs text-ink/50">{STATUS_LABEL[order.status]}</span>
            </div>
            <p className="text-sm text-ink/60">
              Qty {order.quantity} · {order.currency} {order.amount.toString()} ·{" "}
              {order.createdAt.toDateString()}
            </p>
            {order.physicalTags.length > 0 && (
              <p className="mt-2 text-xs text-ink/40">
                {order.physicalTags.filter((t) => t.status === "CLAIMED").length} of{" "}
                {order.physicalTags.length} tag(s) claimed
              </p>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <p className="rounded-tag border border-dashed border-line p-8 text-center text-sm text-ink/50">
            No orders yet.
          </p>
        )}
      </div>
    </div>
  );
}
