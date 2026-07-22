import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedSite, notFound } from "../../_auth";
import { CRM_STATUSES } from "@/lib/crm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params; const siteId = req.nextUrl.searchParams.get("siteId") || "";
  if (!await authorizedSite(req, siteId)) return notFound();
  const lead = await prisma.crmLead.findFirst({ where: { id: leadId, siteId }, include: { communications: { orderBy: { createdAt: "desc" } } } });
  if (!lead) return notFound();
  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params; const body = await req.json().catch(() => ({}));
  if (!await authorizedSite(req, body.siteId)) return notFound();
  const existing = await prisma.crmLead.findFirst({ where: { id: leadId, siteId: body.siteId } });
  if (!existing) return notFound();
  const status = String(body.status || existing.status).toUpperCase();
  const lead = await prisma.crmLead.update({ where: { id: leadId }, data: {
    ...(CRM_STATUSES.some(value => value === status) ? { status } : {}),
    ...(typeof body.notes === "string" ? { notes: body.notes.slice(0, 5000) } : {}),
    ...(Array.isArray(body.tags) ? { tags: body.tags.filter((x: unknown) => typeof x === "string").slice(0, 20) } : {}),
    ...(["HOT","WARM","COLD"].includes(body.temperature) ? { temperature: body.temperature } : {}),
    ...(typeof body.assignedToId === "string" ? { assignedToId: body.assignedToId || null, assignedToName: typeof body.assignedToName === "string" ? body.assignedToName : null } : {}),
    ...(body.markContacted ? { lastContactedAt: new Date() } : {}),
  } });
  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params; const siteId = req.nextUrl.searchParams.get("siteId") || "";
  if (!await authorizedSite(req, siteId)) return notFound();
  const result = await prisma.crmLead.deleteMany({ where: { id: leadId, siteId } });
  if (!result.count) return notFound();
  return NextResponse.json({ ok: true });
}
