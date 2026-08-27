import type {
  V12Capability,
  V12CapabilityPlan,
} from "./capabilityRouter";

export type V12DesignArchitectResult = {
  expandedBrief: string;

  experience:
    | "TRADITIONAL"
    | "EDITORIAL"
    | "MOTION_RICH"
    | "CINEMATIC"
    | "IMMERSIVE_3D"
    | "DATA_DRIVEN";

  capabilities: V12Capability[];

  libraries: string[];

  designDirection: {
    concept: string;
    composition: string;
    typography: string;
    colorStrategy: string;
    spatialSystem: string;
    visualLanguage: string;
  };

  sections: Array<{
    role: string;
    purpose: string;
    composition: string;
  }>;

  mediaPlan: {
    needsGeneratedImages: boolean;
    needsVideo: boolean;
    needs3DAssets: boolean;
    needsShaderCode: boolean;
    needsCustomSvg: boolean;
    needsDataViz: boolean;
    needsIcons: boolean;

    images: Array<{
      role: string;
      purpose: string;
      prompt: string;
      aspect: "landscape" | "portrait" | "square";
      medium: string;
      useRequestedMedium: boolean;
    }>;

    videos: Array<{
      role: string;
      purpose: string;
      prompt: string;
    }>;

    codeVisualRequirements: string[];
  };

  motionPlan: string[];
  performanceRequirements: string[];
  rationale: string;
};

const APPROVED_LIBRARIES = [
  "motion",
  "gsap",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
  "d3",
  "lottie-react",
  "lucide-react",
] as const;

const schema = {
  type: "object",
  additionalProperties: false,

  required: [
    "expandedBrief",
    "experience",
    "capabilities",
    "libraries",
    "designDirection",
    "sections",
    "mediaPlan",
    "motionPlan",
    "performanceRequirements",
    "rationale",
  ],

  properties: {
    expandedBrief: {
      type: "string",
    },

    experience: {
      type: "string",
      enum: [
        "TRADITIONAL",
        "EDITORIAL",
        "MOTION_RICH",
        "CINEMATIC",
        "IMMERSIVE_3D",
        "DATA_DRIVEN",
      ],
    },

    capabilities: {
      type: "array",
      items: {
        type: "string",
        enum: [
          "STANDARD",
          "MOTION_RICH",
          "PARALLAX",
          "IMMERSIVE_3D",
          "SHADER_WEBGL",
          "DATA_VISUALIZATION",
        ],
      },
    },

    libraries: {
      type: "array",
      items: {
        type: "string",
        enum: APPROVED_LIBRARIES,
      },
    },

    designDirection: {
      type: "object",
      additionalProperties: false,

      required: [
        "concept",
        "composition",
        "typography",
        "colorStrategy",
        "spatialSystem",
        "visualLanguage",
      ],

      properties: {
        concept: { type: "string" },
        composition: { type: "string" },
        typography: { type: "string" },
        colorStrategy: { type: "string" },
        spatialSystem: { type: "string" },
        visualLanguage: { type: "string" },
      },
    },

    sections: {
      type: "array",
      maxItems: 12,

      items: {
        type: "object",
        additionalProperties: false,

        required: [
          "role",
          "purpose",
          "composition",
        ],

        properties: {
          role: { type: "string" },
          purpose: { type: "string" },
          composition: { type: "string" },
        },
      },
    },

    mediaPlan: {
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
        "images",
        "videos",
        "codeVisualRequirements",
      ],

      properties: {
        needsGeneratedImages: { type: "boolean" },
        needsVideo: { type: "boolean" },
        needs3DAssets: { type: "boolean" },
        needsShaderCode: { type: "boolean" },
        needsCustomSvg: { type: "boolean" },
        needsDataViz: { type: "boolean" },
        needsIcons: { type: "boolean" },

        images: {
          type: "array",
          maxItems: 4,

          items: {
            type: "object",
            additionalProperties: false,

            required: [
              "role",
              "purpose",
              "prompt",
              "aspect",
              "medium",
              "useRequestedMedium",
            ],

            properties: {
              role: { type: "string" },
              purpose: { type: "string" },
              prompt: { type: "string" },

              aspect: {
                type: "string",
                enum: [
                  "landscape",
                  "portrait",
                  "square",
                ],
              },

              medium: {
                type: "string",
              },

              useRequestedMedium: {
                type: "boolean",
              },
            },
          },
        },

        videos: {
          type: "array",
          maxItems: 2,

          items: {
            type: "object",
            additionalProperties: false,

            required: [
              "role",
              "purpose",
              "prompt",
            ],

            properties: {
              role: { type: "string" },
              purpose: { type: "string" },
              prompt: { type: "string" },
            },
          },
        },

        codeVisualRequirements: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },

    motionPlan: {
      type: "array",
      items: {
        type: "string",
      },
    },

    performanceRequirements: {
      type: "array",
      items: {
        type: "string",
      },
    },

    rationale: {
      type: "string",
    },
  },
} as const;

