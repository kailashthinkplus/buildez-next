import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedSite, notFound } from "../_auth";
import { cleanLead, leadScore } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId") || "";
  if (!await authorizedSite(req, siteId)) return notFound();
  const status = req.nextUrl.searchParams.get("status");
  const query = req.nextUrl.searchParams.get("q")?.trim();
  const from = req.nextUrl.searchParams.get("from"); const to = req.nextUrl.searchParams.get("to");
  const where = { siteId, ...(status && status !== "ALL" ? { status } : {}), ...((from||to) ? { createdAt: { ...(from?{gte:new Date(`${from}T00:00:00`)}:{}), ...(to?{lte:new Date(`${to}T23:59:59.999`)}:{}) } } : {}), ...(query ? { OR: ["name","email","phone","company"].map((field) => ({ [field]: { contains: query, mode: "insensitive" as const } })) } : {}) };
  const [leads, total, grouped] = await Promise.all([
    prisma.crmLead.findMany({ where, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.crmLead.count({ where: { siteId } }),
    prisma.crmLead.groupBy({ by: ["status"], where: { siteId }, _count: true }),
  ]);
  return NextResponse.json({ leads, total, counts: Object.fromEntries(grouped.map(x => [x.status, x._count])) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!await authorizedSite(req, body.siteId)) return notFound();
  const data = cleanLead({ ...body, source: body.source || "manual" });
  if (!data.email && !data.phone) return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
  const lead = await prisma.crmLead.create({ data: { siteId: body.siteId, ...data, score: leadScore(data) } });
  return NextResponse.json({ lead }, { status: 201 });
}
