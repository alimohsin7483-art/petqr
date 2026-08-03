import Link from "next/link";
import { searchUsers } from "@/services/admin/admin.service";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const { users, total, pages } = await searchUsers(q, parseInt(page, 10));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink">Users ({total})</h1>
        <a
          href="/api/admin/export/users"
          className="text-sm text-brass-dark underline underline-offset-4"
        >
          Export CSV
        </a>
      </div>

      <form className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-full max-w-sm rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brass focus:outline-none"
        />
      </form>

      <div className="overflow-hidden rounded-tag border border-line bg-white/50">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-white/60 text-left text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Pets</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-ink underline-offset-4 hover:underline">
                    {u.fullName ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/70">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.role}</td>
                <td className="px-4 py-3">{u._count.pets}</td>
                <td className="px-4 py-3 text-ink/50">{u.createdAt.toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex gap-2 text-sm text-ink/60">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?q=${encodeURIComponent(q)}&page=${p}`}
              className={p === parseInt(page, 10) ? "font-medium text-ink underline" : "hover:underline"}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
