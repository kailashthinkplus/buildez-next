import { Vibrant } from "node-vibrant/node";
import sharp from "sharp";

/* ============================================================
   LOGO COLOR EXTRACTION (SERVER ONLY)
   - Supports WebP
   - ESM-safe
   - NEVER throws
============================================================ */

export interface ExtractedLogoColors {
  primary: string;
  secondary?: string;
  background?: string;
}

export async function extractLogoColors(
  imageUrl: string
): Promise<ExtractedLogoColors | null> {
  try {
    /* ----------------------------------------------------------
       1️⃣ Fetch image
    ---------------------------------------------------------- */
    const res = await fetch(imageUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch image (${res.status})`);
    }

    const contentType = res.headers.get("content-type") || "";
    const buffer = Buffer.from(await res.arrayBuffer());

    /* ----------------------------------------------------------
       2️⃣ Convert WebP → PNG (node-vibrant requirement)
    ---------------------------------------------------------- */
    const input =
      contentType.includes("image/webp")
        ? await sharp(buffer).png().toBuffer()
        : buffer;

    /* ----------------------------------------------------------
       3️⃣ Extract palette
    ---------------------------------------------------------- */
    const palette = await Vibrant.from(input).getPalette();

    const primary =
      palette.Vibrant?.hex ||
      palette.Muted?.hex ||
      palette.DarkVibrant?.hex;

    if (!primary) return null;

    return {
      primary,
      secondary:
        palette.LightVibrant?.hex ||
        palette.LightMuted?.hex ||
        undefined,
      background:
        palette.DarkMuted?.hex ||
        palette.DarkVibrant?.hex ||
        undefined,
    };
  } catch (err) {
    console.error(
      "[DESIGN TOKENS] Logo color extraction failed",
      err
    );
    return null;
  }
}
