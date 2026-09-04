export const DESIGN_STYLE_OPTIONS = [
  "AI decides",
  "Minimal",
  "Editorial",
  "Bold",
  "Premium",
  "Immersive frames",
  "Playful",
  "Technical",
] as const;

export const EXPERIENCE_TYPE_OPTIONS = [
  "Traditional modern",
  "Immersive 3D / cinematic",
  "AI decides",
] as const;

export const MOTION_STYLE_OPTIONS = [
  "Modern motion",
  "Immersive parallax",
  "Subtle reveals",
  "Mostly static",
] as const;

export const IMAGE_STYLE_OPTIONS = [
  "Photorealistic",
  "Editorial illustration",
  "3D",
  "Abstract",
  "Collage",
  "No generated imagery",
] as const;

export const COLOR_MOOD_OPTIONS = [
  "AI decides",
  "Light",
  "Dark",
  "Neutral",
  "Vibrant",
] as const;

export const DENSITY_OPTIONS = ["Balanced", "Airy", "Information-rich"] as const;

export const PRIMARY_GOAL_OPTIONS = [
  "AI decides",
  "Generate leads",
  "Build trust",
  "Showcase work",
  "Explain an offering",
  "Sell online",
] as const;

export type CreativeDirection = Readonly<{
  experienceType: typeof EXPERIENCE_TYPE_OPTIONS[number];
  designStyle: typeof DESIGN_STYLE_OPTIONS[number];
  imageStyle: typeof IMAGE_STYLE_OPTIONS[number];
  colorMood: typeof COLOR_MOOD_OPTIONS[number];
  density: typeof DENSITY_OPTIONS[number];
  primaryGoal: typeof PRIMARY_GOAL_OPTIONS[number];
  motionStyle: typeof MOTION_STYLE_OPTIONS[number];
  audience: string;
}>;

export const DEFAULT_CREATIVE_DIRECTION: CreativeDirection = Object.freeze({
  experienceType: "Traditional modern",
  designStyle: "AI decides",
  imageStyle: "Photorealistic",
  colorMood: "AI decides",
  density: "Balanced",
  primaryGoal: "AI decides",
  motionStyle: "Modern motion",
  audience: "",
});

function option<T extends readonly string[]>(value: unknown, values: T, fallback: T[number]): T[number] {
  return typeof value === "string" && values.includes(value as T[number])
    ? value as T[number]
    : fallback;
}

export function parseCreativeDirection(value: unknown): CreativeDirection {
  let candidate: Record<string, unknown> = {};
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      candidate = parsed as Record<string, unknown>;
    }
  } catch {
    candidate = {};
  }
  return {
    experienceType: option(candidate.experienceType, EXPERIENCE_TYPE_OPTIONS, DEFAULT_CREATIVE_DIRECTION.experienceType),
    designStyle: option(candidate.designStyle, DESIGN_STYLE_OPTIONS, DEFAULT_CREATIVE_DIRECTION.designStyle),
    imageStyle: option(candidate.imageStyle, IMAGE_STYLE_OPTIONS, DEFAULT_CREATIVE_DIRECTION.imageStyle),
    colorMood: option(candidate.colorMood, COLOR_MOOD_OPTIONS, DEFAULT_CREATIVE_DIRECTION.colorMood),
    density: option(candidate.density, DENSITY_OPTIONS, DEFAULT_CREATIVE_DIRECTION.density),
    primaryGoal: option(candidate.primaryGoal, PRIMARY_GOAL_OPTIONS, DEFAULT_CREATIVE_DIRECTION.primaryGoal),
    motionStyle: option(candidate.motionStyle, MOTION_STYLE_OPTIONS, DEFAULT_CREATIVE_DIRECTION.motionStyle),
    audience: typeof candidate.audience === "string" ? candidate.audience.trim().slice(0, 160) : "",
  };
}
