// /apps/web-app/app/api/ai/_lib/branding/extractBrandColors.ts

import sharp from "sharp";

/* ============================================================
   TYPES
============================================================ */

export interface ExtractedBrandColors {
  primary: string;
  accent: string;
  backgroundHint: "light" | "dark";
}

/* ============================================================
   HELPERS
============================================================ */

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function isNearWhite(r: number, g: number, b: number) {
  return r > 245 && g > 245 && b > 245;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/* ============================================================
   CORE EXTRACTION (DETERMINISTIC)
============================================================ */

export async function extractBrandColors(
  imageBuffer: Buffer
): Promise<ExtractedBrandColors> {
  const { data, info } = await sharp(imageBuffer)
    .resize(64, 64, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: { r: number; g: number; b: number }[] = [];

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!isNearWhite(r, g, b)) {
      pixels.push({ r, g, b });
    }
  }

  if (pixels.length === 0) {
    // fallback (edge case: pure white logo)
    return {
      primary: "#2563eb",
      accent: "#9333ea",
      backgroundHint: "light",
    };
  }

  // Sort by saturation (brand-like colors first)
  pixels.sort(
    (a, b) =>
      saturation(b.r, b.g, b.b) - saturation(a.r, a.g, a.b)
  );

  const primaryPixel = pixels[0];
  const accentPixel = pixels[Math.floor(pixels.length / 4)] ?? pixels[0];

  const avgLum =
    pixels.reduce((sum, p) => sum + luminance(p.r, p.g, p.b), 0) /
    pixels.length;

  return {
    primary: rgbToHex(primaryPixel.r, primaryPixel.g, primaryPixel.b),
    accent: rgbToHex(accentPixel.r, accentPixel.g, accentPixel.b),
    backgroundHint: avgLum < 0.4 ? "dark" : "light",
  };
}
