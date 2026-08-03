import Link from "next/link";
import { MessageSquare, Phone, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listFoundReportsForOwner, markAllFoundReportsReadForOwner } from "@/services/pets/found-reports.service";

export default async function MessagesPage() {
  const { authUser, user } = await requireUser();
  const reports = await listFoundReportsForOwner(authUser.id, user.id);
  await markAllFoundReportsReadForOwner(authUser.id, user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass-dark">
        Messages
      </p>
      <h1 className="mb-2 font-display text-3xl font-medium text-ink">
        Messages from finders
      </h1>
      <p className="mb-8 text-sm text-ink/60">
        Anyone who scans your pet's tag and sends a message shows up here — even if email
        notifications aren't set up yet, you'll always see it here.
      </p>

      {reports.length === 0 ? (
        <div className="rounded-tag border border-dashed border-line p-10 text-center">
          <MessageSquare className="mx-auto mb-3 h-6 w-6 text-ink/30" strokeWidth={1.5} />
          <p className="text-sm text-ink/50">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-tag border border-line bg-white/50 p-5">
              <div className="mb-2 flex items-center justify-between">
                <Link
                  href={`/dashboard/pets`}
                  className="font-medium text-ink underline-offset-4 hover:underline"
                >
                  About {report.pet.name}
                </Link>
                <span className="font-mono text-xs text-ink/40">
                  {report.createdAt.toLocaleString()}
                </span>
              </div>
              <p className="mb-3 text-sm text-ink/80">{report.message}</p>
              <div className="flex flex-wrap gap-4 text-xs text-ink/50">
                {report.finderName && <span>From: {report.finderName}</span>}
                {report.finderPhone && (
                  <a
                    href={`tel:${report.finderPhone}`}
                    className="flex items-center gap-1 text-brass-dark underline underline-offset-4"
                  >
                    <Phone className="h-3 w-3" strokeWidth={1.75} />
                    {report.finderPhone}
                  </a>
                )}
                {report.finderEmail && (
                  <a
                    href={`mailto:${report.finderEmail}`}
                    className="flex items-center gap-1 text-brass-dark underline underline-offset-4"
                  >
                    <Mail className="h-3 w-3" strokeWidth={1.75} />
                    {report.finderEmail}
                  </a>
                )}
                {!report.finderPhone && !report.finderEmail && (
                  <span className="italic text-ink/30">Finder left no contact info</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
