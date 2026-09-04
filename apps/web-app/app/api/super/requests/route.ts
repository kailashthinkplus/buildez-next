import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const requests = await prisma.supportRequest.findMany({
      where: query
        ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }, { subject: { contains: query, mode: "insensitive" } }, { message: { contains: query, mode: "insensitive" } }] }
        : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ requests });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.id || !STATUSES.includes(body.status)) return Response.json({ error: "Valid request id and status required" }, { status: 400 });
    const request = await prisma.supportRequest.update({ where: { id: String(body.id) }, data: { status: body.status } });
    return Response.json({ request });
  } catch (error) { return superAdminErrorResponse(error); }
}
