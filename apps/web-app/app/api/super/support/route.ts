import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function POST(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    const siteId = String(body.siteId || "");
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    if (!siteId || !subject || !message) return Response.json({ error: "Website ID, subject and details are required" }, { status: 400 });
    const ticketNumber = `BEZ-${Date.now().toString(36).toUpperCase()}`;
    const ticket = await prisma.crmLead.create({ data: { siteId, name: String(body.name || "Platform admin").trim(), email: String(body.email || actor.email || "").trim() || null, message, source: "support-ticket", status: "NEW", tags: ["support", String(body.priority || "normal")], customData: { ticketNumber, subject, priority: body.priority || "normal", createdByAdmin: actor.id } } });
    return Response.json({ ticket }, { status: 201 });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim();
    const tickets = await prisma.crmLead.findMany({
      where: { source: "support-ticket", ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }, { message: { contains: query, mode: "insensitive" } }] } : {}) },
      orderBy: { createdAt: "desc" }, take: 200,
      include: { site: { select: { id: true, name: true, tenant: { select: { id: true, name: true } } } }, communications: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    return Response.json({ tickets });
  } catch (error) { return superAdminErrorResponse(error); }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireSuperAdmin(req);
    const body = await req.json();
    if (!body.id || !["NEW", "OPEN", "WAITING", "RESOLVED", "CLOSED"].includes(body.status)) return Response.json({ error: "Valid ticket and status required" }, { status: 400 });
    const ticket = await prisma.crmLead.update({ where: { id: String(body.id), source: "support-ticket" }, data: { status: body.status, ...(body.status === "RESOLVED" || body.status === "CLOSED" ? { lastContactedAt: new Date() } : {}) } });
    await prisma.crmCommunication.create({ data: { leadId: ticket.id, type: "STATUS", direction: "INTERNAL", content: `Status changed to ${body.status}`, createdBy: actor.id } });
    return Response.json({ ticket });
  } catch (error) { return superAdminErrorResponse(error); }
}
