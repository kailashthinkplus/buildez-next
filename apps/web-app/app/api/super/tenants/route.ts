import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const name = String(body.name || "").trim();
    const domain = String(body.domain || "").trim().toLowerCase() || null;
    const ownerEmail = String(body.ownerEmail || "").trim().toLowerCase();
    if (!name) return Response.json({ error: "Tenant name is required" }, { status: 400 });
    const owner = ownerEmail ? await prisma.user.findUnique({ where: { email: ownerEmail } }) : null;
    if (ownerEmail && !owner) return Response.json({ error: "Owner email does not match an existing user" }, { status: 400 });
    const tenant = await prisma.tenant.create({ data: { name, domain, ownerId: owner?.id, ...(owner ? { users: { connect: { id: owner.id } } } : {}) } });
    await prisma.tenantEvent.create({ data: { tenantId: tenant.id, type: "SUPERADMIN_TENANT_CREATE", payload: { actorId: actor.id } } });
    return Response.json({ tenant }, { status: 201 });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const tenants = await prisma.tenant.findMany({
      where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { domain: { contains: query, mode: "insensitive" } }] } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        owner: { select: { id: true, email: true, name: true } },
        subscription: { select: { status: true, planCode: true, currentPeriodEnd: true } },
        _count: { select: { users: true, sites: true, teams: true } },
      },
    });
    return Response.json({ tenants });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const id = String(body.id || "");
    const data: { isActive?: boolean; aiSuspended?: boolean } = {};
    if (!id) return Response.json({ error: "Tenant id is required" }, { status: 400 });
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.aiSuspended === "boolean") data.aiSuspended = body.aiSuspended;
    if (!Object.keys(data).length) return Response.json({ error: "No valid changes supplied" }, { status: 400 });

    const tenant = await prisma.tenant.update({ where: { id }, data });
    await prisma.tenantEvent.create({
      data: { tenantId: id, type: "SUPERADMIN_CONTROL", payload: { actorId: actor.id, changes: data } },
    });
    return Response.json({ tenant });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
