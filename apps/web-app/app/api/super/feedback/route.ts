import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

const STATUSES = ["NEW", "REVIEWED", "RESOLVED"];

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const feedback = await prisma.websiteFeedback.findMany({
      where: query
        ? { OR: [{ comment: { contains: query, mode: "insensitive" } }, { site: { name: { contains: query, mode: "insensitive" } } }] }
        : {},
      include: { site: { select: { id: true, name: true, tenant: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return Response.json({ feedback });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function PATCH(req: Request) {
  try {
    await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.id || !STATUSES.includes(body.status)) return Response.json({ error: "Valid feedback id and status required" }, { status: 400 });
    const feedback = await prisma.websiteFeedback.update({ where: { id: String(body.id) }, data: { status: body.status } });
    return Response.json({ feedback });
  } catch (error) { return superAdminErrorResponse(error); }
}
