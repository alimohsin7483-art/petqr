import Link from "next/link";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-16">
      <div className="mb-6 w-full max-w-[420px]">
        <Link href="/" className="text-sm text-ink/50 hover:text-ink">
          ← Back to home
        </Link>
      </div>
      <div className="relative w-full max-w-[420px]">
        <div className="tag-notch relative rounded-tag border border-line bg-white/60 px-8 pb-8 pt-10 shadow-[0_1px_2px_rgba(19,42,62,0.06)]">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
            {eyebrow}
          </p>
          <h1 className="mb-1 font-display text-[28px] font-medium leading-tight text-ink">
            {title}
          </h1>
          {subtitle && <p className="mb-7 text-sm text-ink/60">{subtitle}</p>}
          <div className="flex flex-col gap-5">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink/60">{footer}</div>}
      </div>
    </div>
  );
}
