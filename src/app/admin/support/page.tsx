import { listSupportTickets } from "@/services/admin/admin.service";
import { TicketStatusSelect } from "@/components/admin/ticket-status-select";

export default async function AdminSupportPage() {
  const { tickets, total } = await listSupportTickets();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Support tickets ({total})</h1>
      <div className="flex flex-col gap-3">
        {tickets.map((t) => (
          <div key={t.id} className="rounded-tag border border-line bg-white/50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-ink">{t.subject}</p>
              <TicketStatusSelect ticketId={t.id} status={t.status} />
            </div>
            <p className="mb-2 text-sm text-ink/70">{t.body}</p>
            <p className="text-xs text-ink/40">
              {t.user.email} · {t.createdAt.toDateString()}
            </p>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-sm text-ink/50">No support tickets yet.</p>}
      </div>
    </div>
  );
}
