import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { readV10Progress } from "@/modules/builder-v2/ai-v10/progress/v10GenerationProgress";

export async function GET(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const runId = req.nextUrl.searchParams.get("runId")?.trim();
  if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 });
  return NextResponse.json({ progress: readV10Progress(runId) });
}

