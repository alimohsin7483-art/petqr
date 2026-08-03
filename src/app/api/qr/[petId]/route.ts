import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQrPngBuffer } from "@/services/qr/qrcode";

export async function GET(_req: Request, { params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;

  try {
    const { user } = await getCurrentUser();
    const pet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: user.id, deletedAt: null },
      select: { publicSlug: true, name: true },
    });
    if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const png = await generateQrPngBuffer(pet.publicSlug);
    return new NextResponse(png, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${pet.name.replace(/\s+/g, "-").toLowerCase()}-petlink-qr.png"`,
        "Cache-Control": "private, max-age=0, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
