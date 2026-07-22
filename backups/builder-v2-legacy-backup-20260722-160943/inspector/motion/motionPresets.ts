export type MotionPresetCategory =
  | "base"
  | "reveal"
  | "scroll"
  | "premium"
  | "editorial";

export type MotionPreset = Readonly<{
  id: string;
  label: string;
  category: MotionPresetCategory;
  metadataOnly: false;
  runtimeExecution: true;
  defaultDuration: number;
  supportsReducedMotion: boolean;
}>;

export const MOTION_PRESETS: readonly MotionPreset[] = [
  preset("fade", "Fade", "base", 0.4),
  preset("slide", "Slide", "base", 0.5),
  preset("scale", "Scale", "base", 0.45),
  preset("rotate", "Rotate", "base", 0.55),
  preset("blur", "Blur", "base", 0.5),
  preset("reveal", "Reveal", "reveal", 0.65),
  preset("parallax", "Parallax", "scroll", 0.8),
  preset("pin", "Pin", "scroll", 0.8),
  preset("zoom", "Zoom", "base", 0.5),
  preset("luxury", "Luxury", "premium", 0.75),
  preset("editorial", "Editorial", "editorial", 0.7),
  preset("corporate", "Corporate", "base", 0.45),
  preset("minimal", "Minimal", "base", 0.3),
] as const;

export function getMotionPreset(id: string): MotionPreset | undefined {
  return MOTION_PRESETS.find((preset) => preset.id === id);
}

function preset(
  id: string,
  label: string,
  category: MotionPresetCategory,
  defaultDuration: number
): MotionPreset {
  return {
    id,
    label,
    category,
    metadataOnly: false,
    runtimeExecution: true,
    defaultDuration,
    supportsReducedMotion: true,
  };
}
