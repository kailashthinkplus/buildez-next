import { getSession } from "./getSession";
import { cookies } from "next/headers";

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
     2️⃣ TENANT (AUTHORITATIVE)
     Source of truth = middleware-set cookie
     ⚠️ cookies() MUST be awaited in Next 15
  ------------------------------------------------------------ */
  const cookieStore = await cookies();
  const tenantIdFromCookie = cookieStore.get("tenant-id")?.value;

  console.log("[AUTH CONTEXT] tenant cookie", {
    tenantIdFromCookie,
  });

  if (!tenantIdFromCookie) {
    console.error("[AUTH CONTEXT] ❌ tenantId missing (cookie)");
    throw new Error("Invalid auth context");
  }

  /* ------------------------------------------------------------
     ✅ FINAL CONTEXT
  ------------------------------------------------------------ */
  console.log("[AUTH CONTEXT] ✅ resolved", {
    tenantId: tenantIdFromCookie,
    userId,
  });

  return {
    tenantId: tenantIdFromCookie,
    userId,
  };
}
