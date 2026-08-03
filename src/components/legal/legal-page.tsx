import Link from "next/link";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/" className="text-sm text-ink/50 hover:text-ink">
          ← Back to home
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 pb-24">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
          Last updated {lastUpdated}
        </p>
        <h1 className="mb-8 font-display text-3xl font-medium text-ink">{title}</h1>
        <div className="prose-legal flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-medium text-ink">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
