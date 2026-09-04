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

  subjectFidelity: {
    primarySubject: string;
    recognitionCues: string[];
    proportionAndTopology: string[];
    materialAndSurfaceCues: string[];
    forbiddenSubstitutions: string[];
    validationViews: string[];
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
  commerce: {
    mode: "NONE" | "OPTIONAL" | "REQUIRED";
    confidence: number;
    rationale: string;
    needsClarification: boolean;
    clarificationQuestion: string;
    clarificationOptions: string[];
  };
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
    "subjectFidelity",
    "sections",
    "mediaPlan",
    "motionPlan",
    "performanceRequirements",
    "commerce",
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

    subjectFidelity: {
      type: "object",
      additionalProperties: false,
      required: [
        "primarySubject",
        "recognitionCues",
        "proportionAndTopology",
        "materialAndSurfaceCues",
        "forbiddenSubstitutions",
        "validationViews",
      ],
      properties: {
        primarySubject: { type: "string" },
        recognitionCues: { type: "array", maxItems: 8, items: { type: "string" } },
        proportionAndTopology: { type: "array", maxItems: 8, items: { type: "string" } },
        materialAndSurfaceCues: { type: "array", maxItems: 8, items: { type: "string" } },
        forbiddenSubstitutions: { type: "array", maxItems: 8, items: { type: "string" } },
        validationViews: { type: "array", maxItems: 6, items: { type: "string" } },
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

    commerce: {
      type: "object",
      additionalProperties: false,
      required: [
        "mode",
        "confidence",
        "rationale",
        "needsClarification",
        "clarificationQuestion",
        "clarificationOptions",
      ],
      properties: {
        mode: {
          type: "string",
          enum: ["NONE", "OPTIONAL", "REQUIRED"],
        },
        confidence: {
          type: "number",
        },
        rationale: {
          type: "string",
        },
        needsClarification: {
          type: "boolean",
        },
        clarificationQuestion: {
          type: "string",
        },
        clarificationOptions: {
          type: "array",
          maxItems: 4,
          items: {
            type: "string",
          },
        },
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

/** OpenAI's Responses API sets this when generation stopped early — most commonly for hitting max_output_tokens. */
function isIncompleteResponse(payload: any): boolean {
  return (
    payload?.status === "incomplete" ||
    payload?.incomplete_details?.reason === "max_output_tokens"
  );
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

    subjectFidelity: {
      primarySubject: "Infer the primary visual subject directly from the user request.",
      recognitionCues: ["Preserve the subject's category-defining silhouette and landmark features."],
      proportionAndTopology: ["Keep relative scale, orientation and component relationships physically or visually coherent."],
      materialAndSurfaceCues: ["Use surfaces and materials that reinforce the requested subject rather than disguise it."],
      forbiddenSubstitutions: ["Do not replace the subject with a generic primitive, icon, blob or category-adjacent approximation."],
      validationViews: ["Default desktop hero view", "Default mobile hero view"],
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

    commerce: {
      mode: "NONE",
      confidence: 0,
      rationale:
        "No new commerce capability inferred because semantic planning was unavailable.",
      needsClarification: false,
      clarificationQuestion: "",
      clarificationOptions: [],
    },

    rationale:
      "Deterministic fallback used because the Design Architect was unavailable.",
  };
}

export function enforceImmersiveMediaPlan(
  plan: V12DesignArchitectResult,
  creativeDirection: unknown,
) {
  const direction = creativeDirection && typeof creativeDirection === "object" && !Array.isArray(creativeDirection)
    ? creativeDirection as Record<string, unknown>
    : {};
  const imageStyle = typeof direction.imageStyle === "string" ? direction.imageStyle : "Photorealistic";
  const explicitlyNoImages = imageStyle === "No generated imagery";
  const immersive = direction.experienceType === "Immersive 3D / cinematic"
    || plan.experience === "IMMERSIVE_3D"
    || plan.experience === "CINEMATIC";

  if (!immersive || explicitlyNoImages) return plan;

  const medium = imageStyle === "3D"
    ? "cinematic physically based 3D product render"
    : imageStyle === "Editorial illustration"
      ? "premium editorial illustration"
      : imageStyle === "Abstract"
        ? "concept-specific abstract material artwork"
        : imageStyle === "Collage"
          ? "premium editorial collage"
          : "photorealistic premium editorial photography";
  const requestedMedium = imageStyle !== "Photorealistic";
  const subjectFidelity = `Primary subject fidelity: ${JSON.stringify(plan.subjectFidelity)}. The result must preserve these recognition cues and forbidden substitutions.`;
  const candidates: V12DesignArchitectResult["mediaPlan"]["images"] = [
    {
      role: "cinematic hero keyframe",
      purpose: "Anchor the opening scene and provide a substantial visual layer behind the live 3D subject",
      prompt: `Create the opening cinematic keyframe for this website: ${plan.expandedBrief}. Concept: ${plan.designDirection.concept}. Composition: ${plan.designDirection.composition}. ${subjectFidelity} Preserve generous negative space for interface typography. No text, logo, or watermark.`,
      aspect: "landscape",
      medium,
      useRequestedMedium: requestedMedium,
    },
    {
      role: "environment depth plate",
      purpose: "Provide a wide atmospheric background layer for scroll-directed parallax depth",
      prompt: `Create a wide environmental depth plate for this immersive website concept: ${plan.designDirection.concept}. Match this visual language: ${plan.designDirection.visualLanguage}. ${subjectFidelity} Keep the scene spatially deep, edge-to-edge, and free of text, logos, or watermarks.`,
      aspect: "landscape",
      medium,
      useRequestedMedium: requestedMedium,
    },
    {
      role: "material detail reveal",
      purpose: "Support a close-up reveal section with a tactile foreground visual",
      prompt: `Create a tactile macro detail visual for this immersive website: ${plan.expandedBrief}. ${subjectFidelity} Emphasize physically plausible materials, controlled light, depth, and a strong crop suitable for a scroll reveal. No text, logo, or watermark.`,
      aspect: "landscape",
      medium,
      useRequestedMedium: requestedMedium,
    },
  ];

  plan.mediaPlan.needsGeneratedImages = true;
  plan.mediaPlan.needsVideo = true;
  const roles = new Set(plan.mediaPlan.images.map((item) => item.role.toLowerCase()));
  for (const candidate of candidates) {
    if (plan.mediaPlan.images.length >= 3) break;
    if (!roles.has(candidate.role.toLowerCase())) plan.mediaPlan.images.push(candidate);
  }
  if (!plan.mediaPlan.videos.length) {
    plan.mediaPlan.videos.push({
      role: "cinematic hero motion plate",
      purpose: "Provide a short, seamless visual sequence that can loop or use scroll as its playhead without requiring live 3D",
      prompt: `Animate the approved opening keyframe for this website into a restrained 5-8 second cinematic motion plate: ${plan.expandedBrief}. Preserve the primary subject, composition, lighting, negative space, and material fidelity. Use a slow camera move or physically plausible environmental motion. The first frame must work as a poster and the final frame must cut or loop cleanly. No text, logo, watermark, abrupt morphing, or subject substitution.`,
    });
  }
  return plan;
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
  const fallback = enforceImmersiveMediaPlan(fallbackPlan(
    input.prompt,
    input.deterministicPlan,
  ), input.creativeDirection);

  const requestDesignArchitectPlan = (maxOutputTokens: number) =>
    fetch(
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

          max_output_tokens: maxOutputTokens,

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

8. Create a subject-fidelity plan whenever the request has a primary visual subject. Extract category-defining silhouette cues, relative proportions, component topology, landmark features, material behavior, forbidden substitutions, and the desktop/mobile views that must prove recognizability. This applies universally rather than to any fixed product category. If the experience has no primary visual subject, state that explicitly and use empty cue arrays.
9. Determine whether transactional commerce is actually part of the intended website experience.

COMMERCE INTENT

Interpret commerce from the meaning of the complete request, not from isolated words,
page names, industries, product nouns, or lexical matches.

Set commerce.mode to:

NONE
- The requested website does not require transactional purchasing functionality.
- A brand may showcase products, collections, services, menus, work, or offerings
  without being an ecommerce website.
- A page or navigation label that could lead to products does not by itself require
  transactional commerce.

OPTIONAL
- Both a non-transactional experience and a transactional commerce experience are
  materially plausible from the request.
- Use OPTIONAL only when choosing between them would materially change the site's
  architecture or functionality.

REQUIRED
- The user's intended experience clearly requires transactional commerce functionality.

Judge the visitor journey and requested functionality as a whole.
Do not use business-category assumptions as evidence.
Do not infer commerce merely because products are visually present.
Do not infer commerce merely because something can theoretically be purchased.

commerce.needsClarification may be true only when mode is OPTIONAL and resolving the
ambiguity materially affects implementation.

When clarification is needed:
- clarificationQuestion must be a short user-facing question.
- clarificationOptions must contain 2-4 concise meaningful answers.
- One option should allow BuildEZ to make the decision for the user.

When clarification is not needed:
- clarificationQuestion must be an empty string.
- clarificationOptions must be [].

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

EXPERIENCE TYPE CONTRACT

USER CREATIVE DIRECTION.experienceType is authoritative:

- "Immersive 3D / cinematic" requires a genuine CINEMATIC or IMMERSIVE_3D
  experience with a coherent scroll narrative, layered depth, sophisticated
  parallax, and authored visual set-pieces. Default to cinematic stills,
  short motion plates, scroll-synced playback, pinned media stages and DOM
  layering. Require real-time Three.js/WebGL only when imageStyle is "3D",
  the free-text request explicitly asks for genuine interactive 3D/WebGL, or
  the experience depends on manipulating spatial geometry. Do not return a
  conventional landing page with a few fades, and do not turn ordinary
  cinematic direction into primitive live 3D.
- "Traditional modern" keeps the established polished responsive website
  path. Do not introduce heavy 3D/WebGL unless the free-text request
  explicitly asks for it.
- "AI decides" allows semantic inference from the brief.

An explicit free-text request for 3D, WebGL, shaders, cinematic scrolling,
or parallax overrides the traditional default.

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

  try {
    // The model's response can be cut off before it finishes (hitting
    // max_output_tokens) even with strict json_schema mode, leaving the
    // text syntactically invalid JSON. Retry once with a larger budget
    // before falling back to the deterministic plan, since the fallback
    // loses the model's actual design direction.
    let maxOutputTokens = 5000;
    let plan: V12DesignArchitectResult | undefined;

    for (let attempt = 1; attempt <= 2 && !plan; attempt++) {
      const response = await requestDesignArchitectPlan(maxOutputTokens);
      if (!response.ok) return fallback;

      const payload = await response.json();
      const text = outputText(payload);
      if (!text) return fallback;

      if (isIncompleteResponse(payload)) {
        if (attempt === 2) {
          console.warn("[Design Architect] response was cut off after retry; using deterministic fallback plan");
          return fallback;
        }
        console.warn("[Design Architect] response was cut off before it finished, retrying with a larger output budget");
        maxOutputTokens = 9000;
        continue;
      }

      try {
        plan = JSON.parse(text) as V12DesignArchitectResult;
      } catch {
        if (attempt === 2) {
          console.warn("[Design Architect] response was not valid JSON after retry; using deterministic fallback plan");
          return fallback;
        }
        console.warn("[Design Architect] response was not valid JSON, retrying with a larger output budget");
        maxOutputTokens = 9000;
      }
    }

    if (!plan) return fallback;

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

    const experienceType =
      typeof creativeDirection.experienceType === "string"
        ? creativeDirection.experienceType
        : "Traditional modern";

    if (experienceType === "Immersive 3D / cinematic") {
      const needsLive3D = input.deterministicPlan.requires3D;
      plan.experience = needsLive3D ? "IMMERSIVE_3D" : "CINEMATIC";
      plan.capabilities = [...new Set([
        ...plan.capabilities.filter((capability) =>
          needsLive3D || (capability !== "IMMERSIVE_3D" && capability !== "SHADER_WEBGL")
        ),
        ...(needsLive3D ? ["IMMERSIVE_3D" as const] : []),
        "PARALLAX" as const,
        "MOTION_RICH" as const,
        ...(input.deterministicPlan.requiresWebGL ? ["SHADER_WEBGL" as const] : []),
      ])];
      plan.libraries = [...new Set([
        ...plan.libraries.filter((library) =>
          needsLive3D || !["three", "@react-three/fiber", "@react-three/drei"].includes(library)
        ),
        "gsap",
        ...(needsLive3D
          ? ["three", "@react-three/fiber", "@react-three/drei"]
          : []),
      ])];
      plan.mediaPlan.needs3DAssets = needsLive3D;
      plan.mediaPlan.needsShaderCode = input.deterministicPlan.requiresWebGL;
      plan.mediaPlan.needsVideo = true;
      if (!plan.mediaPlan.videos.length) {
        plan.mediaPlan.videos = [{
          role: "cinematic depth sequence",
          purpose: "Support the immersive scroll narrative with art-directed motion media",
          prompt: `Create a seamless cinematic motion asset for this website concept: ${plan.designDirection.concept}. Match ${plan.designDirection.visualLanguage}. No text, logos, or watermark.`,
        }];
      }
      if (!plan.motionPlan.length) {
        plan.motionPlan = [
          "Media-led GSAP ScrollTrigger timeline with pinned narrative scenes",
          "Short motion plates may loop or use scroll as their playhead, with poster-backed failure states",
          "Layered foreground, subject and background parallax at bounded speeds",
          "Simplified mobile chapters and complete reduced-motion end states",
          "Section transitions that preserve one continuous visual story",
        ];
      }
    } else if (
      experienceType === "Traditional modern" &&
      input.deterministicPlan.primary === "STANDARD"
    ) {
      plan.experience = "TRADITIONAL";
      plan.capabilities = plan.capabilities.filter((capability) => capability === "STANDARD" || capability === "MOTION_RICH");
      if (!plan.capabilities.length) plan.capabilities = ["STANDARD"];
      plan.libraries = plan.libraries.filter((library) => library === "motion" || library === "lucide-react");
      plan.mediaPlan.needs3DAssets = false;
      plan.mediaPlan.needsShaderCode = false;
      plan.mediaPlan.needsVideo = false;
      plan.mediaPlan.videos = [];
    }

    const requiresGeneratedImages =
      imageStyle === "Photorealistic" ||
      imageStyle === "Editorial illustration" ||
      imageStyle === "3D" ||
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
        `Primary subject fidelity plan: ${JSON.stringify(plan.subjectFidelity)}.`,
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

    return enforceImmersiveMediaPlan(plan, input.creativeDirection);
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
