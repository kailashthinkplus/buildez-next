import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

/* 🔒 AUTH */
import { getAuthContext } from "@/lib/auth/getAuthContext";

/* 🗄️ DB */
import { prisma } from "@buildez/db";

/* 🎨 COLOR EXTRACTION */
import { extractDominantColor } from "@/app/api/ai/_lib/extractDominantColor";
import { generateDefaultDesignTokens } from "@/app/api/ai/_lib/designTokens";

/* ============================================================
   CONFIG
============================================================ */

const UPLOAD_DIR =
  process.env.LOGO_UPLOAD_DIR ||
  path.join(process.cwd(), "public/uploads/site-logos");

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

/* ============================================================
   POST — UPLOAD LOGO
============================================================ */

export async function POST(req: NextRequest) {
  try {
    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */
    const auth = await getAuthContext();

    if (!auth?.userId || !auth?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* --------------------------------------------------------
       PARSE FORM DATA
    -------------------------------------------------------- */
    const form = await req.formData();

    const file = form.get("logo") as File | null;
    const siteId = form.get("siteId") as string | null;

    if (!file || !siteId) {
      return NextResponse.json(
        { error: "Missing logo or siteId" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 415 }
      );
    }

    /* --------------------------------------------------------
       VERIFY SITE OWNERSHIP
    -------------------------------------------------------- */
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        tenantId: auth.tenantId,
      },
      select: {
        id: true,
        designTokens: true,
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------
       PREPARE FILE
    -------------------------------------------------------- */
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const hash = crypto.randomBytes(8).toString("hex");

    const filename = `${siteId}-${hash}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const publicUrl = `/uploads/site-logos/${filename}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filepath, buffer);

    /* --------------------------------------------------------
       EXTRACT DOMINANT COLOR
    -------------------------------------------------------- */
    const colors = await extractDominantColor(buffer);

    /* --------------------------------------------------------
       UPDATE DESIGN TOKENS (SAFE MERGE)
    -------------------------------------------------------- */
    const baseTokens =
      site.designTokens ?? generateDefaultDesignTokens();

    const updatedTokens = {
      ...baseTokens,
      colors: {
        ...baseTokens.colors,
        primary: colors.primary,
        primaryHover: colors.primary,
        onPrimary: colors.onPrimary,
      },
    };

    await prisma.site.update({
      where: { id: siteId },
      data: {
        logoUrl: publicUrl,
        designTokens: updatedTokens,
      },
    });

    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */
    return NextResponse.json({
      logoUrl: publicUrl,
      colors,
    });
  } catch (err: any) {
    console.error("[LOGO UPLOAD] 💥", err);

    return NextResponse.json(
      { error: err?.message || "Logo upload failed" },
      { status: 500 }
    );
  }
}
