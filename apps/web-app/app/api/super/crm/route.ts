import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const siteId = String(body.siteId || "");
    const name = String(body.name || "").trim();
    if (!siteId || !name) return Response.json({ error: "Website ID and lead name are required" }, { status: 400 });
    const lead = await prisma.crmLead.create({ data: { siteId, name, email: String(body.email || "").trim() || null, phone: String(body.phone || "").trim() || null, company: String(body.company || "").trim() || null, source: "superadmin", status: "NEW", assignedToId: actor.id, assignedToName: actor.name || actor.email || "Superadmin" } });
    return Response.json({ lead }, { status: 201 });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const leads = await prisma.crmLead.findMany({
      where: { source: { not: "support-ticket" }, ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }, { company: { contains: query, mode: "insensitive" } }] } : {}) },
      orderBy: { createdAt: "desc" }, take: 200,
      include: { site: { select: { id: true, name: true, tenant: { select: { id: true, name: true } } } }, _count: { select: { communications: true } } },
    });
    return Response.json({ leads });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.id || !["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].includes(body.status)) return Response.json({ error: "Valid lead and status required" }, { status: 400 });
    const lead = await prisma.crmLead.update({ where: { id: String(body.id) }, data: { status: body.status, lastContactedAt: new Date() } });
    await prisma.crmCommunication.create({ data: { leadId: lead.id, type: "STATUS", direction: "INTERNAL", content: `Status changed to ${body.status}`, createdBy: actor.id } });
    return Response.json({ lead });
  } catch (error) { return superAdminErrorResponse(error); }
}
