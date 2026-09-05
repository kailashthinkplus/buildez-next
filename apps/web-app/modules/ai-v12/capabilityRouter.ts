export type V12Capability =
  | "STANDARD"
  | "MOTION_RICH"
  | "PARALLAX"
  | "IMMERSIVE_3D"
  | "SHADER_WEBGL"
  | "DATA_VISUALIZATION";

export type V12CapabilityPlan = {
  primary: V12Capability;
  capabilities: V12Capability[];
  recommendedLibraries: string[];
  requires3D: boolean;
  requiresWebGL: boolean;
  requiresAdvancedMotion: boolean;
  requiresDataViz: boolean;
};

export function requiresImmersiveToolchain(
  plan: V12CapabilityPlan,
  creativeDirection?: Readonly<{ experienceType?: string }>,
) {
  return creativeDirection?.experienceType === "Immersive 3D / cinematic" ||
    plan.requires3D ||
    plan.capabilities.includes("PARALLAX") ||
    plan.capabilities.includes("SHADER_WEBGL");
}

export function routeV12Capabilities(
  prompt: string,
  creativeDirection?: Readonly<{
    experienceType?: string;
    motionStyle?: string;
    imageStyle?: string;
  }>,
): V12CapabilityPlan {
  const text = prompt.toLowerCase();
  const forbidsWebGL = /\b(?:no|without|avoid|do not use|don't use)\s+(?:webgl|three\.js|threejs|real[- ]time 3d|browser[- ]rendered 3d)\b/i.test(prompt);

  const capabilities = new Set<V12Capability>();

  const immersiveExperience =
    creativeDirection?.experienceType ===
    "Immersive 3D / cinematic";

  if (immersiveExperience) {
    capabilities.add("PARALLAX");
    capabilities.add("MOTION_RICH");
  }

  if (creativeDirection?.motionStyle === "Immersive parallax") {
    capabilities.add("PARALLAX");
    capabilities.add("MOTION_RICH");
  }

  if (creativeDirection?.imageStyle === "3D") {
    capabilities.add("IMMERSIVE_3D");
  }

  const has = (...terms: string[]) =>
    terms.some((term) => text.includes(term));

  if (
    has(
      "3d",
      "three.js",
      "threejs",
      "react three fiber",
      "r3f",
      "interactive product",
      "exploded view",
      "3d product",
      "3d scene",
      "gltf",
      "glb",
      "three-dimensional",
      "3-d"
    )
  ) {
    capabilities.add("IMMERSIVE_3D");
  }

  if (
    !forbidsWebGL && has(
      "shader",
      "webgl",
      "glsl",
      "fluid",
      "particle field",
      "generative background"
    )
  ) {
    capabilities.add("SHADER_WEBGL");
  }

  if (
    has(
      "parallax",
      "scroll story",
      "scroll storytelling",
      "scroll driven",
      "scroll-driven",
      "cinematic scroll",
      "immersive scroll"
    )
  ) {
    capabilities.add("PARALLAX");
  }

  if (
    has(
      "animation",
      "animated",
      "motion",
      "micro interaction",
      "micro-interaction",
      "gsap",
      "transition",
      "cinematic"
    )
  ) {
    capabilities.add("MOTION_RICH");
  }

  if (
    has(
      "network graph",
      "node graph",
      "data visualization",
      "data visualisation",
      "force graph",
      "chart",
      "interactive data",
      "map visualization"
    )
  ) {
    capabilities.add("DATA_VISUALIZATION");
  }

  if (!capabilities.size) {
    capabilities.add("STANDARD");
  }

  const requires3D =
    capabilities.has("IMMERSIVE_3D");

  // A cinematic website does not inherently need live WebGL, and a normal
  // R3F scene does not inherently need a custom shader. Keep this flag scoped
  // to an explicit shader/WebGL request so media-led scroll experiences do not
  // get pushed into unnecessary real-time rendering work.
  const requiresWebGL =
    capabilities.has("SHADER_WEBGL");

  const requiresAdvancedMotion =
    capabilities.has("MOTION_RICH") ||
    capabilities.has("PARALLAX") ||
    requires3D;

  const requiresDataViz =
    capabilities.has("DATA_VISUALIZATION");

  const recommendedLibraries = new Set<string>();

  if (requiresAdvancedMotion) {
    recommendedLibraries.add("motion");
    recommendedLibraries.add("gsap");
  }


  if (requiresWebGL) {
    recommendedLibraries.add("three");
  }

  if (requiresDataViz) {
    recommendedLibraries.add("d3");
  }

  const priority: V12Capability[] = [
    "IMMERSIVE_3D",
    "SHADER_WEBGL",
    "DATA_VISUALIZATION",
    "PARALLAX",
    "MOTION_RICH",
    "STANDARD",
  ];

  const primary =
    priority.find((item) => capabilities.has(item)) ||
    "STANDARD";

  return {
    primary,
    capabilities: [...capabilities],
    recommendedLibraries: [...recommendedLibraries],
    requires3D,
    requiresWebGL,
    requiresAdvancedMotion,
    requiresDataViz,
  };
}

export function capabilityPlanPrompt(
  plan: V12CapabilityPlan
) {
  return `
BUILDEZ CAPABILITY PLAN

Primary experience:
${plan.primary}

Required capabilities:
${plan.capabilities.join(", ")}

Recommended implementation libraries:
${
  plan.recommendedLibraries.length
    ? plan.recommendedLibraries.join(", ")
    : "React / CSS / platform-native capabilities"
}

Requires Higgsfield video frame sequence for the 3D subject:
${plan.requires3D}

Requires WebGL/shaders:
${plan.requiresWebGL}

Requires advanced motion:
${plan.requiresAdvancedMotion}

Requires data visualization:
${plan.requiresDataViz}

RULES:

- Every 3D subject uses Higgsfield video -> extracted frames -> scroll-scrubbed 2D canvas, even for explicit model or live-3D requests. Do not use external model providers.
- WebGL remains available for basic supporting animation/effects; it must not replace the subject frame sequence.
- Do not downgrade an explicitly immersive request into a generic
  corporate layout.
- Do not add heavy 3D/WebGL merely because the tools exist.
- Use advanced libraries only when required by the user's requested
  experience.
- Preserve accessibility and reduced-motion support.
- Performance optimization must preserve the intended design.
  `.trim();
}
