import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/getAuthContext";
import { runAIV7 } from "@/modules/builder/ai-v7/runAIV7";

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth?.userId || !auth?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt, page, sectionId } = await req.json();

  if (!prompt || !page || !sectionId) {
    return NextResponse.json(
      { error: "prompt, page, sectionId required" },
      { status: 400 }
    );
  }

  const updatedPage = await runAIV7({
    prompt,
    page,
    targetSectionId: sectionId,
  });

  return NextResponse.json({ page: updatedPage });
}
