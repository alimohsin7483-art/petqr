import { getTagInventoryStats, listRecentTags } from "@/services/admin/shop-admin.service";
import { GenerateBatchForm } from "@/components/admin/generate-batch-form";

export default async function AdminTagsPage() {
  const [stats, { tags }] = await Promise.all([getTagInventoryStats(), listRecentTags()]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Physical tags</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total generated", value: stats.total },
          { label: "In stock (unassigned)", value: stats.unclaimed },
          { label: "Shipped, not yet claimed", value: stats.assignedNotClaimed },
          { label: "Claimed", value: stats.claimed },
        ].map((s) => (
          <div key={s.label} className="rounded-tag border border-line bg-white/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-tag border border-line bg-white/50 p-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Generate a new batch
        </p>
        <p className="mb-4 text-sm text-ink/60">
          Creates unclaimed tags with unique, print-ready slugs — do this before sending an order
          to your tag manufacturer/printer.
        </p>
        <GenerateBatchForm />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Recent tags</p>
        <a
          href="/api/admin/tags/export"
          className="text-sm text-brass-dark underline underline-offset-4"
        >
          Export unassigned tags (CSV)
        </a>
      </div>
      <div className="overflow-hidden rounded-tag border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-white/60 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Claimed by pet</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3">
                  <span className={t.status === "CLAIMED" ? "text-found" : "text-ink/50"}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/60">{t.order?.user.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink/60">{t.pet?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink/40">{t.createdAt.toDateString()}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/api/admin/tags/${t.slug}/qr`}
                    className="text-xs text-brass-dark underline underline-offset-4"
                  >
                    Download QR
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
