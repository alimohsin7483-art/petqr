import { requireUser } from "@/lib/auth";
import { withRLS } from "@/lib/db";
import { getActivePlans } from "@/config/plans";
import { startStripeCheckoutAction, startRazorpayCheckoutAction, openStripePortalAction } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { authUser, user } = await requireUser();
  const { checkout } = await searchParams;

  const [subscription, plans] = await Promise.all([
    withRLS(authUser.id, (tx) =>
      tx.subscription.findFirst({
        where: { userId: user.id, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
        include: { plan: true, invoices: { orderBy: { issuedAt: "desc" }, take: 10 } },
        orderBy: { createdAt: "desc" },
      })
    ),
    getActivePlans(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Billing
      </p>
      <h1 className="mb-8 font-display text-3xl font-medium text-ink">Your plan</h1>

      {checkout === "success" && (
        <>
          <EventOnMount
            event={ANALYTICS_EVENTS.SUBSCRIPTION_PURCHASED}
            params={{ planId: subscription?.plan.id }}
            stripQueryParam="checkout"
          />
          <p className="mb-6 rounded-tag border border-found/30 bg-found/5 p-4 text-sm text-found">
            Payment successful — your plan will update once the webhook confirms it (usually within
            a few seconds).
          </p>
        </>
      )}
      {checkout === "cancelled" && (
        <p className="mb-6 rounded-tag border border-line bg-white/50 p-4 text-sm text-ink/60">
          Checkout cancelled — no charge was made.
        </p>
      )}

      <div className="mb-10 rounded-tag border border-line bg-white/50 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Current plan</p>
        <p className="mt-1 font-display text-2xl text-ink">
          {subscription?.plan.name ?? "Free"}
        </p>
        {subscription?.status === "PAST_DUE" && (
          <p className="mt-2 text-sm text-alert">
            Your last payment failed. Update your payment method to avoid losing access.
          </p>
        )}
        {subscription?.provider === "STRIPE" && (
          <form action={async () => { await openStripePortalAction(); }} className="mt-4">
            <Button variant="ghost" className="w-auto">
              Manage billing & invoices →
            </Button>
          </form>
        )}
      </div>

      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink/50">
        Available plans
      </p>
      <div className="mb-10 flex flex-col gap-4">
        {plans.map((plan) => {
          const isCurrent = subscription?.plan.id === plan.id;
          return (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-tag border border-line bg-white/50 p-6"
            >
              <div>
                <p className="font-display text-lg text-ink">{plan.name}</p>
                <p className="text-sm text-ink/60">
                  Up to {plan.maxPets} pet{plan.maxPets === 1 ? "" : "s"} · $
                  {plan.priceMonthlyUsd.toString()}/mo or ₹{plan.priceMonthlyInr.toString()}/mo
                </p>
              </div>
              {isCurrent ? (
                <span className="rounded-full bg-found/10 px-3 py-1 text-xs font-medium text-found">
                  Current
                </span>
              ) : plan.key === "free" ? null : (
                <div className="flex gap-2">
                  <form action={async () => { await startStripeCheckoutAction(plan.key); }}>
                    <Button variant="ghost" className="w-auto">
                      Pay with card
                    </Button>
                  </form>
                  <form action={async () => { await startRazorpayCheckoutAction(plan.key); }}>
                    <Button className="w-auto">Pay with Razorpay</Button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {subscription && subscription.invoices.length > 0 && (
        <>
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink/50">
            Invoice history
          </p>
          <ul className="flex flex-col gap-2">
            {subscription.invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-line bg-white/40 px-4 py-3 text-sm"
              >
                <span className="font-mono text-ink/60">
                  {invoice.issuedAt.toDateString()}
                </span>
                <span className="text-ink">
                  {invoice.currency} {invoice.amountDue.toString()}
                </span>
                <span
                  className={
                    invoice.status === "PAID" ? "text-found" : "text-ink/50"
                  }
                >
                  {invoice.status}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
