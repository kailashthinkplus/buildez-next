import { inspectCompositionGuard } from "./CompositionGuard";
import { COMPOSITION_ANTI_PATTERNS } from "./CompositionAntiPatterns";
import { COMPOSITION_QUALITY_PASS_SCORE, COMPOSITION_QUALITY_WEIGHTS, clampQualityScore } from "./CompositionQualityRules";
import type { CompositionQualityScore, CompositionQualityWarning } from "./CompositionQualityScore";
import { relationshipRuleFor } from "./sectionRelationshipRules";
import { analyzeVisualRhythm, type QualitySection } from "./visualRhythmAnalyzer";

export type CompositionQualityInputSection = Readonly<{
  id: string;
  componentVariantId?: string;
  componentId?: string;
  category?: string;
  purpose?: string;
}>;

export type CompositionQualityInput = Readonly<{
  sections: readonly CompositionQualityInputSection[];
  businessFamily?: string;
  archetype?: string;
  conversionGoal?: string;
  selectedComponents?: readonly string[];
  designIntent?: unknown;
}>;

function normalizedSections(input: CompositionQualityInput): QualitySection[] {
  return input.sections.map((section, index) => Object.freeze({
    id: section.id || `section.${index}`,
    componentVariantId: section.componentVariantId ?? section.componentId ?? input.selectedComponents?.[index] ?? "",
    category: section.category ?? "",
    purpose: section.purpose ?? "",
  }));
}

function containsRole(section: QualitySection, role: string): boolean {
  if (section.category.toLowerCase() === "hero") return role === "hero";
  return `${section.componentVariantId} ${section.category} ${section.purpose}`.toLowerCase().includes(role);
}

function firstRoleIndex(sections: readonly QualitySection[], roles: readonly string[]): number {
  return sections.findIndex((section) => roles.some((role) => containsRole(section, role)));
}

function relationshipScores(sections: readonly QualitySection[], family: string) {
  const rule = relationshipRuleFor(family);
  const presentPreferred = rule.preferredRoles
    .map((role) => ({ role, index: firstRoleIndex(sections, [role]) }))
    .filter((entry) => entry.index >= 0);
  const inversions = presentPreferred.reduce((total, entry, index) => total + presentPreferred.slice(index + 1).filter((next) => next.index < entry.index).length, 0);
  const missingRequired = rule.requiredRoles.filter((role) => firstRoleIndex(sections, [role]) < 0);
  const trustIndex = firstRoleIndex(sections, rule.trustRoles);
  const conversionIndexes = sections.map((section, index) => rule.conversionRoles.some((role) => containsRole(section, role)) ? index : -1).filter((index) => index >= 0);
  const finalConversionIndex = conversionIndexes.at(-1) ?? -1;
  const relationshipScore = clampQualityScore(100 - inversions * 9 - missingRequired.length * 15);
  const trustScore = clampQualityScore(trustIndex < 0 ? 25 : finalConversionIndex >= 0 && trustIndex > finalConversionIndex ? 40 : 100);
  const conversionScore = clampQualityScore(finalConversionIndex < 0 ? 35 : finalConversionIndex < Math.max(2, sections.length - 3) ? 55 : conversionIndexes.length > 2 ? 62 : 100);
  return { rule, missingRequired, relationshipScore, trustScore, conversionScore };
}

function uniqueWarnings(warnings: readonly CompositionQualityWarning[]): readonly CompositionQualityWarning[] {
  return Object.freeze(warnings.filter((warning, index) => warnings.findIndex((candidate) => candidate.code === warning.code) === index));
}

export function evaluateCompositionQuality(input: CompositionQualityInput): CompositionQualityScore {
  const sections = normalizedSections(input);
  const family = input.businessFamily ?? "unknown";
  const rhythm = analyzeVisualRhythm(sections);
  const relationships = relationshipScores(sections, family);
  const warnings: CompositionQualityWarning[] = [...inspectCompositionGuard(sections, relationships.rule, family, rhythm)];
  relationships.missingRequired.forEach((role) => warnings.push(Object.freeze({
    code: "missing-recommended-section",
    message: `Recommended ${role} layer is missing for ${family.replaceAll("_", " ")}.`,
    severity: role === "hero" || relationships.rule.conversionRoles.includes(role) ? "major" : "minor",
    sectionIds: Object.freeze([]),
  })));
  const finalWarnings = uniqueWarnings(warnings);
  const densityScore = clampQualityScore(sections.length < 3 ? 42 : sections.length > 12 ? 65 : 94 - Math.max(0, rhythm.consecutiveCardMaximum - 1) * 8);
  const rhythmScore = clampQualityScore(relationships.relationshipScore * 0.55 + rhythm.visualBreakScore * 0.45);
  const score = clampQualityScore(
    rhythmScore * COMPOSITION_QUALITY_WEIGHTS.rhythm
      + relationships.trustScore * COMPOSITION_QUALITY_WEIGHTS.trust
      + relationships.conversionScore * COMPOSITION_QUALITY_WEIGHTS.conversion
      + rhythm.visualBreakScore * COMPOSITION_QUALITY_WEIGHTS.visualBalance
      + densityScore * COMPOSITION_QUALITY_WEIGHTS.density,
  );
  const suggestions = finalWarnings.map((warning) => {
    const antiPattern = COMPOSITION_ANTI_PATTERNS.find((pattern) => pattern.id === warning.code);
    return antiPattern?.suggestion ?? (warning.code === "missing-recommended-section" ? warning.message.replace(" is missing", " should be added") : "Vary the section sequence before blueprint compilation.");
  });
  return Object.freeze({
    score,
    rhythmScore,
    trustScore: relationships.trustScore,
    conversionScore: relationships.conversionScore,
    visualBalanceScore: rhythm.visualBreakScore,
    densityScore,
    warnings: finalWarnings,
    suggestions: Object.freeze([...new Set(suggestions)]),
    passed: score >= COMPOSITION_QUALITY_PASS_SCORE && !finalWarnings.some((warning) => warning.severity === "major"),
  });
}

export const CompositionQualityEngine = Object.freeze({ evaluate: evaluateCompositionQuality });
