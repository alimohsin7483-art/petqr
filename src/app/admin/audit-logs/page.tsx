import { listAuditLogs } from "@/services/admin/admin.service";

const ENTITY_TYPES = ["pets", "subscriptions", "payments"];

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const { type, page = "1" } = await searchParams;
  const { logs, total } = await listAuditLogs(parseInt(page, 10), type);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Audit logs ({total})</h1>

      <div className="mb-6 flex gap-2 text-sm">
        <a
          href="/admin/audit-logs"
          className={!type ? "font-medium text-ink underline" : "text-ink/60 hover:underline"}
        >
          All
        </a>
        {ENTITY_TYPES.map((t) => (
          <a
            key={t}
            href={`/admin/audit-logs?type=${t}`}
            className={type === t ? "font-medium text-ink underline" : "text-ink/60 hover:underline"}
          >
            {t}
          </a>
        ))}
      </div>

      <div className="overflow-hidden rounded-tag border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-white/60 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 font-mono text-xs text-ink/50">
                  {log.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-ink/70">{log.actor?.email ?? "system"}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">
                  {log.entityType}:{log.entityId.slice(0, 8)}…
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink/40">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
