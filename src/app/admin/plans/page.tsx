import { listAllPlans } from "@/services/admin/admin.service";
import { PlanProviderIdsForm } from "@/components/admin/plan-provider-ids-form";

export default async function AdminPlansPage() {
  const plans = await listAllPlans();

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-medium text-ink">Plans</h1>
      <p className="mb-6 text-sm text-ink/60">
        Connect each plan to the matching Stripe Price and Razorpay Plan so checkout knows what to
        charge. Create the price/plan in each provider's dashboard first, then paste the ID here.
      </p>
      <div className="flex flex-col gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-tag border border-line bg-white/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg text-ink">{plan.name}</p>
                <p className="text-sm text-ink/60">
                  Up to {plan.maxPets} pets · ${plan.priceMonthlyUsd.toString()}/mo · ₹
                  {plan.priceMonthlyInr.toString()}/mo
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  plan.isActive ? "bg-found/10 text-found" : "bg-ink/5 text-ink/40"
                }`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <PlanProviderIdsForm
              planId={plan.id}
              stripePriceId={plan.stripePriceId}
              razorpayPlanId={plan.razorpayPlanId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
