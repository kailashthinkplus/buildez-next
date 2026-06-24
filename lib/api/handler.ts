import { ApiError } from "./error";
import { NextRequest } from "next/server";

export function apiHandler(
  fn: (req: NextRequest) => Promise<any>
) {
  return async function (req: NextRequest) {
    try {
      const data = await fn(req);
      return new Response(
        JSON.stringify({ success: true, data }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err: any) {
      console.error("API Error:", err);

      if (err instanceof ApiError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err.message,
          }),
          {
            status: err.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal Server Error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
