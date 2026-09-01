import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { ApiError } from "@/lib/api/errors";
import { enforceSiteLimit } from "@/lib/plan/enforce";
import { isReservedPublicSiteSlug } from "@/lib/sites/public-slug";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ============================================================
   GET — LIST SITES FOR TENANT
============================================================ */

export async function GET(req: NextRequest) {
  const tenant = await verifyTenantAccess(req);

  if (!tenant) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const sites = await prisma.site.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      designTokens: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    sites,
  });
}

/* ============================================================
   POST — CREATE SITE FOR TENANT
============================================================ */

export async function POST(req: NextRequest) {
  const tenant = await verifyTenantAccess(req);

  if (!tenant) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const input =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const name =
    typeof input.name === "string" ? input.name.trim() : "";

  const slug =
    typeof input.slug === "string"
      ? input.slug.trim().toLowerCase()
      : "";

  if (!name) {
    return NextResponse.json(
      { error: "Website name is required." },
      { status: 400 },
    );
  }

  if (name.length > 120) {
    return NextResponse.json(
      { error: "Website name must be 120 characters or fewer." },
      { status: 400 },
    );
  }

  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      {
        error:
          "Site slug must contain lowercase letters, numbers, and single hyphens only.",
      },
      { status: 400 },
    );
  }

  if (isReservedPublicSiteSlug(slug)) {
    return NextResponse.json(
      { error: "That website address is reserved. Choose another one." },
      { status: 409 },
    );
  }

  try {
    await enforceSiteLimit(tenant.id);
  } catch (reason) {
    if (reason instanceof ApiError) {
      return NextResponse.json(
        { error: reason.message, code: reason.code },
        { status: reason.status },
      );
    }
    throw reason;
  }

  const existingSite = await prisma.site.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (existingSite) {
    return NextResponse.json(
      { error: "That website address is already in use." },
      { status: 409 },
    );
  }

  try {
    const site = await prisma.site.create({
      data: {
        tenantId: tenant.id,
        name,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        site,
      },
      { status: 201 },
    );
  } catch (reason: unknown) {
    const error =
      reason && typeof reason === "object"
        ? (reason as { code?: string })
        : null;

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "That website address is already in use." },
        { status: 409 },
      );
    }

    console.error("[api/sites] Failed to create website", reason);

    return NextResponse.json(
      { error: "Website could not be created." },
      { status: 500 },
    );
  }
}
