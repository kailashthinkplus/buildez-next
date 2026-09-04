import type {
  V12Capability,
  V12CapabilityPlan,
} from "./capabilityRouter";

export type V12ExperiencePlannerResult = {
  experience:
    | "TRADITIONAL"
    | "EDITORIAL"
    | "MOTION_RICH"
    | "CINEMATIC"
    | "IMMERSIVE_3D"
    | "DATA_DRIVEN";

  capabilities: V12Capability[];

  libraries: string[];

  visualTechniques: string[];

  motionTechniques: string[];

  mediaNeeds: string[];

  componentNeeds: string[];

  performanceRequirements: string[];

  rationale: string;
};

const EXPERIENCE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "experience",
    "capabilities",
    "libraries",
    "visualTechniques",
    "motionTechniques",
    "mediaNeeds",
    "componentNeeds",
    "performanceRequirements",
    "rationale",
  ],
  properties: {
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
        enum: [
          "motion",
          "gsap",
          "three",
          "@react-three/fiber",
          "@react-three/drei",
          "d3",
          "lottie-react",
          "lucide-react"
        ],
      },
    },

    visualTechniques: {
      type: "array",
      items: { type: "string" },
    },

    motionTechniques: {
      type: "array",
      items: { type: "string" },
    },

    mediaNeeds: {
      type: "array",
      items: { type: "string" },
    },

    componentNeeds: {
      type: "array",
      items: { type: "string" },
    },

    performanceRequirements: {
      type: "array",
      items: { type: "string" },
    },

    rationale: {
      type: "string",
    },
  },
} as const;

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

/** OpenAI's Responses API sets this when generation stopped early — most commonly for hitting max_output_tokens. */
function isIncompleteResponse(payload: any): boolean {
  return (
    payload?.status === "incomplete" ||
    payload?.incomplete_details?.reason === "max_output_tokens"
  );
}

function fallbackPlan(
  deterministic: V12CapabilityPlan,
): V12ExperiencePlannerResult {
  let experience: V12ExperiencePlannerResult["experience"] =
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
    experience,
    capabilities: deterministic.capabilities,
    libraries: deterministic.recommendedLibraries,
    visualTechniques: [],
    motionTechniques: [],
    mediaNeeds: [],
    componentNeeds: [],
    performanceRequirements: [
      "responsive layout",
      "accessible interaction",
      "prefers-reduced-motion support",
    ],
    rationale: "Deterministic capability-router fallback.",
  };
}

