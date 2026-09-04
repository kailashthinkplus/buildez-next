import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@buildez/db";
import { resolveTenantSiteByHost } from "@/lib/runtime/resolveTenantSiteByHost";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

// llms.txt (llmstxt.org): a plain-text index of the site's pages for AI
// assistants/answer engines to discover and cite content — the GEO
// counterpart to robots.txt/sitemap.xml.
export async function GET() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const protocol = headerList.get("x-forwarded-proto") || "https";
  const site = await resolveTenantSiteByHost(host);

  if (!site || site.settings.allowIndexing === false) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const origin = `${protocol}://${host}`;
  const pages = await prisma.page.findMany({
    where: { siteId: site.id, status: "PUBLISHED", deletedAt: null, deleted: false },
    select: { title: true, slug: true, metadata: true },
    orderBy: { slug: "asc" },
  });

  const summary = String(site.settings.seoDescription || "");
  const lines = [`# ${site.name}`, ...(summary ? ["", `> ${summary}`] : []), "", "## Pages", ""];
  for (const page of pages) {
    const url = page.slug === "home" ? origin : `${origin}/${page.slug}`;
    const description = String(asRecord(page.metadata).seoDescription || "");
    lines.push(`- [${page.title}](${url})${description ? `: ${description}` : ""}`);
  }

  return new NextResponse(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
