import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      text,
      tone = "professional",
      length = "same",
      audience = "general",
    } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a professional website copywriter.

Rules:
- Rewrite the content clearly and naturally
- Preserve meaning
- Preserve structure and formatting (HTML stays HTML)
- Do NOT add emojis
- Do NOT add markdown unless input already contains it
- Do NOT mention AI
- Output ONLY the rewritten text
`;

    const userPrompt = `
Rewrite the following text.

Tone: ${tone}
Length: ${length}
Audience: ${audience}

TEXT:
${text}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rewritten =
      completion.choices[0]?.message?.content?.trim();

    if (!rewritten) {
      throw new Error("Empty AI response");
    }

    return NextResponse.json({
      text: rewritten,
    });
  } catch (error: any) {
    console.error("AI Rewrite Error:", error);

    return NextResponse.json(
      { error: "AI rewrite failed" },
      { status: 500 }
    );
  }
}
