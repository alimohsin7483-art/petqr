import { listRecentPayments } from "@/services/admin/admin.service";

export default async function AdminPaymentsPage() {
  const { payments, total } = await listRecentPayments();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Payments ({total})</h1>
      <div className="overflow-hidden rounded-tag border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-white/60 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 text-ink/50">{p.createdAt.toDateString()}</td>
                <td className="px-4 py-3">{p.invoice.subscription.user.email}</td>
                <td className="px-4 py-3">{p.invoice.subscription.plan.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.provider}</td>
                <td className="px-4 py-3">
                  {p.currency} {p.amount.toString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.status === "SUCCEEDED"
                        ? "text-found"
                        : p.status === "FAILED"
                        ? "text-alert"
                        : "text-ink/50"
                    }
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink/40">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
