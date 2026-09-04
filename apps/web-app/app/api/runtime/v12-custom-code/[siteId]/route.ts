import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export const dynamic = "force-dynamic";

/*
 * Public, unauthenticated: fetched client-side by every visitor of a
 * published V12 site (see the bootstrap script injected by
 * modules/runtime/v12PublishedBundle.ts) to pick up that page's custom
 * CSS/JS. Scoped strictly to PUBLISHED sites/pages — never leaks drafts.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const slug = req.nextUrl.searchParams.get("slug")?.trim() || "home";

  const site = await prisma.site.findFirst({
    where: { id: siteId, status: "PUBLISHED", deletedAt: null },
    select: { id: true },
  });
  if (!site) {
    return NextResponse.json({ customCss: "", customJs: "" }, { headers: { "cache-control": "no-store" } });
  }

  const page = await prisma.page.findFirst({
    where: { siteId: site.id, slug, status: "PUBLISHED", deletedAt: null, deleted: false },
    select: { customCss: true, customJs: true },
  });

  return NextResponse.json(
    { customCss: page?.customCss ?? "", customJs: page?.customJs ?? "" },
    { headers: { "cache-control": "no-store" } },
  );
}
