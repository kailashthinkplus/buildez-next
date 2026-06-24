import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

/* ============================================================
   GET — FETCH SITE LAYOUT
============================================================ */

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const siteId = params.siteId;

  // Verify site belongs to tenant
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      tenantId: tenant.id,
    },
    select: { id: true },
  });

  if (!site) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  const layout = await prisma.siteLayout.findUnique({
    where: { siteId },
    select: {
      header: true,
      footer: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      header: layout?.header ?? null,
      footer: layout?.footer ?? null,
    },
  });
}

/* ============================================================
   PUT — UPDATE SITE LAYOUT
============================================================ */

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const siteId = params.siteId;

  // Verify site ownership
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      tenantId: tenant.id,
    },
    select: { id: true },
  });

  if (!site) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  let body: {
    header?: any;
    footer?: any;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.header && !body.footer) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  // Upsert guarantees layout row exists
  const updated = await prisma.siteLayout.upsert({
    where: { siteId },
    create: {
      siteId,
      header: body.header ?? null,
      footer: body.footer ?? null,
    },
    update: {
      ...(body.header !== undefined && { header: body.header }),
      ...(body.footer !== undefined && { footer: body.footer }),
    },
    select: {
      header: true,
      footer: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
  });
}
