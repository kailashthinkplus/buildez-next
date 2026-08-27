import type { V12ExperiencePlannerResult } from "./experiencePlanner";

export type V12AssetToolPlan = {
  needsGeneratedImages: boolean;
  needsVideo: boolean;
  needs3DAssets: boolean;
  needsShaderCode: boolean;
  needsCustomSvg: boolean;
  needsDataViz: boolean;
  needsIcons: boolean;
  imageRequirements: Array<{
    role: string;
    purpose: string;
    prompt: string;
    aspect: "landscape" | "portrait" | "square";
    medium: string;
    useRequestedMedium: boolean;
  }>;
  videoRequirements: Array<{
    role: string;
    purpose: string;
    prompt: string;
  }>;
  codeVisualRequirements: string[];
  rationale: string;
};

function fallbackPlan(
  experience: V12ExperiencePlannerResult
): V12AssetToolPlan {
  const immersive =
    experience.experience === "IMMERSIVE_3D" ||
    experience.experience === "CINEMATIC";

  return {
    needsGeneratedImages: true,
    needsVideo: experience.experience === "CINEMATIC",
    needs3DAssets: experience.experience === "IMMERSIVE_3D",
    needsShaderCode:
      experience.capabilities.includes("SHADER_WEBGL"),
    needsCustomSvg: true,
    needsDataViz:
      experience.capabilities.includes("DATA_VISUALIZATION"),
    needsIcons: true,
    imageRequirements: [
      {
        role: "hero visual",
        purpose: "Primary visual anchor",
        prompt: "Create a brand-specific premium hero visual",
        aspect: "landscape",
        medium: "editorial photography",
        useRequestedMedium: false,
      },
      {
        role: "supporting visual",
        purpose: "Support the page narrative",
        prompt: "Create a complementary supporting visual",
        aspect: "landscape",
        medium: "editorial photography",
        useRequestedMedium: false,
      },
    ],
    videoRequirements: immersive
      ? [
          {
            role: "cinematic accent",
            purpose: "Add motion-rich visual storytelling",
            prompt: "Create a short cinematic loop appropriate to the website",
          },
        ]
      : [],
    codeVisualRequirements: [],
    rationale: "Fallback media/tool plan derived from experience class.",
  };
}

function extractOutputText(payload: any): string {
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (
        (content?.type === "output_text" ||
          content?.type === "text") &&
        typeof content?.text === "string"
      ) {
        return content.text;
      }
    }
  }

  return "";
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "needsGeneratedImages",
    "needsVideo",
    "needs3DAssets",
    "needsShaderCode",
    "needsCustomSvg",
    "needsDataViz",
    "needsIcons",
    "imageRequirements",
    "videoRequirements",
    "codeVisualRequirements",
    "rationale",
  ],
  properties: {
    needsGeneratedImages: { type: "boolean" },
    needsVideo: { type: "boolean" },
    needs3DAssets: { type: "boolean" },
    needsShaderCode: { type: "boolean" },
    needsCustomSvg: { type: "boolean" },
    needsDataViz: { type: "boolean" },
    needsIcons: { type: "boolean" },

    imageRequirements: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "role",
          "purpose",
          "prompt",
          "aspect",
          "medium",
          "useRequestedMedium"
        ],
        properties: {
          role: { type: "string" },
          purpose: { type: "string" },
          prompt: { type: "string" },
          aspect: {
            type: "string",
            enum: ["landscape", "portrait", "square"]
          },
          medium: { type: "string" },
          useRequestedMedium: { type: "boolean" },
        },
      },
    },

    videoRequirements: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "purpose", "prompt"],
        properties: {
          role: { type: "string" },
          purpose: { type: "string" },
          prompt: { type: "string" },
        },
      },
    },

    codeVisualRequirements: {
      type: "array",
      items: { type: "string" },
    },

    rationale: { type: "string" },
  },
} as const;

