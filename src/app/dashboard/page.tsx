import { requireUser } from "@/lib/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PawPrint, ShoppingBag, Package, CreditCard, LogOut, Settings, MessageSquare } from "lucide-react";
import { EventOnMount } from "@/components/analytics/event-on-mount";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { listPetsForOwner } from "@/services/pets/pets.service";
import { countUnreadFoundReportsForOwner } from "@/services/pets/found-reports.service";

export default async function DashboardPage() {
  const { authUser, user } = await requireUser();
  const pets = await listPetsForOwner(authUser.id, user.id);
  const unreadCount = await countUnreadFoundReportsForOwner(authUser.id, user.id);

  const links: {
    href: string;
    icon: typeof Settings;
    title: string;
    body: string;
    badge?: number;
  }[] = [
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Your profile & phone number",
      body: user.phone
        ? "Update your name or phone number."
        : "Add a phone number to enable Call/WhatsApp buttons on your pets' pages.",
    },
    {
      href: "/dashboard/pets/new",
      icon: PawPrint,
      title: "Add a pet",
      body: "Register a pet and get a scannable QR tag instantly.",
    },
    {
      href: "/dashboard/pets",
      icon: PawPrint,
      title: `Your pets (${pets.length})`,
      body: pets.length > 0 ? "View, edit, or activate lost mode." : "You haven't added any pets yet.",
    },
    {
      href: "/dashboard/messages",
      icon: MessageSquare,
      title: "Messages from finders",
      body: "See every message left through your pets' scan pages.",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      href: "/shop",
      icon: ShoppingBag,
      title: "Shop physical tags",
      body: "Order a durable steel tag — pay once, no subscription.",
    },
    {
      href: "/dashboard/orders",
      icon: Package,
      title: "Your orders",
      body: "Track physical tag orders and shipping status.",
    },
    {
      href: "/dashboard/billing",
      icon: CreditCard,
      title: "Billing & plan",
      body: "Manage your subscription and payment history.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <EventOnMount event={ANALYTICS_EVENTS.DASHBOARD_VIEWED} />
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Signed in
      </p>
      <h1 className="mb-8 font-display text-3xl font-medium text-ink">
        Welcome, {user.fullName ?? user.email}
      </h1>

      {user.role === "ADMIN" && (
        <Link href="/admin" className="mb-6 inline-block text-sm text-brass-dark underline underline-offset-4">
          Go to admin panel →
        </Link>
      )}

      <div className="mb-10 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 rounded-tag border border-line bg-white/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brass hover:shadow-md"
          >
            <link.icon className="h-5 w-5 shrink-0 text-brass-dark" strokeWidth={1.75} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-ink">{link.title}</p>
                {link.badge !== undefined && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-alert px-1.5 text-[11px] font-medium text-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink/60">{link.body}</p>
            </div>
          </Link>
        ))}
      </div>

      <form action={signOutAction}>
        <Button type="submit" variant="ghost" className="w-auto">
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Sign out
          </span>
        </Button>
      </form>
    </div>
  );
}