function outputText(payload: any): string {
  if (typeof payload?.output_text === "string") {
    return payload.output_text;
  }

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (
        (
          content?.type === "output_text" ||
          content?.type === "text"
        ) &&
        typeof content?.text === "string"
      ) {
        return content.text;
      }
    }
  }

  return "";
}

function fallbackPlan(
  prompt: string,
  deterministic: V12CapabilityPlan,
): V12DesignArchitectResult {
  let experience: V12DesignArchitectResult["experience"] =
    "TRADITIONAL";

  if (deterministic.requires3D) {
    experience = "IMMERSIVE_3D";
  } else if (deterministic.requiresDataViz) {
    experience = "DATA_DRIVEN";
  } else if (
    deterministic.capabilities.includes("PARALLAX") ||
    deterministic.capabilities.includes("SHADER_WEBGL")
  ) {
    experience = "CINEMATIC";
  } else if (deterministic.requiresAdvancedMotion) {
    experience = "MOTION_RICH";
  }

  return {
    expandedBrief: prompt,

    experience,

    capabilities: deterministic.capabilities,

    libraries: deterministic.recommendedLibraries,

    designDirection: {
      concept:
        "Create a polished original design derived directly from the user request.",

      composition:
        "Use intentional responsive composition rather than a generic landing-page template.",

      typography:
        "Establish a clear typographic hierarchy appropriate to the brand.",

      colorStrategy:
        "Derive a coherent palette from the requested creative direction.",

      spatialSystem:
        "Use consistent spacing with deliberate rhythm and hierarchy.",

      visualLanguage:
        "Use restrained, brand-specific visual treatments rather than generic UI decoration.",
    },

    sections: [],

    mediaPlan: {
      needsGeneratedImages: false,
      needsVideo: false,
      needs3DAssets: deterministic.requires3D,
      needsShaderCode:
        deterministic.capabilities.includes("SHADER_WEBGL"),
      needsCustomSvg: false,
      needsDataViz: deterministic.requiresDataViz,
      needsIcons: true,
      images: [],
      videos: [],
      codeVisualRequirements: [],
    },

    motionPlan: [],

    performanceRequirements: [
      "responsive layout",
      "accessible interaction",
      "prefers-reduced-motion support",
      "avoid unnecessary heavy dependencies",
    ],

    rationale:
      "Deterministic fallback used because the Design Architect was unavailable.",
  };
}

