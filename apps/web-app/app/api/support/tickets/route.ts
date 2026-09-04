import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";

const clean = (value: unknown, max = 1000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function GET() {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tickets = await prisma.crmLead.findMany({
    where: { site: { tenantId: auth.tenant.id }, source: "support-ticket" },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { id: true, status: true, message: true, customData: true, createdAt: true },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const subject = clean(body.subject, 160);
  const details = clean(body.details, 5000);
  const category = clean(body.category, 40) || "General";
  const priority = ["low", "normal", "high", "urgent"].includes(body.priority) ? body.priority : "normal";
  if (!subject || !details) return NextResponse.json({ error: "Subject and details are required" }, { status: 400 });
  const site = await prisma.site.findFirst({
    where: { tenantId: auth.tenant.id, deletedAt: null, ...(clean(body.siteId, 100) ? { id: clean(body.siteId, 100) } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (!site) return NextResponse.json({ error: "Choose a valid website" }, { status: 400 });
  const ticketNumber = `BEZ-${Date.now().toString(36).toUpperCase()}`;
  const ticket = await prisma.crmLead.create({
    data: {
      siteId: site.id,
      name: auth.user.name || auth.user.email || "BuildEZ customer",
      email: auth.user.email || null,
      message: details,
      source: "support-ticket",
      status: "NEW",
      temperature: priority === "urgent" ? "HOT" : "WARM",
      tags: ["support", category.toLowerCase(), priority],
      customData: { ticketNumber, subject, category, priority, website: site.name },
    },
    select: { id: true, status: true, createdAt: true, customData: true },
  });
  return NextResponse.json({ ticket: { ...ticket, ticketNumber } }, { status: 201 });
}
