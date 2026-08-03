import { Package, ScanLine, HeartHandshake } from "lucide-react";

const STEPS = [
  {
    icon: Package,
    title: "Order your tag",
    body: "Pick a style, pay once — no subscription. Ships in 3-5 days.",
  },
  {
    icon: ScanLine,
    title: "Scan to activate",
    body: "When it arrives, scan it once and link it to your pet in under a minute.",
  },
  {
    icon: HeartHandshake,
    title: "They're covered, always",
    body: "Anyone who finds your pet scans the same tag and reaches you instantly.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {STEPS.map((step, i) => (
        <div key={step.title} className="relative rounded-tag border border-line bg-white/50 p-6">
          <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-paper">
            {i + 1}
          </span>
          <step.icon className="mb-3 h-6 w-6 text-brass-dark" strokeWidth={1.75} />
          <p className="mb-1 font-display text-base text-ink">{step.title}</p>
          <p className="text-sm text-ink/60">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
