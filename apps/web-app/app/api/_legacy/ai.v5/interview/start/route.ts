import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/getSession";
import { AI_INTERVIEW_FLOW } from "@/modules/builder/ai/questions";

export async function POST() {
  const session = await getSession();
  if (!session?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    questions: AI_INTERVIEW_FLOW,
    step: 0,
  });
}
