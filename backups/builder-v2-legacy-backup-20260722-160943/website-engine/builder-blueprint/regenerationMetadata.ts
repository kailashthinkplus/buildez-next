import type { BuilderBlueprintInput, RegenerationMetadata } from "./builderBlueprint";
import { BUILDER_BLUEPRINT_ENGINE_VERSION_STRING } from "./version";

/**
 * Builds regeneration metadata for page, section, or widget blueprints.
 *
 * @example
 * const metadata = buildRegenerationMetadata(input, "section.hero");
 */
export function buildRegenerationMetadata(input: BuilderBlueprintInput, sourceSectionId?: string, sourceComponentVariantId?: string, sectionRole?: string): RegenerationMetadata {
  return Object.freeze({
    generatedBy: "website-engine",
    engineVersion: BUILDER_BLUEPRINT_ENGINE_VERSION_STRING,
    sourceWebsiteSpecId: input.websiteSpec ? String(input.websiteSpec.id) : undefined,
    sourceSectionId,
    sourcePatternId: input.compiledPlan?.sections.find((section) => String(section.id) === sourceSectionId)?.patternId,
    sourceComponentVariantId,
    designLanguage: input.compiledPlan?.selectedDesignLanguage ?? input.designResult?.designLanguage.name,
    sectionRole,
    editable: true,
    regeneratable: true,
  });
}
