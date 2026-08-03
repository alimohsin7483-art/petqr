import { listAllOrdersForAdmin } from "@/services/shop/orders.service";
import { MarkShippedButton } from "@/components/admin/mark-shipped-button";

export default async function AdminOrdersPage() {
  const { orders, total } = await listAllOrdersForAdmin();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Orders ({total})</h1>
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className="rounded-tag border border-line bg-white/50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-ink">
                {order.product.name} × {order.quantity}
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink/50">{order.status}</span>
                {order.status === "PAID" && (
                  <MarkShippedButton orderId={order.id} alreadyShipped={false} />
                )}
                {order.status === "SHIPPED" && (
                  <MarkShippedButton orderId={order.id} alreadyShipped={true} />
                )}
              </div>
            </div>
            <p className="mb-2 text-sm text-ink/60">
              {order.user.email} · {order.provider} · {order.currency} {order.amount.toString()} ·{" "}
              {order.createdAt.toDateString()}
            </p>
            {order.shippingLine1 && (
              <p className="text-xs text-ink/50">
                Ship to: {order.shippingName}, {order.shippingLine1}
                {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}, {order.shippingCity}{" "}
                {order.shippingPostalCode}, {order.shippingState}, {order.shippingCountry}
              </p>
            )}
            {order.physicalTags.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-ink/40">Tags:</span>
                {order.physicalTags.map((t) => (
                  <span key={t.id} className="flex items-center gap-1.5">
                    <span className="font-mono text-ink/60">{t.slug}</span>
                    <a
                      href={`/api/admin/tags/${t.slug}/qr`}
                      className="text-brass-dark underline underline-offset-4"
                    >
                      Download QR
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-ink/50">No orders yet.</p>}
      </div>
    </div>
  );
}
