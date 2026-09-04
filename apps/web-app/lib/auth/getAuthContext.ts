import { getSession } from "./getSession";

/* ============================================================
   AUTH CONTEXT (AUTHORITATIVE)
   - userId from session
   - tenantId resolved from middleware cookie
   - Next.js 15 compliant (async cookies)
============================================================ */

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export async function getAuthContext(): Promise<AuthContext> {
  console.log("[AUTH CONTEXT] resolving auth context…");

  /* ------------------------------------------------------------
     1️⃣ SESSION (USER)
  ------------------------------------------------------------ */
  const sessionData = await getSession();

  console.log("[AUTH CONTEXT] session payload", {
    hasSession: Boolean(sessionData),
    keys: sessionData ? Object.keys(sessionData) : null,
    sessionUserId: sessionData?.session?.userId,
    userId: sessionData?.user?.id,
  });

  const userId =
    sessionData?.session?.userId ??
    sessionData?.user?.id ??
    null;

  if (!userId) {
    console.error("[AUTH CONTEXT] ❌ userId missing");
    throw new Error("Invalid auth context");
  }

  /* ------------------------------------------------------------
     2️⃣ TENANT (AUTHORIZATION-CHECKED BY getSession)
  ------------------------------------------------------------ */
  const tenantId = sessionData?.tenant?.id ?? null;

  if (!tenantId) {
    console.error("[AUTH CONTEXT] ❌ authorized tenant missing");
    throw new Error("Invalid auth context");
  }

  /* ------------------------------------------------------------
     ✅ FINAL CONTEXT
  ------------------------------------------------------------ */
  console.log("[AUTH CONTEXT] ✅ resolved", {
    tenantId,
    userId,
  });

  return {
    tenantId,
    userId,
  };
}