export async function planV12Experience(input: {
  apiKey: string;
  model: string;
  prompt: string;
  siteName: string;
  deterministicPlan: V12CapabilityPlan;
  creativeDirection?: unknown;
  researchContext?: string;
  signal?: AbortSignal;
}): Promise<V12ExperiencePlannerResult> {
  const fallback = fallbackPlan(input.deterministicPlan);

  if (!input.prompt.trim()) return fallback;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 45_000);

  const abort = () => controller.abort();

  input.signal?.addEventListener("abort", abort, {
    once: true,
  });

  const requestExperiencePlan = (maxOutputTokens: number) =>
    fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
        },

        signal: controller.signal,

        body: JSON.stringify({
          model: input.model,

          reasoning: {
            effort: "low",
          },

          max_output_tokens: maxOutputTokens,

          text: {
            format: {
              type: "json_schema",
              name: "buildez_experience_plan",
              strict: true,
              schema: EXPERIENCE_SCHEMA,
            },
          },

          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text: `
You are the BuildEZ Experience Architect.

Your job is NOT to design the website and NOT to critique another
model's design.

Determine what implementation capabilities a professional website
should use before the design/code generation stage.

Infer intent semantically. The user does not need to explicitly say
"Three.js", "GSAP", "shader", "parallax" or other technical terms.

Examples:

A conventional accountant, lawyer, clinic, local business or
corporate information website will usually remain TRADITIONAL unless
the brief clearly requests a richer experience.

A premium product launch, luxury automotive experience, fashion
campaign, creative studio, gaming experience, entertainment launch
or futuristic technology product may justify cinematic motion,
parallax, generated media, shaders or 3D.

A dashboard, scientific interface or analytics product may justify
data visualization.

Do NOT add technology merely because it exists.

Do NOT turn every website into a 3D website.

Do NOT recommend heavy libraries when CSS or lightweight React
animation is sufficient.

APPROVED IMPLEMENTATION LIBRARIES ONLY:

motion
- normal UI motion
- reveals
- hover interactions
- lightweight layout animation

gsap
- advanced scroll choreography
- timelines
- cinematic sequencing
- sophisticated parallax

three
@react-three/fiber
@react-three/drei
- genuine interactive 3D and WebGL experiences

d3
- genuine data visualization

lottie-react
- supplied or generated Lottie animation assets

lucide-react
- utility/interface icons only

Never invent package names.
Never recommend an unapproved dependency.
CSS, SVG and browser APIs require no dependency and should be preferred
when they solve the experience cleanly.

If 3D is materially important, prefer:
three
@react-three/fiber
@react-three/drei

For sophisticated scroll choreography, GSAP may be appropriate.

For normal interface motion, Motion/Framer Motion is sufficient.

Consider:
- page composition
- depth
- editorial imagery
- generated imagery
- iconography
- backgrounds
- gradients
- glass
- texture
- shaders
- scroll choreography
- transitions
- micro-interactions
- interactive 3D
- data visualization
- performance
- accessibility

The result becomes instructions for another website-generation model.
Keep recommendations purposeful.
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

USER / ARCHITECTED REQUEST:
${input.prompt}

USER CREATIVE DIRECTION:
${JSON.stringify(input.creativeDirection || {}, null, 2)}

DETERMINISTIC CAPABILITY SIGNAL:
${JSON.stringify(input.deterministicPlan, null, 2)}

AVAILABLE RESEARCH CONTEXT:
${input.researchContext || "None"}
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
    // before falling back to the deterministic plan.
    let maxOutputTokens = 2200;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await requestExperiencePlan(maxOutputTokens);
      if (!response.ok) return fallback;

      const payload = await response.json();
      const text = extractOutputText(payload);
      if (!text) return fallback;

      if (isIncompleteResponse(payload)) {
        if (attempt === 2) {
          console.warn("[Experience Planner] response was cut off after retry; using deterministic fallback plan");
          return fallback;
        }
        console.warn("[Experience Planner] response was cut off before it finished, retrying with a larger output budget");
        maxOutputTokens = 4400;
        continue;
      }

      try {
        return JSON.parse(text) as V12ExperiencePlannerResult;
      } catch {
        if (attempt === 2) {
          console.warn("[Experience Planner] response was not valid JSON after retry; using deterministic fallback plan");
          return fallback;
        }
        console.warn("[Experience Planner] response was not valid JSON, retrying with a larger output budget");
        maxOutputTokens = 4400;
      }
    }

    return fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);

    input.signal?.removeEventListener(
      "abort",
      abort,
    );
  }
}

export function experiencePlanPrompt(
  plan: V12ExperiencePlannerResult,
): string {
  return `
BUILDEZ EXPERIENCE ARCHITECT PLAN

Experience class:
${plan.experience}

Capabilities:
${plan.capabilities.join(", ") || "STANDARD"}

Implementation libraries:
${plan.libraries.join(", ") || "React / CSS"}

Visual techniques:
${
  plan.visualTechniques.length
    ? plan.visualTechniques.map((item) => `- ${item}`).join("\n")
    : "- Use strong professional art direction appropriate to the brief."
}

Motion techniques:
${
  plan.motionTechniques.length
    ? plan.motionTechniques.map((item) => `- ${item}`).join("\n")
    : "- No advanced motion requirement."
}

Media requirements:
${
  plan.mediaNeeds.length
    ? plan.mediaNeeds.map((item) => `- ${item}`).join("\n")
    : "- Use media only where materially useful."
}

Component requirements:
${
  plan.componentNeeds.length
    ? plan.componentNeeds.map((item) => `- ${item}`).join("\n")
    : "- Use polished reusable components."
}

Performance requirements:
${plan.performanceRequirements
  .map((item) => `- ${item}`)
  .join("\n")}

Architect rationale:
${plan.rationale}

IMPORTANT:

This is an implementation plan, not optional inspiration.

Do not downgrade requested richness into generic cards, gradient
rectangles and static text.

At the same time, do not introduce expensive visual technology that
does not serve the requested experience.

Preserve responsive behavior, accessibility and reduced-motion
support.
  `.trim();
}
