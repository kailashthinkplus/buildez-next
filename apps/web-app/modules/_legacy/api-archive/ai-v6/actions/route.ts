import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/getAuthContext";
import { openai } from "@/app/api/ai-v6/_lib/openai";
import { compileAIV6Payload } from "@/modules/builder/ai-v6/compile";

/* ============================================================
   ROUTE — STABLE & CORRECT
============================================================ */

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth?.userId || !auth?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: any;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const compiled = compileAIV6Payload(input);

  try {
    const res = await openai.responses.create({
      model: "gpt-5.1",

      input: [
        { role: "system", content: compiled.payload.system },
        { role: "user", content: compiled.payload.user },
      ],

      // 🔑 THIS IS THE FIX
      text: {
        format: { type: "json_object" },
      },

      max_output_tokens: compiled.payload.max_output_tokens,
    });

    if (!res.output_text) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 502 }
      );
    }

    // 🔒 HARD JSON PARSE
    let parsed;
    try {
      parsed = JSON.parse(res.output_text);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED");
      console.error(res.output_text.slice(-500));
      return NextResponse.json(
        { error: "AI returned invalid JSON", stage: input.stage },
        { status: 502 }
      );
    }

    // 🔒 STAGE GUARD
    if (parsed.stage !== input.stage) {
      return NextResponse.json(
        { error: "Stage mismatch", expected: input.stage },
        { status: 502 }
      );
    }

    return NextResponse.json({
      text: JSON.stringify(parsed),
      usage: res.usage ?? null,
    });
  } catch (err: any) {
    console.error("❌ [AI-V6 OPENAI ERROR]", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
