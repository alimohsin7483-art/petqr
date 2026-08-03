import { ShieldCheck, Droplets, RefreshCcw, Truck } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Laser-etched, won't fade" },
  { icon: Droplets, label: "Waterproof stainless steel" },
  { icon: RefreshCcw, label: "Free replacement if lost" },
  { icon: Truck, label: "Ships in 3-5 days" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {BADGES.map((b) => (
        <div key={b.label} className="flex items-center gap-2 text-sm text-ink/70">
          <b.icon className="h-4 w-4 text-brass-dark" strokeWidth={1.75} />
          {b.label}
        </div>
      ))}
    </div>
  );
}
