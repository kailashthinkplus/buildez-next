import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getAuthContext } from "@/lib/auth/getAuthContext";

import { uploadToR2 } from "@/lib/storage/uploadToR2";
import { extractLogoColors } from "@/app/api/_lib/designTokens/extractLogoColors";
import { mapLogoColorsToDesignTokens } from "@/app/api/_lib/designTokens/mapLogoColorsToTokens";

/* ============================================================
   POST — UPLOAD LOGO + DESIGN TOKEN FLOW (LOCKED)
============================================================ */

export async function POST(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    /* ----------------------------------------------------------
       AUTH
    ---------------------------------------------------------- */
    const auth = await getAuthContext();

    if (!auth?.tenantId || !auth?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const siteId = params.siteId;

    /* ----------------------------------------------------------
       LOAD SITE
    ---------------------------------------------------------- */
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        tenantId: true,
        logoUrl: true,
        designTokens: true,
      },
    });

    if (!site || site.tenantId !== auth.tenantId) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    /* ----------------------------------------------------------
       PARSE FORM
    ---------------------------------------------------------- */
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Missing logo file" },
        { status: 400 }
      );
    }

    const overwrite =
      req.nextUrl.searchParams.get("overwrite") === "true";

    /* ----------------------------------------------------------
       UPLOAD TO R2 (SITE-SCOPED)
    ---------------------------------------------------------- */
    const ext = file.name.split(".").pop() || "png";
    const objectKey = `sites/${siteId}/branding/logo.${ext}`;

    const logoUrl = await uploadToR2({
      file,
      key: objectKey,
      contentType: file.type,
    });

    /* ----------------------------------------------------------
       UPDATE LOGO URL (ALWAYS)
    ---------------------------------------------------------- */
    await prisma.site.update({
      where: { id: siteId },
      data: { logoUrl },
    });

    /* ----------------------------------------------------------
       EXTRACT LOGO COLORS (ALWAYS)
    ---------------------------------------------------------- */
    const extractedColors =
      await extractLogoColors(logoUrl);

    if (!extractedColors) {
      return NextResponse.json(
        { error: "Failed to extract logo colors" },
        { status: 422 }
      );
    }

    /* ----------------------------------------------------------
       FIRST LOGO → AUTO APPLY TOKENS
    ---------------------------------------------------------- */
    if (!site.designTokens) {
      const tokens =
        mapLogoColorsToDesignTokens(extractedColors);

      await prisma.site.update({
        where: { id: siteId },
        data: { designTokens: tokens },
      });

      console.log(
        "[DESIGN TOKENS] Generated from first logo",
        { siteId, primary: extractedColors.primary }
      );

      return NextResponse.json({
        logoUrl,
        designTokens: tokens,
        previewColors: extractedColors,
        isFirstLogo: true,
      });
    }

    /* ----------------------------------------------------------
       RE-UPLOAD → PREVIEW ONLY (DEFAULT)
    ---------------------------------------------------------- */
    if (!overwrite) {
      console.log(
        "[LOGO] Re-upload preview only",
        { siteId }
      );

      return NextResponse.json({
        logoUrl,
        previewColors: extractedColors,
        isFirstLogo: false,
        requiresConfirmation: true,
      });
    }

    /* ----------------------------------------------------------
       CONFIRMED OVERWRITE → APPLY TOKENS
    ---------------------------------------------------------- */
    const tokens =
      mapLogoColorsToDesignTokens(extractedColors);

    await prisma.site.update({
      where: { id: siteId },
      data: { designTokens: tokens },
    });

    console.log(
      "[DESIGN TOKENS] Overwritten from logo",
      { siteId, primary: extractedColors.primary }
    );

    return NextResponse.json({
      logoUrl,
      designTokens: tokens,
      previewColors: extractedColors,
      isFirstLogo: false,
      overwritten: true,
    });
  } catch (err: any) {
    console.error("[LOGO UPLOAD] fatal", err);

    return NextResponse.json(
      { error: err?.message || "Logo upload failed" },
      { status: 500 }
    );
  }
}
