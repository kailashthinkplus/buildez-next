import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";
import { publishedSitePath } from "@/lib/runtime/published-site-path";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function GET(_request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: auth.tenant.id, deletedAt: null },
    select: {
      id: true, slug: true, status: true, settings: true, updatedAt: true,
      pages: {
        where: { deletedAt: null },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "asc" }],
        select: { id: true, slug: true, reactCode: true, updatedAt: true, blueprint: { select: { id: true } } },
      },
    },
  });
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404, headers: PRIVATE_HEADERS });

  const frontPageId = record(site.settings).frontPageId;
  const meaningfulPages = site.pages.filter((page) => Boolean(page.blueprint) || Boolean(page.reactCode && page.reactCode.trim().length > 80));
  const page = meaningfulPages.find((candidate) => candidate.id === frontPageId)
    || meaningfulPages.find((candidate) => candidate.slug === "home")
    || meaningfulPages[0];
  const publishedUrl = site.status === "PUBLISHED" ? publishedSitePath(site.slug) : null;
  const previewUrl = publishedUrl || (page ? `/preview/${encodeURIComponent(site.slug)}/${encodeURIComponent(page.slug)}` : null);

  return NextResponse.json({
    meaningful: Boolean(publishedUrl || page),
    previewUrl,
    pageId: page?.id ?? null,
    pageSlug: page?.slug ?? null,
    version: (page?.updatedAt ?? site.updatedAt).getTime(),
    publishedUrl,
  }, { headers: PRIVATE_HEADERS });
}
