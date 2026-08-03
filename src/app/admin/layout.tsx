import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/pets", label: "Pets" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/tags", label: "Physical tags" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit-logs", label: "Audit logs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const { user } = await getCurrentUser();
    if (user.role !== "ADMIN") redirect("/dashboard");
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-line bg-white/40 px-4 py-8">
        <p className="mb-6 px-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
          PetLink Admin
        </p>
        <Link
          href="/dashboard"
          className="mb-4 block rounded-lg px-3 py-2 text-sm text-ink/50 hover:bg-paper hover:text-ink"
        >
          ← Back to dashboard
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-paper hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-paper px-10 py-10">{children}</main>
    </div>
  );
}
