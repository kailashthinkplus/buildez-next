import { NextResponse } from "next/server";

import { extractLogoColors } from
  "@/modules/builder/runtime/designTokens/extractLogoColors";

import { mapLogoColorsToDesignTokens } from
  "@/modules/builder/runtime/designTokens/mapLogoColorsToTokens";

/* ============================================================
   EXTRACT LOGO → DESIGN TOKENS
============================================================ */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const logoUrl = body.logoUrl as string | undefined;

    if (!logoUrl) {
      return NextResponse.json(
        { error: "Missing logoUrl" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       1️⃣ Extract raw logo colors
    ---------------------------------------------------------- */
    const extracted = await extractLogoColors(logoUrl);

    if (!extracted) {
      return NextResponse.json(
        { error: "Failed to extract logo colors" },
        { status: 422 }
      );
    }

    /* ----------------------------------------------------------
       2️⃣ Map → Design Tokens (LOCKED CONTRACT)
    ---------------------------------------------------------- */
    const tokens = mapLogoColorsToDesignTokens(extracted);

    return NextResponse.json(tokens);
  } catch (err) {
    console.error("[BRANDING] Palette extraction failed", err);

    return NextResponse.json(
      { error: "Palette extraction failed" },
      { status: 500 }
    );
  }
}
