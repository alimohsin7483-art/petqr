import { ImageResponse } from "next/og";
import { getPublicPetProfile } from "@/services/pets/found-reports.service";

// NOTE: intentionally NOT edge runtime — this route calls getPublicPetProfile(),
// which goes through src/lib/db.ts's PrismaClient. Prisma's query engine is a
// native binary and cannot run on Vercel's Edge Runtime. next/og's
// ImageResponse works fine on the default Node.js runtime too, just without
// edge's extra-low cold-start latency (negligible for an OG image route).
const size = { width: 1200, height: 630 };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pet = await getPublicPetProfile(slug);

  const name = pet?.name ?? "Pet not found";
  const isLost = pet?.isLost ?? false;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#F6F3EC",
          color: "#132A3E",
        }}
      >
        {isLost && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#C1483B",
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            ● LOST — HELP BRING THEM HOME
          </div>
        )}
        <div style={{ fontSize: 88, fontWeight: 600, display: "flex" }}>{name}</div>
        <div style={{ fontSize: 32, color: "#C98A3B", marginTop: 24, display: "flex" }}>
          PetLink · scan to reach the owner
        </div>
      </div>
    ),
    { ...size }
  );
}
