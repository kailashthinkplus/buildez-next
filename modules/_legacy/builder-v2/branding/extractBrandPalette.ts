import Vibrant from "node-vibrant/node";

/* ============================================================
   BRAND PALETTE EXTRACTION (SERVER ONLY)
============================================================ */

export async function extractBrandPaletteFromLogo(
  logoUrl: string
): Promise<Record<string, string>> {
  if (!logoUrl) {
    throw new Error("Missing logo URL");
  }

  const palette = await Vibrant.from(logoUrl).getPalette();

  /*
    We map to stable design tokens.
    No guessing. No AI. No magic.
  */

  return {
    primary:
      palette.Vibrant?.hex ??
      palette.Muted?.hex ??
      "#3B82F6",

    background:
      palette.DarkMuted?.hex ??
      palette.DarkVibrant?.hex ??
      "#0F172A",

    text:
      palette.LightVibrant?.hex ??
      palette.LightMuted?.hex ??
      "#F9FAFB",

    muted:
      palette.Muted?.hex ??
      "#94A3B8",

    surface:
      palette.DarkVibrant?.hex ??
      "#111827",
  };
}
