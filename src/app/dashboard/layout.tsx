import Link from "next/link";
import { PawPrint, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-base font-medium text-ink">
            <PawPrint className="h-4 w-4 text-brass-dark" strokeWidth={1.75} />
            PetLink
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink"
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
            Dashboard
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
