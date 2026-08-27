import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";

function normalizeDomain(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/\.$/, "");
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(raw) ? raw : undefined;
}

export async function GET() {
  const auth = await getUser();
  if (!auth?.tenant || !auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const owner = auth.tenant.ownerId
    ? await prisma.user.findUnique({ where: { id: auth.tenant.ownerId }, select: { id: true, name: true, email: true } })
    : null;
  return NextResponse.json({
    tenant: {
      id: auth.tenant.id,
      name: auth.tenant.name,
      domain: auth.tenant.domain,
      isActive: auth.tenant.isActive,
      aiSuspended: auth.tenant.aiSuspended,
      createdAt: auth.tenant.createdAt,
    },
    owner,
    canManage: Boolean(auth.permissions.manageTenant),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.tenant || !auth.permissions.manageTenant) {
    return NextResponse.json({ error: "You do not have permission to manage workspace settings." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return NextResponse.json({ error: "Workspace name must be between 1 and 120 characters." }, { status: 400 });
  const domain = normalizeDomain(body.domain);
  if (domain === undefined) return NextResponse.json({ error: "Enter a valid domain such as example.com." }, { status: 400 });
  const aiSuspended = typeof body.aiSuspended === "boolean" ? body.aiSuspended : auth.tenant.aiSuspended;
  const tenant = await prisma.tenant.update({
    where: { id: auth.tenant.id },
    data: { name, domain, aiSuspended },
    select: { id: true, name: true, domain: true, isActive: true, aiSuspended: true, createdAt: true },
  });
  await prisma.tenantEvent.create({ data: { tenantId: tenant.id, type: "tenant_settings_updated", payload: { userId: auth.user.id, fields: ["name", "domain", "aiSuspended"] } } });
  return NextResponse.json({ tenant });
}
