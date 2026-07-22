import type { CompilerInput } from "./compiledPlan";

export function compileTrace(input: CompilerInput): string[] {
  return [
    "compiled-from-decision-plan",
    ...(input.businessProfile ? ["business-intelligence"] : []),
    ...(input.brandProfile ? ["brand-intelligence"] : []),
    ...(input.contentStrategy ? ["content-intelligence"] : []),
    ...(input.experienceStrategy ? ["experience-engine"] : []),
    ...(input.patternIntelligence ? ["pattern-intelligence"] : []),
    ...(input.designResult ? ["design-engine"] : []),
    ...(input.inspirationProfile ? ["inspiration-engine"] : []),
    ...(input.visualMoodProfile ? ["visual-mood-engine"] : []),
    ...(input.mediaStrategy ? ["media-intelligence"] : []),
    ...(input.motionStrategy ? ["motion-intelligence"] : []),
    ...(input.componentResult ? ["component-engine"] : []),
    ...(input.compositionResult ? ["composition-engine"] : []),
    "no-builder-nodes",
    "no-html",
    "no-react-components",
    "no-css-generation",
  ];
}
