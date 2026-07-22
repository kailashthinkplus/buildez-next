import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { prepareV11Direction } from "@/modules/builder-v2/ai-v11/preflight/prepareV11Direction";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json() as { prompt?: string; context?: Record<string, unknown> };
  if (!body.prompt?.trim()) return NextResponse.json({ error: "Tell us what you would like to build." }, { status: 400 });
  return NextResponse.json(prepareV11Direction({ prompt: body.prompt.trim(), context: body.context }));
}
