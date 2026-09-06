import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@buildez/db";
import { resolveTenantSiteByHost } from "@/lib/runtime/resolveTenantSiteByHost";
import { isPlatformHost } from "@/lib/runtime/isPlatformHost";

export const dynamic = "force-dynamic";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

// Mirrors PLATFORM_MARKETING_ROUTES in app/sitemap.ts — static marketing
// routes on the platform's own domain, not tenant pages.
const PLATFORM_MARKETING_PAGES: Array<{ title: string; path: string; description: string }> = [
  { title: "Build Ezy", path: "/", description: "Design, launch, sell, and grow from one beautifully connected website platform." },
  { title: "Pricing", path: "/pricing", description: "Plans and pricing for Build Ezy." },
  { title: "Blog", path: "/blog", description: "Build Ezy product updates and articles." },
  { title: "FAQ", path: "/faq", description: "Frequently asked questions about Build Ezy." },
  { title: "Changelog", path: "/changelog", description: "What's new in Build Ezy." },
  { title: "Affiliates", path: "/affiliates", description: "Build Ezy affiliate program." },
  { title: "Support", path: "/support", description: "Get help with Build Ezy." },
];

// llms.txt (llmstxt.org): a plain-text index of the site's pages for AI
// assistants/answer engines to discover and cite content — the GEO
// counterpart to robots.txt/sitemap.xml.
export async function GET() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const protocol = headerList.get("x-forwarded-proto") || "https";

  if (isPlatformHost(host)) {
    const origin = `${protocol}://${host}`;
    const lines = [
      "# Build Ezy",
      "",
      "> Design, launch, sell, and grow from one beautifully connected website platform.",
      "",
      "## Pages",
      "",
      ...PLATFORM_MARKETING_PAGES.map(
        (page) => `- [${page.title}](${page.path === "/" ? origin : `${origin}${page.path}`}): ${page.description}`,
      ),
    ];
    return new NextResponse(lines.join("\n") + "\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

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
