import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { generateRuntimeCSS } from "@/modules/builder/runtime/generateRuntimeCSS";
import { resolveBlueprintTree } from "@/modules/builder/runtime/resolveBlueprintTree";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ siteSlug: string; pageSlug: string }> }
) {
  const { siteSlug, pageSlug } = await ctx.params;

  console.log("🎨 CSS RUNTIME HIT:", siteSlug, pageSlug);

  const page = await prisma.page.findFirst({
    where: {
      slug: pageSlug,
      status: "PUBLISHED",
      deletedAt: null,
      site: {
        slug: siteSlug,
        status: "PUBLISHED",
      },
    },
    select: {
      blueprint: true,
      updatedAt: true,
    },
  });

  if (!page || !page.blueprint) {
    console.warn("❌ CSS NOT FOUND:", { siteSlug, pageSlug });
    return new NextResponse("/* CSS NOT FOUND */", {
      status: 404,
      headers: { "Content-Type": "text/css" },
    });
  }

  const tree = resolveBlueprintTree(page.blueprint.data as any);
  const css = generateRuntimeCSS(tree as any);

  return new NextResponse(css, {
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
