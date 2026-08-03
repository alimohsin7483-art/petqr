import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://petlink.app";

export async function GET() {
  try {
    await requireRole("ADMIN");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.physicalTag.findMany({
    where: { orderId: null }, // unassigned — the ones still available to print/stock
    orderBy: { createdAt: "asc" },
  });

  const header = "slug,scan_url,status,created_at\n";
  const rows = tags
    .map((t) => [t.slug, `${APP_URL}/p/${t.slug}`, t.status, t.createdAt.toISOString()].join(","))
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="petlink-unassigned-tags-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
