import { NextResponse, type NextRequest } from "next/server";
import { getContactInfoForRedirect } from "@/services/pets/found-reports.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const type = request.nextUrl.searchParams.get("type"); // "call" | "whatsapp"

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const limited = await checkRateLimit(`contact:${ip}:${slug}`, 15, "10 m");
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const info = await getContactInfoForRedirect(slug);
  if (!info || !info.phone) {
    return NextResponse.json({ error: "No contact available" }, { status: 404 });
  }

  // Real enforcement, not just hiding the button in the UI — if the owner
  // turned a channel off, the redirect refuses it even if someone guesses
  // or bookmarks the URL directly.
  if (type === "whatsapp" && !info.showWhatsappButton) {
    return NextResponse.json({ error: "This contact method is turned off" }, { status: 403 });
  }
  if (type !== "whatsapp" && !info.showCallButton) {
    return NextResponse.json({ error: "This contact method is turned off" }, { status: 403 });
  }

  const digits = info.phone.replace(/[^\d+]/g, "");
  const target = type === "whatsapp" ? `https://wa.me/${digits.replace("+", "")}` : `tel:${digits}`;

  return NextResponse.redirect(target, { status: 302 });
}
