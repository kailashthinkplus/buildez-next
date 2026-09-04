import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { prepareV10PreflightResponse } from "@/modules/builder-v2/ai-v10/preflight/preflightResponse";

export async function POST(req: NextRequest) {
  try {
    const auth = await getUser();
    if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const result = await prepareV10PreflightResponse(await req.json());
    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: detail || "Website strategy preparation failed" }, { status: 500 });
  }
}
