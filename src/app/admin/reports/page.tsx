import { listLostReports, listFoundReports } from "@/services/admin/admin.service";

export default async function AdminReportsPage() {
  const [{ reports: lostReports }, { reports: foundReports }] = await Promise.all([
    listLostReports(),
    listFoundReports(),
  ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Reports</h1>

      <section className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Lost reports ({lostReports.length})
        </p>
        <ul className="flex flex-col gap-2">
          {lostReports.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-white/50 px-4 py-3 text-sm">
              <span className="font-medium">{r.pet.name}</span>{" "}
              <span className="text-ink/50">({r.pet.owner.email})</span>
              {r.notes && <p className="mt-1 text-ink/60">{r.notes}</p>}
              <p className="mt-1 text-xs text-ink/40">{r.createdAt.toDateString()}</p>
            </li>
          ))}
          {lostReports.length === 0 && <p className="text-sm text-ink/50">None yet.</p>}
        </ul>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Found reports ({foundReports.length})
        </p>
        <ul className="flex flex-col gap-2">
          {foundReports.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-white/50 px-4 py-3 text-sm">
              <span className="font-medium">{r.pet.name}</span>{" "}
              <span className="text-ink/50">({r.pet.owner.email})</span>
              <p className="mt-1 text-ink/60">{r.message}</p>
              {r.finderPhone && <p className="text-xs text-ink/40">Finder phone: {r.finderPhone}</p>}
              <p className="mt-1 text-xs text-ink/40">
                {r.createdAt.toDateString()} · {r.status}
              </p>
            </li>
          ))}
          {foundReports.length === 0 && <p className="text-sm text-ink/50">None yet.</p>}
        </ul>
      </section>
    </div>
  );
}
