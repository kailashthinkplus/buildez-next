import type { CreativeDirection } from "./creativeDirection";

type PromptArchitectResult = {
  originalPrompt: string;
  expandedPrompt: string;
  expanded: boolean;
};

function looksDetailed(prompt: string) {
  const text = prompt.trim();

  if (text.length >= 220) return true;

  const detailSignals = [
    "hero",
    "section",
    "animation",
    "parallax",
    "3d",
    "webgl",
    "shader",
    "typography",
    "color",
    "layout",
    "responsive",
    "pricing",
    "features",
    "testimonials",
    "footer",
    "navigation",
    "audience",
    "goal",
  ];

  const matches = detailSignals.filter((signal) =>
    text.toLowerCase().includes(signal)
  ).length;

  return matches >= 4;
}

export async function expandV12Prompt(input: {
  apiKey: string;
  model: string;
  prompt: string;
  context: string;
  siteName: string;
  creativeDirection: CreativeDirection;
  signal: AbortSignal;
}): Promise<PromptArchitectResult> {
  const originalPrompt = input.prompt.trim();

  if (!originalPrompt || looksDetailed(originalPrompt)) {
    return {
      originalPrompt,
      expandedPrompt: originalPrompt,
      expanded: false,
    };
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${input.apiKey}`,
        },
        body: JSON.stringify({
          model:
            process.env.OPENAI_V12_PROMPT_ARCHITECT_MODEL ||
            input.model,

          reasoning: {
            effort: "low",
          },

          input: [
            {
              role: "system",
              content: `
You are BuildEZ Prompt Architect.

Expand short or underspecified website-generation requests into a
professional internal website brief.

Do not change the user's core intent.

Use:
- user-selected creative direction
- site/page scope
- audience
- primary goal
- design style
- imagery style
- color mood
- density
- motion style

Do not invent company facts.

Do not add unsupported claims.

The expanded prompt is internal context for downstream design agents.

Return plain text only.
              `.trim(),
            },
            {
              role: "user",
              content: `
SITE:
${input.siteName}

CONTEXT:
${input.context}

ORIGINAL USER PROMPT:
${originalPrompt}

CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection, null, 2)}

Expand this into a concise but professional implementation brief.
              `.trim(),
            },
          ],
        }),
        signal: AbortSignal.any([
          input.signal,
          AbortSignal.timeout(
            Number(
              process.env.OPENAI_V12_PROMPT_ARCHITECT_TIMEOUT_MS ||
              15000
            )
          ),
        ]),
      }
    );

    if (!response.ok) {
      return {
        originalPrompt,
        expandedPrompt: originalPrompt,
        expanded: false,
      };
    }

    const json = await response.json();

    const output =
      typeof json?.output_text === "string"
        ? json.output_text.trim()
        : "";

    if (!output) {
      return {
        originalPrompt,
        expandedPrompt: originalPrompt,
        expanded: false,
      };
    }

    return {
      originalPrompt,
      expandedPrompt: output,
      expanded: true,
    };
  } catch {
    return {
      originalPrompt,
      expandedPrompt: originalPrompt,
      expanded: false,
    };
  }
}