export async function planV12AssetsAndTools(input: {
  apiKey: string;
  model: string;
  prompt: string;
  siteName: string;
  experiencePlan: V12ExperiencePlannerResult;
  creativeDirectorSpecification: string;
  researchContext?: string;
  signal?: AbortSignal;
}): Promise<V12AssetToolPlan> {
  const fallback = fallbackPlan(input.experiencePlan);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
        },
        signal: input.signal,
        body: JSON.stringify({
          model: input.model,
          reasoning: { effort: "low" },
          max_output_tokens: 2600,

          text: {
            format: {
              type: "json_schema",
              name: "buildez_asset_tool_plan",
              strict: true,
              schema,
            },
          },

          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: `
You are BuildEZ Asset & Tool Planner.

Your job is to decide which media and visual-production capabilities
are actually needed BEFORE website code generation.

Do not design the page.
Do not critique the page.
Do not call tools.

Plan only what should be produced or enabled.

AVAILABLE CAPABILITIES:

1. GENERATED IMAGES
Use for:
- hero artwork
- editorial imagery
- product concept visuals
- background artwork
- textures
- supporting illustrations

2. HIGGSFIELD VIDEO
Use only when cinematic motion materially improves the brief.

3. CODE-GENERATED VISUALS
Use for:
- CSS art
- SVG
- gradients
- masks
- shaders
- particle fields
- diagrams
- canvas/WebGL effects

4. 3D ASSETS
Mark needs3DAssets=true when actual 3D models are materially required.
A dedicated 3D asset provider may be added later.

5. DATA VISUALIZATION
Use only for real data-driven experiences.

6. ICONOGRAPHY
Prefer custom-feeling SVG/icon systems where useful.
Lucide is for utility/interface icons, not the site's entire visual identity.

IMPORTANT:
Do not overproduce assets.
Do not add video or 3D to ordinary business sites.
Do not return generic stock-photo prompts.
Every asset must have a defined role in the composition.

For every generated image specify:
- aspect: landscape, portrait, or square
- medium: photography, 3D render, illustration, editorial collage,
  abstract material, medical visualization, isometric art, etc.
- useRequestedMedium=true only when the user or Creative Director has
  explicitly requested that medium

Do not default every asset to photography.
Match the medium to the website's art direction.
                  `.trim(),
                },
              ],
            },

            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `
SITE:
${input.siteName}

REQUEST:
${input.prompt}

EXPERIENCE PLAN:
${JSON.stringify(input.experiencePlan, null, 2)}

CREATIVE DIRECTOR:
${input.creativeDirectorSpecification}

RESEARCH:
${input.researchContext || "None"}

Create a production-focused asset/tool plan.
                  `.trim(),
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) return fallback;

    const payload = await response.json();
    const text = extractOutputText(payload);

    if (!text) return fallback;

    return JSON.parse(text) as V12AssetToolPlan;
  } catch {
    return fallback;
  }
}

export function assetToolPlanPrompt(
  plan: V12AssetToolPlan
) {
  return `
BUILDEZ ASSET & TOOL PLAN

Generated images:
${plan.needsGeneratedImages}

Video:
${plan.needsVideo}

3D assets:
${plan.needs3DAssets}

Shader / WebGL code:
${plan.needsShaderCode}

Custom SVG:
${plan.needsCustomSvg}

Data visualization:
${plan.needsDataViz}

Icons:
${plan.needsIcons}

IMAGE REQUIREMENTS:
${
  plan.imageRequirements.length
    ? plan.imageRequirements
        .map(
          (item) =>
            `- ${item.role}: ${item.purpose}\n  Prompt: ${item.prompt}`
        )
        .join("\n")
    : "- None"
}

VIDEO REQUIREMENTS:
${
  plan.videoRequirements.length
    ? plan.videoRequirements
        .map(
          (item) =>
            `- ${item.role}: ${item.purpose}\n  Prompt: ${item.prompt}`
        )
        .join("\n")
    : "- None"
}

CODE VISUAL REQUIREMENTS:
${
  plan.codeVisualRequirements.length
    ? plan.codeVisualRequirements
        .map((item) => `- ${item}`)
        .join("\n")
    : "- None"
}

RATIONALE:
${plan.rationale}

RULE:
The implementation should actually use the planned assets and visual
capabilities where applicable.
  `.trim();
}
