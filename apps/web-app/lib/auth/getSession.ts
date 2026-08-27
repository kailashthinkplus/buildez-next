// /apps/web-app/lib/auth/getSession.ts

import { prisma } from "@buildez/db";
import { cookies } from "next/headers";
import { getCurrentSession } from "./session";
import { findAccessibleTenant } from "./tenantAccess";

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
  const session = await getCurrentSession();
  if (!session) return null;

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
  const cookieStore = await cookies();
  const requestedTenantId = cookieStore.get("tenant-user-id")?.value === user.id
    ? cookieStore.get("tenant-id")?.value
    : undefined;
  const tenant = await findAccessibleTenant(user.id, requestedTenantId);

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