export async function createV12DesignArchitectPlan(input: {
  apiKey: string;
  model: string;
  prompt: string;
  context: string;
  siteName: string;
  deterministicPlan: V12CapabilityPlan;
  creativeDirection: unknown;
  researchContext?: string;
  designVariationSeed?: string;
  signal: AbortSignal;
}): Promise<V12DesignArchitectResult> {
  const fallback = fallbackPlan(
    input.prompt,
    input.deterministicPlan,
  );

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
        },

        signal: AbortSignal.any([
          input.signal,
          AbortSignal.timeout(
            Number(
              process.env
                .OPENAI_V12_DESIGN_ARCHITECT_TIMEOUT_MS ||
                45_000
            ),
          ),
        ]),

        body: JSON.stringify({
          model:
            process.env.OPENAI_V12_DESIGN_ARCHITECT_MODEL ||
            input.model,

          reasoning: {
            effort: "low",
          },

          max_output_tokens: 5000,

          text: {
            format: {
              type: "json_schema",
              name: "buildez_design_architect",
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
You are the BuildEZ Design Architect.

You perform the planning work that would otherwise require separate
Prompt Architect, Experience Architect, Creative Director and
Asset/Tool Planner calls.

Your output is an implementation blueprint for a downstream frontend
generation model.

Do NOT generate React code.
Do NOT critique an existing website.
Do NOT imitate generic website templates.
Do NOT invent company facts.

Interpret the user's intent semantically.

Your responsibilities:

1. Turn underspecified requests into a concise professional brief.

2. Decide the appropriate experience level:
TRADITIONAL
EDITORIAL
MOTION_RICH
CINEMATIC
IMMERSIVE_3D
DATA_DRIVEN

3. Establish an original visual concept.

4. Plan page composition and section hierarchy around visitor decisions,
not around a fixed SaaS/landing-page formula.

5. Decide what media actually strengthens the experience.

6. Decide what implementation capabilities and libraries are justified.

7. Keep the result practical for responsive frontend implementation.

VISUAL QUALITY

Avoid automatically producing:
- centered gradient hero
- floating dashboard card
- three equal feature cards
- excessive pills
- generic glassmorphism
- repetitive rounded rectangles
- identical section geometry
- arbitrary gradients

Use these only when the concept genuinely requires them.

DESIGN DIVERSITY

Every fresh website receives a DESIGN VARIATION ID.

Treat this ID as creative entropy that helps equally valid design
solutions diverge from one another.

Use it to explore different high-quality possibilities for:
- hero geometry and focal placement
- content composition
- section sequencing
- grid behavior
- typography scale and treatment
- image placement
- background treatment
- visual motifs
- spatial rhythm
- CTA composition
- interaction and motion character

The DESIGN VARIATION ID is NOT a template selector.

Do not map IDs to a fixed catalogue of layouts.

Do not introduce arbitrary novelty merely to appear different.

The user's brief, brand, content, usability, hierarchy,
responsiveness and visual quality always take priority.

Two unrelated websites with similar prompts should not automatically
converge on the same hero structure, section sequence, visual motif,
image composition and CTA arrangement.

Edits and additional pages within the SAME website should remain
coherent with that website's established design language.

Think in terms of:
- typography
- hierarchy
- negative space
- scale
- editorial rhythm
- asymmetry
- layering
- depth
- imagery
- background imagery
- texture
- visual anchors
- interaction
- motion
- responsive composition

MEDIA

Generated imagery should be used only where it materially improves
the design.

Prefer approximately 2-4 strong images over many decorative assets.

A strong website may use:
- one substantial hero visual
- one or two supporting editorial visuals
- an intentional background visual

Every image must have a defined compositional role.

Do not generate generic stock-photo prompts.

If an image is intended as a hero or background visual, say so
explicitly in its role and prompt.

Do not default every medium to photography.

Respect an explicitly requested medium.

MEDIA MODE CONTRACT

USER CREATIVE DIRECTION.imageStyle is authoritative.

If imageStyle is "Photorealistic":
- mediaPlan.needsGeneratedImages MUST be true.
- mediaPlan.images MUST contain at least 1 image requirement.
- Every planned image must use a photorealistic / premium editorial photography medium.
- At least one image must have a substantial compositional role such as:
  hero visual, large editorial split, section background, cinematic scene,
  environmental brand image, or dominant supporting visual.
- Do NOT satisfy this mode using only CSS, SVG, diagrams, icons or abstract code art.
- Do NOT create generic corporate stock-photo prompts.
- The subject and art direction must be concept-specific to the user's brief.

If imageStyle is "Editorial illustration":
- mediaPlan.needsGeneratedImages MUST be true.
- mediaPlan.images MUST contain at least 1 illustration requirement.
- The illustration must have a meaningful compositional role.

If imageStyle is "3D":
- mediaPlan.needsGeneratedImages or mediaPlan.needs3DAssets MUST be true.
- Plan a genuine 3D or rendered visual appropriate to the brief.
- Do not replace the requested 3D direction with flat decorative CSS.

If imageStyle is "Abstract":
- mediaPlan.needsGeneratedImages MUST be true.
- mediaPlan.images MUST contain at least 1 concept-specific abstract visual requirement.

If imageStyle is "Collage":
- mediaPlan.needsGeneratedImages MUST be true.
- mediaPlan.images MUST contain at least 1 concept-specific collage requirement.

If imageStyle is "No generated imagery":
- mediaPlan.needsGeneratedImages MUST be false.
- mediaPlan.images MUST be [].
- Rely on supplied assets and purposeful code-native visual composition.

If the product later provides an "AI decides" media mode:
- Decide freely whether generated imagery materially strengthens the design.

Explicit user media choices override your general preference to avoid unnecessary media.

TECHNOLOGY

Approved libraries only:

motion
gsap
three
@react-three/fiber
@react-three/drei
d3
lottie-react
lucide-react

Do not add technology merely because it exists.

Ordinary corporate websites generally do not need Three.js.

Use GSAP only when sophisticated choreography materially improves the
experience.

Use Motion for normal UI animation.

Use Three.js / React Three Fiber only for genuine interactive 3D.

Use D3 only for genuine data visualization.

CSS, SVG and browser APIs require no dependency.

The deterministic capability plan is a guardrail, not a command to
make the experience visually boring.

FACTUAL SAFETY

Never invent:
- testimonials
- awards
- client names
- statistics
- office locations
- project outcomes
- certifications
- partnerships

Non-factual positioning language is allowed.
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

CONTEXT:
${input.context}

USER REQUEST:
${input.prompt}

USER CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection, null, 2)}

DESIGN VARIATION ID:
${input.designVariationSeed || "default"}

Use this ID only as a diversification signal. Preserve the strongest
design solution for the actual brief and creative direction.

DETERMINISTIC CAPABILITY PLAN:
${JSON.stringify(input.deterministicPlan, null, 2)}

RESEARCH:
${input.researchContext || "None"}

Create one coherent implementation-ready design architecture.
                  `.trim(),
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json();
    const text = outputText(payload);

    if (!text) {
      return fallback;
    }

    const plan =
      JSON.parse(text) as V12DesignArchitectResult;

    const creativeDirection =
      input.creativeDirection &&
      typeof input.creativeDirection === "object" &&
      !Array.isArray(input.creativeDirection)
        ? input.creativeDirection as Record<string, unknown>
        : {};

    const imageStyle =
      typeof creativeDirection.imageStyle === "string"
        ? creativeDirection.imageStyle
        : "";

    const requiresGeneratedImages =
      imageStyle === "Photorealistic" ||
      imageStyle === "Editorial illustration" ||
      imageStyle === "Abstract" ||
      imageStyle === "Collage";

    if (
      requiresGeneratedImages &&
      (
        !plan.mediaPlan.needsGeneratedImages ||
        plan.mediaPlan.images.length === 0
      )
    ) {
      /*
       * Explicit user media selections are a product contract.
       *
       * Do NOT spend another planning call repairing a missing image.
       * Instead derive one requirement from the Design Architect's own
       * concept and expanded brief.
       *
       * This keeps the media subject concept-specific rather than
       * inserting generic stock-photography prompts.
       */

      const requestedMedium =
        imageStyle === "Photorealistic"
          ? "photorealistic premium editorial photography"
          : imageStyle === "Editorial illustration"
            ? "premium editorial illustration"
            : imageStyle === "Abstract"
              ? "concept-specific abstract artwork"
              : imageStyle === "Collage"
                ? "premium editorial collage"
                : imageStyle;

      const fallbackImagePrompt = [
        `Create a substantial website visual for this specific brief: ${plan.expandedBrief}.`,
        `Creative concept: ${plan.designDirection.concept}.`,
        `Composition direction: ${plan.designDirection.composition}.`,
        `Visual language: ${plan.designDirection.visualLanguage}.`,
        `The image must feel specifically designed for this brand and concept rather than like generic stock media.`,
        `Leave useful negative space where the website composition may place typography.`,
        `No embedded words, UI labels, logos, watermarks or fake typography.`,
      ].join(" ");

      plan.mediaPlan.needsGeneratedImages = true;

      plan.mediaPlan.images = [
        {
          role: "primary brand visual",
          purpose:
            "Provide a substantial visual anchor for the hero or another major above-the-fold composition.",
          prompt: fallbackImagePrompt,
          aspect: "landscape",
          medium: requestedMedium,
          useRequestedMedium: true,
        },
      ];

      console.warn(
        "[Design Architect] Repaired explicit media requirement deterministically",
        {
          imageStyle,
          plannedImages:
            plan.mediaPlan.images.length,
          role:
            plan.mediaPlan.images[0]?.role,
        },
      );
    }

    if (
      imageStyle === "No generated imagery" &&
      (
        plan.mediaPlan.needsGeneratedImages ||
        plan.mediaPlan.images.length > 0
      )
    ) {
      plan.mediaPlan.needsGeneratedImages = false;
      plan.mediaPlan.images = [];

      console.log(
        "[Design Architect] Enforced no-generated-imagery mode",
      );
    }

    return plan;
  } catch {
    return fallback;
  }
}

export function designArchitectPrompt(
  plan: V12DesignArchitectResult,
) {
  return `
BUILDEZ DESIGN ARCHITECTURE

${JSON.stringify(plan, null, 2)}
  `.trim();
}
