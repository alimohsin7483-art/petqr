import "server-only";
import QRCode from "qrcode";
import { customAlphabet } from "nanoid";

// Base62, no ambiguous characters — printable on a tag, easy to re-type if needed.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const generateSlug = customAlphabet(alphabet, 10);

export function newPublicSlug(): string {
  return generateSlug();
}

export function scanUrlForSlug(slug: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/p/${slug}`;
}

/** Renders a QR PNG buffer pointing at the pet's public scan page. */
export async function generateQrPngBuffer(slug: string): Promise<Buffer> {
  return QRCode.toBuffer(scanUrlForSlug(slug), {
    type: "png",
    errorCorrectionLevel: "H", // survives scratches/dirt on a printed tag
    margin: 2,
    width: 640,
    color: {
      dark: "#132A3E",
      light: "#F6F3EC",
    },
  });
}

/** SVG variant — used when embedding inline (e.g. printable PDF tag layouts later). */
export async function generateQrSvgString(slug: string): Promise<string> {
  return QRCode.toString(scanUrlForSlug(slug), {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#132A3E",
      light: "#F6F3EC",
    },
  });
}
