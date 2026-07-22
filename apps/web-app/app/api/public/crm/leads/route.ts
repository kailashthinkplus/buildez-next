import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { cleanLead, hashApiKey, leadScore } from "@/lib/crm";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || req.headers.get("x-api-key") || "";
  if (!token) return NextResponse.json({ error: "API key required" }, { status: 401, headers: cors });
  const key = await prisma.crmApiKey.findUnique({ where: { keyHash: hashApiKey(token) } });
  if (!key || key.revokedAt) return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: cors });
  const body = await req.json().catch(() => ({})); const data = cleanLead(body);
  if (!data.email && !data.phone) return NextResponse.json({ error: "Email or phone is required" }, { status: 400, headers: cors });
  const lead = await prisma.crmLead.create({ data: { siteId: key.siteId, ...data, score: leadScore(data) } });
  await prisma.crmApiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return NextResponse.json({ id: lead.id, status: lead.status, createdAt: lead.createdAt }, { status: 201, headers: cors });
}
