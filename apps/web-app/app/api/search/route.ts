import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";

type SearchResult = { id: string; type: string; title: string; subtitle: string; href: string };

export async function GET(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (query.length < 2) return NextResponse.json({ results: [] });
  const tenantId = auth.tenant.id;
  const [sites, pages, media, collections, products] = await Promise.all([
    prisma.site.findMany({ where: { tenantId, deletedAt: null, OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] }, take: 6, select: { id: true, name: true, slug: true } }),
    prisma.page.findMany({ where: { deletedAt: null, deleted: false, site: { tenantId, deletedAt: null }, OR: [{ title: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] }, take: 8, select: { id: true, title: true, slug: true, site: { select: { id: true, name: true, slug: true } } } }),
    prisma.mediaAsset.findMany({ where: { site: { tenantId, deletedAt: null }, OR: [{ filename: { contains: query, mode: "insensitive" } }, { title: { contains: query, mode: "insensitive" } }, { alt: { contains: query, mode: "insensitive" } }, { tags: { has: query } }] }, take: 6, select: { id: true, filename: true, site: { select: { slug: true, name: true } } } }),
    prisma.cmsCollection.findMany({ where: { site: { tenantId, deletedAt: null }, OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] }, take: 6, select: { id: true, name: true, slug: true, site: { select: { slug: true, name: true } } } }),
    prisma.shopProduct.findMany({ where: { shop: { tenantId }, OR: [{ title: { contains: query, mode: "insensitive" } }, { handle: { contains: query, mode: "insensitive" } }, { vendor: { contains: query, mode: "insensitive" } }] }, take: 6, select: { id: true, title: true, handle: true, shop: { select: { site: { select: { slug: true, name: true } } } } } }),
  ]);
  const results: SearchResult[] = [
    ...sites.map(site => ({ id: `site:${site.id}`, type: "Website", title: site.name, subtitle: site.slug, href: `/app/${site.slug}/dashboard` })),
    ...pages.map(page => ({ id: `page:${page.id}`, type: "Page", title: page.title, subtitle: page.site.name, href: `/app/${page.site.slug}/${page.slug}-${page.id}` })),
    ...media.map(asset => ({ id: `media:${asset.id}`, type: "Media", title: asset.filename, subtitle: asset.site.name, href: `/app/${asset.site.slug}/media` })),
    ...collections.map(collection => ({ id: `cms:${collection.id}`, type: "CMS", title: collection.name, subtitle: collection.site.name, href: `/app/${collection.site.slug}/cms?collection=${encodeURIComponent(collection.id)}` })),
    ...products.map(product => ({ id: `product:${product.id}`, type: "Product", title: product.title, subtitle: product.shop.site.name, href: `/app/${product.shop.site.slug}/shopez/products/${product.id}` })),
  ];
  const navigation = sites.flatMap(site => [
    { id: `nav:${site.id}:analytics`, type: "Link", title: `${site.name} analytics`, subtitle: "Analytics", href: `/app/${site.slug}/analytics` },
    { id: `nav:${site.id}:insights`, type: "Link", title: `${site.name} AI insights`, subtitle: "AI Insights", href: `/app/${site.slug}/insights` },
    { id: `nav:${site.id}:settings`, type: "Link", title: `${site.name} settings`, subtitle: "Site settings", href: `/app/${site.slug}/settings` },
  ]).filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  const platformLinks: SearchResult[] = [
    { id: "platform:dashboard", type: "Link", title: "Workspace dashboard", subtitle: "Overview of all websites", href: "/app/dashboard" },
    { id: "platform:websites", type: "Link", title: "Websites", subtitle: "Create and manage websites", href: "/app/workspace/websites" },
    { id: "platform:team", type: "Link", title: "Team", subtitle: "Members and permissions", href: "/app/workspace/team" },
    { id: "platform:billing", type: "Link", title: "Billing and subscriptions", subtitle: "Plan, usage and payments", href: "/app/workspace/billing" },
    { id: "platform:settings", type: "Link", title: "Workspace settings", subtitle: "Workspace preferences", href: "/app/workspace/settings" },
    { id: "platform:help", type: "Link", title: "Help and support", subtitle: "Guides and support tickets", href: "/app/help" },
  ].filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  return NextResponse.json({ query, results: [...results, ...navigation, ...platformLinks].slice(0, 30) }, { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}
