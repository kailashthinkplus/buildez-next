import type { CreativeDirection } from "./creativeDirection";
import type { V12CapabilityPlan } from "./capabilityRouter";

type DirectorResult = {
  specification: string;
  status: "planned" | "fallback";
};

function object(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function outputText(payload: unknown) {
  const root = object(payload);

  if (typeof root.output_text === "string") {
    return root.output_text.trim();
  }

  return (Array.isArray(root.output) ? root.output : [])
    .flatMap((item) => {
      const content = object(item).content;
      return Array.isArray(content) ? content : [];
    })
    .map((item) => {
      const value = object(item);
      return typeof value.text === "string"
        ? value.text
        : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function createOriginalDesignDirectorPlan(input: {
  apiKey: string;
  model: string;
  siteName: string;
  request: string;
  creativeDirection: CreativeDirection;
  capabilityPlan: V12CapabilityPlan;
  brandContext?: string;
  signal: AbortSignal;
}): Promise<DirectorResult> {
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
            process.env.OPENAI_V12_DIRECTOR_MODEL ||
            input.model,

          reasoning: {
            effort: "medium",
          },

          tools: [
            {
              type: "web_search",
              search_context_size: "medium",
            },
          ],

          tool_choice: "auto",

          input: [
            {
              role: "system",
              content: `
You are BuildEZ Creative Director.

You plan the visual experience BEFORE code generation.

Your job is to create a specific, contemporary and executable
art direction.

You may research current design conventions for inspiration.

Never copy another website.

Never copy competitor branding or content.

Avoid generic AI landing-page patterns.

A professional site should have:
- strong visual hierarchy
- brand-specific composition
- purposeful media
- section variety
- intentional backgrounds
- typography strategy
- depth
- micro-interactions
- responsive art direction
- motion appropriate to the selected style

For immersive requests, explicitly plan:
- parallax
- scroll choreography
- WebGL
- shaders
- 3D scenes
- interactive objects
when required.

Do NOT force advanced effects into a traditional site.

Avoid:
- hero + logo strip + four cards + CTA boilerplate
- repetitive card grids
- repeated flat white sections
- generic icon-only feature sections
- excessive empty space
- arbitrary gradients
- unnecessary WebGL
- visually unfinished minimalism

For normal full marketing pages, plan at least four meaningful visual
assets unless a typography-only direction is genuinely appropriate.

Return JSON only.
              `.trim(),
            },

            {
              role: "user",
              content: `
SITE NAME:
${input.siteName}

USER REQUEST:
${input.request}

CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection, null, 2)}

CAPABILITY PLAN:
${JSON.stringify(input.capabilityPlan, null, 2)}

VERIFIED BRAND CONTEXT:
${input.brandContext || "No verified brand context available."}

Return JSON with:

{
  "creativeConcept": "",
  "visualNarrative": "",
  "brandExpression": "",
  "typographyStrategy": "",
  "colorStrategy": "",
  "backgroundStrategy": "",
  "depthStrategy": "",
  "layoutRhythm": "",
  "motionSystem": "",
  "responsiveStrategy": "",
  "designResearchObservations": [],
  "patternsToAvoid": [],
  "assetRequirements": [
    {
      "role": "",
      "purpose": "",
      "visualTreatment": "",
      "generationPrompt": ""
    }
  ],
  "sections": [
    {
      "id": "",
      "purpose": "",
      "composition": "",
      "visualAnchor": "",
      "imagery": "",
      "iconography": "",
      "backgroundTreatment": "",
      "interaction": "",
      "scrollBehavior": "",
      "responsiveTransformation": ""
    }
  ]
}
              `.trim(),
            },
          ],
        }),

        signal: AbortSignal.any([
          input.signal,
          AbortSignal.timeout(
            Number(
              process.env.OPENAI_V12_DIRECTOR_TIMEOUT_MS ||
              45000
            )
          ),
        ]),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Creative Director request failed (${response.status})`
      );
    }

    const json = await response.json();

    const text = outputText(json);

    if (!text) {
      throw new Error(
        "Creative Director returned empty output."
      );
    }

    return {
      specification: text,
      status: "planned",
    };
  } catch (error) {
    if (input.signal.aborted) throw error;

    console.warn(
      "[V12 CREATIVE DIRECTOR] fallback",
      error
    );

    return {
      status: "fallback",

      specification: JSON.stringify(
        {
          creativeConcept:
            "Create a brand-specific contemporary website rather than a generic AI template.",

          patternsToAvoid: [
            "generic hero and cards template",
            "repetitive card grids",
            "consecutive flat sections",
            "missing visual assets",
            "generic icon-only sections",
          ],

          assetRequirements: [
            {
              role: "hero visual",
              purpose:
                "Provide a meaningful visual anchor",
              visualTreatment:
                "Brand-specific hero media",
              generationPrompt: input.request,
            },

            {
              role: "supporting visual",
              purpose:
                "Support the narrative",
              visualTreatment:
                "Editorial or product-specific visual",
              generationPrompt: input.request,
            },

            {
              role: "secondary visual",
              purpose:
                "Create section variety",
              visualTreatment:
                "Distinct from hero media",
              generationPrompt: input.request,
            },

            {
              role: "background treatment",
              purpose:
                "Add atmosphere and visual depth",
              visualTreatment:
                "Brand-appropriate background artwork",
              generationPrompt: input.request,
            },
          ],
        },
        null,
        2
      ),
    };
  }
}
