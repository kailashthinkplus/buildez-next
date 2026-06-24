import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getAuthContext } from "@/lib/auth/getAuthContext";

/* ============================================================
   PUT — SAVE DESIGN TOKENS
============================================================ */

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const auth = await getAuthContext();

    if (!auth?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const siteId = params.siteId;
    const body = await req.json();
    const { designTokens } = body ?? {};

    if (!designTokens) {
      return NextResponse.json(
        { error: "Missing designTokens" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { tenantId: true },
    });

    if (!site || site.tenantId !== auth.tenantId) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { designTokens },
    });

    console.log("[DESIGN TOKENS] Saved", { siteId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DESIGN TOKENS] Save failed", err);
    return NextResponse.json(
      { error: "Failed to save design tokens" },
      { status: 500 }
    );
  }
}
