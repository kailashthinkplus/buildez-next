import type { AIWidgetMetadata, BuilderBlueprintInput } from "./builderBlueprint";
import { BUILDER_BLUEPRINT_ENGINE_VERSION_STRING } from "./version";

/**
 * Builds AI/regeneration metadata without calling AI.
 *
 * @example
 * const metadata = buildAIWidgetMetadata(input, "hero", "component.hero");
 */
export function buildAIWidgetMetadata(input: BuilderBlueprintInput, sourceSectionId?: string, sourceComponentVariantId?: string, scope: AIWidgetMetadata["regenerationScope"] = "widget"): AIWidgetMetadata {
  const compiledSection = input.compiledPlan?.sections.find((section) => String(section.id) === sourceSectionId);
  return Object.freeze({
    generatedBy: "website-engine",
    engineVersion: BUILDER_BLUEPRINT_ENGINE_VERSION_STRING,
    sourceWebsiteSpecId: input.websiteSpec ? String(input.websiteSpec.id) : undefined,
    sourceSectionId,
    sourcePatternId: compiledSection?.patternId,
    sourceComponentVariantId,
    sourceDesignLanguage: input.compiledPlan?.selectedDesignLanguage ?? input.designResult?.designLanguage.name,
    sourceContentRole: compiledSection?.contentRole.role,
    sourceExperienceRole: compiledSection?.experienceRole.journeyStage,
    sourceMotionIntent: input.compiledPlan?.creativeDirection.motion.language ?? input.motionStrategy?.motionLanguage,
    generationTraceId: `trace.${sourceSectionId ?? "page"}.${sourceComponentVariantId ?? "generic"}`,
    regenerationScope: scope,
    dependencies: [
      ...(input.websiteSpec ? [String(input.websiteSpec.id)] : []),
      ...(input.compiledPlan ? [String(input.compiledPlan.id)] : []),
    ],
    protectedFields: [],
    editable: true,
    regeneratable: true,
  });
}
