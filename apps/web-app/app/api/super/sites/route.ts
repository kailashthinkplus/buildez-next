import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";
import { isReservedPublicSiteSlug } from "@/lib/sites/public-slug";

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    const tenantId = String(body.tenantId || "");
    if (!name || !slug || !tenantId) return Response.json({ error: "Name, slug and tenant ID are required" }, { status: 400 });
    if (isReservedPublicSiteSlug(slug)) return Response.json({ error: "That website address is reserved" }, { status: 409 });
    const duplicate = await prisma.site.findFirst({ where: { slug, deletedAt: null }, select: { id: true } });
    if (duplicate) return Response.json({ error: "That website address is already in use" }, { status: 409 });
    const site = await prisma.site.create({ data: { name, slug, tenantId } });
    await prisma.tenantEvent.create({ data: { tenantId, type: "SUPERADMIN_SITE_CREATE", payload: { actorId: actor.id, siteId: site.id } } });
    return Response.json({ site }, { status: 201 });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const sites = await prisma.site.findMany({
      where: {
        deletedAt: null,
        ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
      include: {
        tenant: { select: { id: true, name: true, isActive: true } },
        domains: { select: { domain: true, status: true }, take: 2 },
        _count: { select: { pages: true, mediaAssets: true } },
      },
    });
    return Response.json({ sites });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const id = String(body.id || "");
    if (!id || !["DRAFT", "PUBLISHED"].includes(body.status)) {
      return Response.json({ error: "A valid site id and status are required" }, { status: 400 });
    }
    const site = await prisma.site.update({ where: { id }, data: { status: body.status } });
    await prisma.tenantEvent.create({
      data: { tenantId: site.tenantId, type: "SUPERADMIN_SITE_STATUS", payload: { actorId: actor.id, siteId: id, status: body.status } },
    });
    return Response.json({ site });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
