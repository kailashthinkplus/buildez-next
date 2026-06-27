import { NextResponse } from "next/server";
import { FALLBACK_GOOGLE_FONTS } from "@/lib/googleFonts";

const GOOGLE_FONTS_API =
  "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=" +
  process.env.GOOGLE_FONTS_API_KEY;

let cache: any[] | null = null;

export async function GET() {
  try {
    /* --------------------------------------------
       CACHE HIT
    -------------------------------------------- */
    if (cache) {
      return NextResponse.json({ fonts: cache });
    }

    /* --------------------------------------------
       ENV GUARD
    -------------------------------------------- */
    if (!process.env.GOOGLE_FONTS_API_KEY) {
      console.error("[GOOGLE FONTS] Missing API key");

      return NextResponse.json({
        fonts: FALLBACK_GOOGLE_FONTS,
        source: "fallback",
      });
    }

    /* --------------------------------------------
       FETCH
    -------------------------------------------- */
    const res = await fetch(GOOGLE_FONTS_API, {
      cache: "no-store",
    });

    const data = await res.json();

    /* --------------------------------------------
       HARD SHAPE GUARD (CRITICAL)
    -------------------------------------------- */
    if (!Array.isArray(data?.items)) {
      console.error("[GOOGLE FONTS] Invalid response:", data);

      return NextResponse.json(
        { error: "Invalid Google Fonts API response" },
        { status: 500 }
      );
    }

    /* --------------------------------------------
       NORMALIZE
    -------------------------------------------- */
    cache = data.items.map((f: any) => ({
      family: f.family,
      variants: Array.isArray(f.variants) ? f.variants : [],
      category: f.category ?? "sans-serif",
    }));

    return NextResponse.json({ fonts: cache, source: "google" });
  } catch (err) {
    console.error("[GOOGLE FONTS] Fetch failed:", err);

    return NextResponse.json({
      fonts: FALLBACK_GOOGLE_FONTS,
      source: "fallback",
    });
  }
}
