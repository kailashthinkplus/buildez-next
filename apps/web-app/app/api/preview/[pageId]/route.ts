import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";
import { generateRuntimeCSS } from "../../../../modules/builder/runtime/generateRuntimeCSS";
import { resolveBlueprintTree, type BlueprintData } from "../../../../modules/builder/runtime/resolveBlueprintTree";
import { generateRuntimeHTML } from "../../../../modules/builder/runtime/generateRuntimeHTML";


/**
 * ============================================================
 * PREVIEW API — PURE HTML + CSS
 * ============================================================
 * This renders a page's current (possibly unpublished/draft) content, so
 * unlike the actual published-site runtime it must be restricted to the
 * page's own tenant — it is only ever called by the authenticated builder
 * UI's own preview links.
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

    const auth = await getUser();
    if (!auth?.user || !auth.tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ----------------------------------------------------------
       2️⃣ Fetch blueprint from DB (scoped to the caller's tenant)
    ---------------------------------------------------------- */
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        deletedAt: null,
        deleted: false,
        site: { tenantId: auth.tenant.id },
      },
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
    const resolvedPage = resolveBlueprintTree(data as unknown as BlueprintData);

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
    const css = generateRuntimeCSS(resolvedPage as any);
    const html = generateRuntimeHTML(resolvedPage as any);

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
