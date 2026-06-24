// /apps/web-app/lib/api/response.ts

import { NextResponse } from "next/server";
import { ApiError } from "./errors";
import { logAiEvent } from "../ai/logAiEvent";

/* ============================================================
   GLOBAL API RESPONSE WRAPPER
   - Handles success formatting
   - Handles errors consistently
   - Logs API events (optional)
============================================================ */

export function ok<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: meta ?? {},
    },
    { status: 200 }
  );
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  );
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/* ============================================================
   ERROR RESPONSE WRAPPER
============================================================ */

export function errorResponse(err: unknown): NextResponse {
  // Custom API Error
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      { status: err.status }
    );
  }

  // Unknown exceptions
  console.error("❌ API ERROR:", err);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong.",
      },
    },
    { status: 500 }
  );
}

/* ============================================================
   SAFE HANDLER WRAPPER
   - Wraps route functions
   - Handles try/catch automatically
   - Allows custom logging (AI, analytics)
============================================================ */

export function apiResponse(handler: Function) {
  return async (req: Request, context: any) => {
    try {
      const result = await handler(req, context);
      return result;
    } catch (err) {
      return errorResponse(err);
    }
  };
}
