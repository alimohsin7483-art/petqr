import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await getCurrentUser();
    return NextResponse.json({ fullName: user.fullName, phone: user.phone });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
