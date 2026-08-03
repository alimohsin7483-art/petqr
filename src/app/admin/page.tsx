import { getOverviewCounts } from "@/services/admin/admin.service";

export default async function AdminOverviewPage() {
  const counts = await getOverviewCounts();

  const cards = [
    { label: "Total users", value: counts.users },
    { label: "Total pets", value: counts.pets },
    { label: "Active subscriptions", value: counts.activeSubscriptions },
    { label: "Currently lost", value: counts.lostPets, alert: counts.lostPets > 0 },
    { label: "Open support tickets", value: counts.openTickets },
    { label: "Tags in stock", value: counts.unclaimedTags },
    { label: "Orders awaiting shipment", value: counts.pendingOrders, alert: counts.pendingOrders > 0 },
  ];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-medium text-ink">Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-tag border border-line bg-white/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{c.label}</p>
            <p className={`mt-2 font-display text-3xl ${c.alert ? "text-alert" : "text-ink"}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
