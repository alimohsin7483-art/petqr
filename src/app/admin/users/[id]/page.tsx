import { notFound } from "next/navigation";
import { getUserDetail } from "@/services/admin/admin.service";
import { UserAdminControls } from "@/components/admin/user-admin-controls";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        {user.role}
      </p>
      <h1 className="mb-1 font-display text-3xl font-medium text-ink">
        {user.fullName ?? user.email}
      </h1>
      <p className="mb-8 text-sm text-ink/60">{user.email}</p>

      <div className="mb-8">
        <UserAdminControls userId={user.id} isSuspended={!!user.deletedAt} role={user.role as "OWNER" | "ADMIN"} />
      </div>

      <section className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">
          Pets ({user.pets.length})
        </p>
        <ul className="flex flex-col gap-2">
          {user.pets.map((pet) => (
            <li key={pet.id} className="rounded-lg border border-line bg-white/50 px-4 py-2.5 text-sm">
              {pet.name} <span className="text-ink/40">· /{pet.publicSlug}</span>
              {pet.isLost && <span className="ml-2 text-xs text-alert">Lost</span>}
            </li>
          ))}
          {user.pets.length === 0 && <p className="text-sm text-ink/50">No pets registered.</p>}
        </ul>
      </section>

      <section className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Subscriptions</p>
        <ul className="flex flex-col gap-2">
          {user.subscriptions.map((sub) => (
            <li key={sub.id} className="rounded-lg border border-line bg-white/50 px-4 py-2.5 text-sm">
              {sub.plan.name} · {sub.provider} ·{" "}
              <span className="font-mono text-xs">{sub.status}</span>
            </li>
          ))}
          {user.subscriptions.length === 0 && (
            <p className="text-sm text-ink/50">No subscription history.</p>
          )}
        </ul>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/50">Support tickets</p>
        <ul className="flex flex-col gap-2">
          {user.supportTickets.map((t) => (
            <li key={t.id} className="rounded-lg border border-line bg-white/50 px-4 py-2.5 text-sm">
              {t.subject} · <span className="font-mono text-xs">{t.status}</span>
            </li>
          ))}
          {user.supportTickets.length === 0 && (
            <p className="text-sm text-ink/50">No support tickets.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
