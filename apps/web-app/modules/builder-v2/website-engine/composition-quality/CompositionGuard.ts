import { COMPOSITION_ANTI_PATTERNS } from "./CompositionAntiPatterns";
import { COMPOSITION_QUALITY_RULES } from "./CompositionQualityRules";
import type { CompositionQualityWarning } from "./CompositionQualityScore";
import type { SectionRelationshipRule } from "./sectionRelationshipRules";
import { sectionLayoutPattern, type QualitySection, type VisualRhythmAnalysis } from "./visualRhythmAnalyzer";

function containsAny(section: QualitySection, roles: readonly string[]): boolean {
  if (section.category.toLowerCase() === "hero") return roles.includes("hero");
  const value = `${section.componentVariantId} ${section.category} ${section.purpose}`.toLowerCase();
  return roles.some((role) => value.includes(role));
}

function warning(code: CompositionQualityWarning["code"], message: string, severity: CompositionQualityWarning["severity"], sectionIds: readonly string[] = []): CompositionQualityWarning {
  return Object.freeze({ code, message, severity, sectionIds: Object.freeze([...sectionIds]) });
}

export function inspectCompositionGuard(sections: readonly QualitySection[], rule: SectionRelationshipRule, family: string, rhythm: VisualRhythmAnalysis): readonly CompositionQualityWarning[] {
  const warnings: CompositionQualityWarning[] = [];
  const trustIndex = sections.findIndex((section) => containsAny(section, rule.trustRoles));
  const conversionIndexes = sections.map((section, index) => containsAny(section, rule.conversionRoles) ? index : -1).filter((index) => index >= 0);
  const firstConversion = conversionIndexes[0] ?? -1;

  if (trustIndex < 0) warnings.push(warning("missing-trust", COMPOSITION_ANTI_PATTERNS[0].description, "major"));
  if (firstConversion >= 0 && (trustIndex < 0 || firstConversion < trustIndex)) warnings.push(warning("conversion-too-early", "Conversion requested before sufficient trust building.", "major", [sections[firstConversion].id]));
  if (conversionIndexes.length > COMPOSITION_QUALITY_RULES.maximumPrimaryConversionSections) warnings.push(warning("cta-abuse", COMPOSITION_ANTI_PATTERNS[2].description, "major", conversionIndexes.map((index) => sections[index].id)));
  if (rhythm.consecutiveCardMaximum > COMPOSITION_QUALITY_RULES.maximumConsecutiveCardSections) {
    const cardIds = sections.filter((section) => sectionLayoutPattern(section) === "cards").map((section) => section.id);
    warnings.push(warning("card-fatigue", COMPOSITION_ANTI_PATTERNS[1].description, "major", cardIds));
  }
  const visualRequired = ["real_estate", "hospitality", "portfolio", "restaurant", "food_and_beverage"].includes(family.toLowerCase().replace(/[\s-]+/g, "_"));
  if (visualRequired && !sections.some((section) => containsAny(section, rule.visualRoles))) warnings.push(warning("missing-visual-storytelling", COMPOSITION_ANTI_PATTERNS[3].description, "major"));
  if (rhythm.repeatedPatterns.length && rhythm.consecutiveCardMaximum <= COMPOSITION_QUALITY_RULES.maximumConsecutiveCardSections) warnings.push(warning("repeated-layout", "Identical layout patterns repeat without enough visual variation.", "minor"));
  return Object.freeze(warnings);
}
