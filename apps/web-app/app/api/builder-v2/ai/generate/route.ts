import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function POST(req: NextRequest) {
  try {
    const { pageId, prompt } = await req.json();

    if (!pageId || !prompt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { siteId: true },
    });

    if (!page?.siteId) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const origin = new URL(req.url).origin;

    const forwardRes = await fetch(`${origin}/api/ai-v8/generate-react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt: prompt, siteId: page.siteId, pageId }),
      cache: "no-store",
    });

    const text = await forwardRes.text();

    return new NextResponse(text, {
      status: forwardRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    const message = err?.message || "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
