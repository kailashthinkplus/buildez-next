// apps/web-app/modules/builder/ai-v6/compile.ts

import {
  CompileInput,
  CompiledAIPayload,
} from "./types";
import {
  AI_LIMITS,
  estimateTokens,
} from "./limits";
import {
  buildSystemPrompt,
  buildUserPrompt,
} from "./prompt";

/* ============================================================
   STAGE OUTPUT LIMITS (HARD SAFETY)
   - Prevents JSON truncation
   - One bounded schema per stage
============================================================ */

const STAGE_OUTPUT_TOKENS: Record<
  CompileInput["stage"],
  number
> = {
  layout: 220,
  content: 500,
  design: 300,
};

/* ============================================================
   AI-V6 PAYLOAD COMPILER (AUTHORITATIVE)
============================================================ */

export function compileAIV6Payload(
  input: CompileInput
): CompiledAIPayload {
  const { stage } = input;

  /* ----------------------------------------------------------
     SYSTEM PROMPT (STAGE-SAFE)
  ---------------------------------------------------------- */
  const system = buildSystemPrompt(stage);

  /* ----------------------------------------------------------
     USER PROMPT (MINIMAL, STAGE-AWARE)
  ---------------------------------------------------------- */
  const user = buildUserPrompt(input);

  /* ----------------------------------------------------------
     OUTPUT TOKEN LIMIT (PER STAGE)
  ---------------------------------------------------------- */
  const maxOutputTokens =
    STAGE_OUTPUT_TOKENS[stage] ??
    AI_LIMITS.MAX_OUTPUT_TOKENS;

  /* ----------------------------------------------------------
     TOKEN ESTIMATION
  ---------------------------------------------------------- */
  const systemTokens = estimateTokens(system);
  const userTokens = estimateTokens(user);

  const estimatedTokens =
    systemTokens +
    userTokens +
    maxOutputTokens;

  /* ----------------------------------------------------------
     HARD SAFETY GUARD (NO PARTIAL JSON EVER)
  ---------------------------------------------------------- */
  if (estimatedTokens > AI_LIMITS.MAX_TOTAL_TOKENS) {
    console.error("🚨 [AI-V6] Payload rejected (token overflow)", {
      stage,
      systemTokens,
      userTokens,
      maxOutputTokens,
      estimatedTokens,
      limit: AI_LIMITS.MAX_TOTAL_TOKENS,
    });

    throw new Error(
      JSON.stringify({
        error: "Request too large to generate safely",
        stage,
        estimatedTokens,
        limit: AI_LIMITS.MAX_TOTAL_TOKENS,
      })
    );
  }

  /* ----------------------------------------------------------
     TRACE LOG (CRITICAL FOR DEBUGGING)
  ---------------------------------------------------------- */
  console.group("🧠 [AI-V6 COMPILED PAYLOAD]");
  console.log("Stage:", stage);
  console.log("System tokens:", systemTokens);
  console.log("User tokens:", userTokens);
  console.log("Max output tokens:", maxOutputTokens);
  console.log("Estimated total tokens:", estimatedTokens);
  console.groupEnd();

  /* ----------------------------------------------------------
     FINAL PAYLOAD (IMMUTABLE)
  ---------------------------------------------------------- */
  return {
    provider: "openai",
    model: "gpt-5.1",
    payload: {
      system,
      user,
      max_output_tokens: maxOutputTokens,
    },
    estimatedTokens,
  };
}
