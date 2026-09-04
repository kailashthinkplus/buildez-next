// /Users/kailash/buildez/apps/web-app/app/api/health/user/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@buildez/db";

export async function GET() {
  /* ---------------------------------------------------------
     1. Read cookies (Next.js 16 → MUST await cookies())
  --------------------------------------------------------- */
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("session")?.value ||
    cookieStore.get("__Secure-session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  /* ---------------------------------------------------------
     2. Validate session
  --------------------------------------------------------- */
  const session = await prisma.session.findFirst({
    where: {
      id: sessionToken,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantUsers: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  if (!session || !session.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  /* ---------------------------------------------------------
     3. Return user data
  --------------------------------------------------------- */
  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      tenantId: session.user.tenantUsers[0]?.id ?? null,
    },
  });
}
