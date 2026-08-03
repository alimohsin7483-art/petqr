import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { generateQrPngBuffer } from "@/services/qr/qrcode";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await requireRole("ADMIN");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = await prisma.physicalTag.findUnique({ where: { slug } });
  if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });

  const png = await generateQrPngBuffer(slug);
  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="petlink-tag-${slug}.png"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
