// /Users/kailash/buildez/apps/web-app/app/api/ai-v8/refine-react/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  extractAssistantText,
} from "@/app/api/_lib/openai";

/* ============================================================
   SYSTEM PROMPT FOR REFINEMENT
============================================================ */

const SYSTEM_PROMPT = `You are an expert React/Next.js developer specializing in code refinement. Your task is to modify existing React components based on user requests.

CRITICAL RULES:
1. PRESERVE the overall structure and functionality
2. ONLY modify the parts mentioned in the user request
3. Return the COMPLETE modified component code
4. Maintain TypeScript and Tailwind CSS
5. Keep the code clean and production-ready
6. NO markdown, NO explanations, ONLY code
7. Start with "use client"; if not present
8. Do NOT include import statements (preview runtime executes in-function)

REFINEMENT GUIDELINES:
- Make surgical changes - don't rewrite everything
- Preserve existing props and state
- Maintain responsive design
- Keep accessibility features
- Update only relevant sections
- Preserve data-buildez-id attributes
- Keep transitions and animations

OUTPUT FORMAT:
Return ONLY the complete, refined TypeScript/React component code.`;

/* ============================================================
   POST /api/ai-v8/refine-react
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentCode, userRequest, targetSection, brandContext } = body;

    if (!currentCode?.trim()) {
      return NextResponse.json(
        { error: "currentCode is required" },
        { status: 400 }
      );
    }

    if (!userRequest?.trim()) {
      return NextResponse.json(
        { error: "userRequest is required" },
        { status: 400 }
      );
    }

    console.log("[AI-Refine-React] Starting refinement:", {
      codeLength: currentCode.length,
      requestLength: userRequest.length,
      targetSection: targetSection || "entire component",
    });

    /* ============================================================
       BUILD REFINEMENT PROMPT
    ============================================================ */

    let enhancedPrompt = `Here is the current React component code:

\`\`\`tsx
${currentCode}
\`\`\`

User's refinement request:
${userRequest}

`;

    if (targetSection) {
      enhancedPrompt += `\nFocus on modifying the "${targetSection}" section.\n`;
    }

    if (brandContext?.logoUrl) {
      enhancedPrompt += `\nBrand Logo: ${brandContext.logoUrl}\n`;
    }

    if (brandContext?.designTokens?.colors) {
      const colors = brandContext.designTokens.colors;
      enhancedPrompt += `\nBrand Colors (use these if adding new elements):
- Primary: ${colors.primary || "#2563eb"}
- Secondary: ${colors.secondary || "#8b5cf6"}
- Accent: ${colors.accent || "#ec4899"}
`;
    }

    enhancedPrompt += `\nReturn the complete refined component with the requested changes applied. Include "use client"; at the top.`;

    /* ============================================================
       CALL OPENAI GPT-4
    ============================================================ */

    const startTime = Date.now();

    const completion = await callOpenAIChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: enhancedPrompt,
        },
      ],
      temperature: 0.35,
      maxCompletionTokens: 8000,
    });

    const generationTime = Date.now() - startTime;

    const rawContent = extractAssistantText(completion);
    if (!rawContent) {
      throw new Error("OpenAI returned empty response");
    }

    let code = rawContent.trim();

    // Extract code from markdown blocks
    const codeBlockMatch = code.match(
      /```(?:tsx?|jsx?|typescript|javascript)?\s*([\s\S]+?)\s*```/i
    );
    if (codeBlockMatch) {
      code = codeBlockMatch[1].trim();
    }
    code = code.replace(/```[a-zA-Z]*\s*/g, "").trim();
    code = code.replace(/^\s*import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "");
    code = code.replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "").trim();

    // Validation
    if (!code.includes('"use client"') && !code.includes("'use client'")) {
      code = '"use client";\n\n' + code;
    }

    if (!code.includes("export default")) {
      console.error("[AI-Refine-React] Invalid code format:", code.substring(0, 200));
      throw new Error("Refined code is not a valid React component");
    }

    console.log("[AI-Refine-React] Refinement successful", {
      codeLength: code.length,
      generationTime: `${generationTime}ms`,
      tokensUsed: completion.usage?.total_tokens || "N/A",
    });

    return NextResponse.json({
      success: true,
      code,
      metadata: {
        generationTime,
        codeLength: code.length,
        tokensUsed: completion.usage?.total_tokens || null,
        model: completion.model || "gpt-4o",
      },
    });
  } catch (error: unknown) {
    console.error("[AI-Refine-React] Error:", error);
    const err = error as { status?: number; code?: string; message?: string; stack?: string };

    // Handle specific errors
    if (err.status === 429 || err.code === "rate_limit_exceeded") {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again." },
        { status: 429 }
      );
    }

    if (err.status === 401 || err.code === "invalid_api_key") {
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    if (err.code === "context_length_exceeded") {
      return NextResponse.json(
        { error: "Code too long. Please simplify your request." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: err.message || "Refinement failed",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
