import type { CompositionInput, VisualBreathing } from "./compositionPlan";

export function inferVisualBreathing(input: CompositionInput): VisualBreathing {
  const density = input.designResult?.densityProfile.level;
  if (density === "airy") return Object.freeze({ level: "airy", notes: ["preserve premium spacing"] });
  if (density === "dense") return Object.freeze({ level: "compact", notes: ["keep high-information sections scannable"] });
  return Object.freeze({ level: "balanced", notes: ["alternate focus and detail"] });
}
