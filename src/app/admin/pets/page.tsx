import { searchPets } from "@/services/admin/admin.service";

export default async function AdminPetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const { pets, total } = await searchPets(q, parseInt(page, 10));

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Pets ({total})</h1>
      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by pet name, slug, or owner email…"
          className="w-full max-w-sm rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
      </form>

      <div className="overflow-hidden rounded-tag border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-white/60 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-ink/70">{p.owner.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">/{p.publicSlug}</td>
                <td className="px-4 py-3">
                  {p.isLost ? <span className="text-alert">Lost</span> : <span className="text-ink/40">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
