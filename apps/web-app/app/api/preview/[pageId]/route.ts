import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { generateRuntimeCSS } from "../../../../modules/builder/runtime/generateRuntimeCSS";
import { resolveBlueprintTree } from "../../../../modules/builder/runtime/resolveBlueprintTree";
import { generateRuntimeHTML } from "../../../../modules/builder/runtime/generateRuntimeHTML";


/**
 * ============================================================
 * PREVIEW API — PURE HTML + CSS
 * ============================================================
 * - No auth
 * - No tenant
 * - No builder logic
 * - Same output as publish
 * ============================================================
 */

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ pageId: string }> }
) {
  try {
    /* ----------------------------------------------------------
       1️⃣ Resolve params (App Router requirement)
    ---------------------------------------------------------- */
    const { pageId } = await ctx.params;

    if (!pageId) {
      return NextResponse.json(
        { error: "Missing pageId" },
        { status: 400 }
      );
    }

    console.log("[PREVIEW API] pageId:", pageId);

    /* ----------------------------------------------------------
       2️⃣ Fetch blueprint from DB
    ---------------------------------------------------------- */
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        blueprint: true,
      },
    });

    if (!page?.blueprint?.data) {
      console.error("[PREVIEW API] Blueprint not found");
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    const data = page.blueprint.data;

    /* ----------------------------------------------------------
       3️⃣ Resolve normalized blueprint → real tree
       (THIS IS THE CRITICAL STEP YOU WERE MISSING)
    ---------------------------------------------------------- */
    const resolvedPage = resolveBlueprintTree(data);

    if (!resolvedPage || resolvedPage.type !== "page") {
      console.error("[PREVIEW API] Invalid resolved page", resolvedPage);
      return NextResponse.json(
        { error: "Invalid blueprint structure" },
        { status: 500 }
      );
    }

    /* ----------------------------------------------------------
       4️⃣ Generate CSS + HTML
    ---------------------------------------------------------- */
    const css = generateRuntimeCSS(resolvedPage);
    const html = generateRuntimeHTML(resolvedPage);

    console.log("[PREVIEW API] HTML + CSS generated");

    /* ----------------------------------------------------------
       5️⃣ Return PURE JSON
    ---------------------------------------------------------- */
    return NextResponse.json(
      {
        html,
        css,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("[PREVIEW API] Fatal error:", err);
    return NextResponse.json(
      { error: "Preview generation failed" },
      { status: 500 }
    );
  }
}
