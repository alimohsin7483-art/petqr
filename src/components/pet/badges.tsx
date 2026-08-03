import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export function LostBanner({
  isLost,
  lastSeenNote,
  lastSeenAt,
}: {
  isLost: boolean;
  lastSeenNote?: string | null;
  lastSeenAt?: Date | null;
}) {
  if (!isLost) return null;
  return (
    <div className="mb-6 rounded-tag bg-alert/10 p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-alert">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-alert opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-alert" />
        </span>
        This pet is currently reported lost
      </div>
      {lastSeenNote && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-white/60 p-3 text-sm text-ink/80">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-alert" strokeWidth={1.75} />
          <div>
            <p className="font-medium text-ink">Last seen</p>
            <p>{lastSeenNote}</p>
            {lastSeenAt && (
              <p className="mt-1 font-mono text-xs text-ink/40">
                Reported {lastSeenAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SpeciesTag({ species }: { species: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-ink/60"
      )}
    >
      {species.toLowerCase()}
    </span>
  );
}
