// /apps/web-app/lib/auth/getSession.ts

import { cookies } from "next/headers";
import { prisma } from "@buildez/db";
import { SESSION_COOKIE } from "./session";

export interface AuthSession {
  session: any;
  user: any;
  tenant: any | null;
  onboardingCompleted: boolean;
}

/**
 * Unified DB-session loader.
 * Reads the session cookie → loads DB session → loads user → tenant → onboarding.
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();

  const sessionId =
    cookieStore.get(SESSION_COOKIE)?.value ||
    cookieStore.get("session")?.value ||
    cookieStore.get("__Secure-session")?.value;

  if (!sessionId) return null;

  /* ------------------------------
     1️⃣ Load session row
  ------------------------------ */
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revoked: true },
    });
    return null;
  }

  /* ------------------------------
     2️⃣ Load user
  ------------------------------ */
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return null;

  /* ------------------------------
     3️⃣ Load tenant (optional)
  ------------------------------ */
  let tenant = null;

  if (user.tenantId) {
    tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
  }

  /* ------------------------------
     4️⃣ Onboarding
  ------------------------------ */
  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: user.id },
  });

  return {
    session,
    user,
    tenant,
    onboardingCompleted: onboarding?.completed ?? false,
  };
}
