// /apps/web-app/lib/api/apiHandler.ts

import { NextRequest, NextResponse } from "next/server";
import { getUser, type AuthContext } from "../auth/getUser";
import { v4 as uuidv4 } from "uuid";

/* ============================================================
   API CONTEXT (LOCKED — AUTH CONTEXT PRESERVED)
============================================================ */

export interface ApiContext {
  req: NextRequest | Request;
  auth: AuthContext;          // ✅ FULL AuthContext (CRITICAL)
  params?: Record<string, string>;
  requestId: string;
}

/* ============================================================
   STANDARD JSON RESPONSE FORMAT (LOCKED)
============================================================ */

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data: status < 400 ? data : null,
      error: status >= 400 ? data : null,
    },
    { status }
  );
}

/* ============================================================
   UNIFIED API HANDLER — V5 (MINIMAL LOGGING)
============================================================ */

export function apiHandler(
  handler: (context: ApiContext) => Promise<any>,
  opts: { requireTenant?: boolean } = {}
) {
  return async function (
    req: NextRequest | Request,
    context?: { params?: Record<string, string> }
  ) {
    const requestId = uuidv4();

    try {
      /* -------------------------------------------------------
         REQUEST TRACE (ONE LINE ONLY)
      -------------------------------------------------------- */
      console.log(
        `[API] ${req.method} ${req.url}`,
        { requestId }
      );

      /* -------------------------------------------------------
         LOAD AUTH CONTEXT (AUTHORITATIVE)
      -------------------------------------------------------- */
      const auth = await getUser();

      if (!auth || !auth.user) {
        console.error("[API] UNAUTHORIZED", { requestId });
        return jsonResponse("UNAUTHORIZED", 401);
      }

      if (opts.requireTenant && !auth.tenant) {
        console.error("[API] TENANT_NOT_FOUND", { requestId });
        return jsonResponse("TENANT_NOT_FOUND", 400);
      }

      /* -------------------------------------------------------
         BUILD CONTEXT (AUTH PRESERVED)
      -------------------------------------------------------- */
      const ctx: ApiContext = {
        req,
        auth,
        params: context?.params ?? {},
        requestId,
      };

      /* -------------------------------------------------------
         EXECUTE HANDLER
      -------------------------------------------------------- */
      const result = await handler(ctx);
      return jsonResponse(result, 200);
    } catch (err: any) {
      /* -------------------------------------------------------
         🔥 ONLY ERROR LOG THAT MATTERS
      -------------------------------------------------------- */
      console.error("[API] ERROR", {
        requestId,
        message: err?.message,
        stack:
          process.env.NODE_ENV === "development"
            ? err?.stack
            : undefined,
      });

      return jsonResponse(
        {
          message: err?.message ?? "Internal Server Error",
          requestId,
        },
        500
      );
    }
  };
}
