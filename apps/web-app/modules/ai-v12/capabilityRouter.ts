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
      "3d scene"
    )
  ) {
    capabilities.add("IMMERSIVE_3D");
  }

  if (
    has(
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

  if (requires3D) {
    recommendedLibraries.add("three");
    recommendedLibraries.add("@react-three/fiber");
    recommendedLibraries.add("@react-three/drei");
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

Requires 3D:
${plan.requires3D}

Requires WebGL/shaders:
${plan.requiresWebGL}

Requires advanced motion:
${plan.requiresAdvancedMotion}

Requires data visualization:
${plan.requiresDataViz}

RULES:

- Do not downgrade an explicitly immersive request into a generic
  corporate layout.
- Do not add heavy 3D/WebGL merely because the tools exist.
- Use advanced libraries only when required by the user's requested
  experience.
- Preserve accessibility and reduced-motion support.
- Performance optimization must preserve the intended design.
  `.trim();
}
