// /Users/kailash/buildez/apps/web-app/app/api/onboarding/complete/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import slugify from "slugify";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

export async function POST(req: Request) {
  /* ---------------------------------------------------------
     0. AUTH CHECK
  --------------------------------------------------------- */
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---------------------------------------------------------
     1. READ PAYLOAD
  --------------------------------------------------------- */
  const {
    accountType,
    companySize,
    primaryUseCase,
    businessName,
  } = await req.json();

  if (!businessName) {
    return NextResponse.json(
      { error: "Business name required" },
      { status: 400 }
    );
  }

  /* ---------------------------------------------------------
     2. CREATE TENANT
  --------------------------------------------------------- */
  const tenant = await prisma.tenant.create({
    data: {
      name: businessName,
    },
  });

  /* ---------------------------------------------------------
     3. ATTACH USER TO TENANT
  --------------------------------------------------------- */
  await prisma.user.update({
    where: { id: user.id },
    data: {
      tenantId: tenant.id,
    },
  });

  /* ---------------------------------------------------------
     4. UPSERT ONBOARDING
  --------------------------------------------------------- */
  await prisma.userOnboarding.upsert({
    where: { userId: user.id },
    update: {
      accountType,
      companySize,
      primaryUseCase,
      businessName,
      completed: true,
    },
    create: {
      userId: user.id,
      accountType,
      companySize,
      primaryUseCase,
      businessName,
      completed: true,
    },
  });

  /* ---------------------------------------------------------
     5. SET COOKIES (Next.js 16 FIX — must await cookies())
  --------------------------------------------------------- */
  const cookieStore = await cookies();

  cookieStore.set("buildez_onboarding", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("buildez_tenant", tenant.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  /* ---------------------------------------------------------
     6. RETURN RESPONSE
  --------------------------------------------------------- */
  return NextResponse.json({
    success: true,
    tenantId: tenant.id,
  });
}
