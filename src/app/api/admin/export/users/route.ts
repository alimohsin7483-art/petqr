import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { exportUsersCsv } from "@/services/admin/admin.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  let userId: string;
  try {
    const ctx = await requireRole("ADMIN");
    userId = ctx.user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Defense in depth: even authenticated admins are rate-limited on bulk
  // exports, so a compromised admin session can't be used to exfiltrate
  // the full user table in a tight loop.
  const limited = await checkRateLimit(`admin-export:${userId}`, 5, "1 h");
  if (!limited.success) {
    return NextResponse.json({ error: "Too many exports. Try again later." }, { status: 429 });
  }

  const csv = await exportUsersCsv();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="petlink-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
