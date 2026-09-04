import { prisma, UserRole } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

const ROLES = new Set(Object.values(UserRole));

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const role = ROLES.has(body.role) ? body.role as UserRole : UserRole.USER;
    if (!email || !email.includes("@")) return Response.json({ error: "A valid email is required" }, { status: 400 });
    const user = await prisma.user.create({ data: { email, name: name || null, role, isActive: true, isEmailVerified: false } });
    await prisma.systemNotification.create({ data: { type: "SUPERADMIN_USER_CREATE", title: "User created", message: `${actor.email || actor.id} created ${email}`, entityType: "User", entityId: user.id } });
    return Response.json({ user }, { status: 201 });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const url = new URL(req.url);
    const query = (url.searchParams.get("q") || "").trim();
    const users = await prisma.user.findMany({
      where: query
        ? { OR: [{ email: { contains: query, mode: "insensitive" } }, { name: { contains: query, mode: "insensitive" } }] }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, email: true, name: true, role: true, isActive: true,
        isEmailVerified: true, lastLoginAt: true, createdAt: true,
        _count: { select: { ownedTenants: true, tenantUsers: true, sessions: true } },
      },
    });
    return Response.json({ users });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const id = String(body.id || "");
    const data: { isActive?: boolean; role?: UserRole } = {};

    if (!id) return Response.json({ error: "User id is required" }, { status: 400 });
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.role) {
      if (!ROLES.has(body.role)) return Response.json({ error: "Invalid role" }, { status: 400 });
      data.role = body.role;
    }
    if (!Object.keys(data).length) return Response.json({ error: "No valid changes supplied" }, { status: 400 });
    if (id === actor.id && (data.isActive === false || (data.role && data.role !== "SUPER_ADMIN"))) {
      return Response.json({ error: "You cannot remove your own superadmin access" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (data.isActive === false) {
      await prisma.session.updateMany({ where: { userId: id, revoked: false }, data: { revoked: true } });
    }
    await prisma.systemNotification.create({
      data: {
        type: "SUPERADMIN_USER_UPDATE",
        title: "User access updated",
        message: `${actor.email || actor.id} updated ${user.email || user.id}`,
        entityType: "User",
        entityId: user.id,
      },
    });
    return Response.json({ user });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
