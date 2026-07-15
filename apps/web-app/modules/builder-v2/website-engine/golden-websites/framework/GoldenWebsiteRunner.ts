import { deserializeBlueprint, serializeBlueprint } from "../../../core/serialization";
import { buildBuilderBlueprint } from "../../builder-blueprint/BuilderBlueprintEngine";
import { compileSemanticBlueprint } from "../../builder-blueprint/SemanticBlueprintCompiler";
import type { BuilderBlueprintInput } from "../../builder-blueprint/builderBlueprint";
import type { GoldenWebsiteReport } from "../reports/GoldenWebsiteReport";
import type { GoldenWebsiteCase } from "./GoldenWebsiteCase";
import { calculateGoldenWebsiteScore, type GoldenWebsiteScore } from "./GoldenWebsiteScore";
import { validateGoldenWebsite, type GoldenValidation } from "./GoldenWebsiteValidator";

function designLanguage(family: string) {
  if (family === "real_estate") return { name: "Luxury", density: "airy", sectionY: 120 };
  if (family === "food_and_beverage" || family === "hospitality") return { name: "Hospitality", density: "airy", sectionY: 120 };
  if (family === "technology_saas") return { name: "Technology", density: "dense", sectionY: 80 };
  if (family === "automotive") return { name: "Bold", density: "balanced", sectionY: 96 };
  if (family === "healthcare") return { name: "Clinical", density: "balanced", sectionY: 96 };
  return { name: "Editorial", density: "balanced", sectionY: 96 };
}

export function goldenWebsiteInput(fixture: GoldenWebsiteCase): BuilderBlueprintInput {
  const language = designLanguage(fixture.businessProfile.family);
  const orderedSectionSequence = fixture.sections.map((section, orderHint) => ({
    id: section.id, componentId: section.componentVariantId, category: section.category, family: section.category, purpose: section.purpose, requiredFacts: [], requiredAssets: section.category === "gallery" ? ["gallery"] : [], orderHint,
  }));
  return {
    websiteSpec: {
      id: `spec.${fixture.id}`, version: "1", business: { businessName: fixture.businessProfile.businessName, family: fixture.businessProfile.family, industryId: fixture.industry, audience: [], offerings: [...fixture.businessProfile.offerings], differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [], sourceNotes: [] },
      goals: { primaryGoal: fixture.businessProfile.conversionGoal, secondaryGoals: [], conversionGoals: [fixture.businessProfile.conversionGoal] }, archetype: fixture.archetype,
      sections: fixture.sections.map((section) => ({ id: section.id, type: section.category, purpose: section.purpose, requiredContentFields: [], requiredAssetIds: section.category === "gallery" ? ["gallery"] : [], editable: true, componentVariantRef: section.componentVariantId })),
      factsUsed: [], missingFacts: [], confidence: 1,
    },
    compositionResult: {
      orderedSectionSequence, pageRhythm: { rhythm: "editorial", notes: ["golden benchmark"] }, visualBreathing: { level: language.density === "airy" ? "airy" : "balanced", notes: [] },
      sectionWeights: fixture.sections.map((section) => ({ sectionId: section.id, weight: section.category === "hero" ? "heavy" : "medium", reason: "golden benchmark" })),
      mobileStacking: { order: fixture.sections.map((section) => section.id), stickyActionRecommended: false, notes: ["headline and CTA before media"] },
      densityTransitions: [], ctaCadence: { earlyCta: false, finalCta: true, repeatEverySections: 6, notes: ["single decisive close"] },
      compositionPlan: { mediaContentAlternation: { pattern: "alternating", notes: ["golden benchmark"] } },
    },
    designResult: {
      id: `design.${fixture.id}`, version: "1", designIntent: { id: `intent.${fixture.id}`, goals: ["premium"], constraints: [], mood: [language.name], audiencePerception: [] },
      designLanguage: { name: language.name, typographyBehavior: "clear hierarchy", colorBehavior: "accessible", spacingBehavior: language.density, layoutBehavior: "responsive", imageBehavior: "editorial", motionBehavior: "low", ctaBehavior: "clear", cardBehavior: "structured", backgroundBehavior: "layered", accessibilityConstraints: ["contrast"], suitableIndustries: [], unsuitableIndustries: [] },
      typographyProfile: { headingFamily: "intent-heading", bodyFamily: "intent-body", scale: language.density, behavior: [] }, colorProfile: { paletteName: "golden", background: "#ffffff", foreground: "#171717", accent: "#315b52", muted: "#f2f2f0", behavior: [] },
      spacingProfile: { sectionY: language.sectionY, gutter: 32, gridGap: 28, behavior: [] }, layoutProfile: { maxWidth: "1280px", grid: "responsive", imageTreatment: "editorial", behavior: [] },
      motionProfile: { level: "low", behavior: ["reveal"] }, responsiveProfile: { mobile: ["stack"], tablet: ["reduce columns"], desktop: ["expand"] }, densityProfile: { level: language.density, curve: [] },
      themeProfile: { themeName: "golden", radius: "12px", shadow: "0 12px 32px rgba(0,0,0,.08)", background: [] }, visualRhythm: { beats: ["hero", "proof", "content", "conversion"], emphasis: ["hero", "cta"] }, interactionProfile: { affordance: [], ctaTreatment: [], riskControls: [] }, brandAdaptationReport: { usedAssets: [], missingAssets: [], adaptations: [], risks: [] },
      designTokens: { id: `tokens.${fixture.id}`, color: { primary: "#315b52" }, typography: {}, spacing: { sectionY: language.sectionY }, radius: { card: 12 }, shadow: {} }, accessibilityContrastNotes: ["AA contrast"], confidence: 1,
    },
  } as never;
}

export type GoldenWebsiteRun = Readonly<{
  fixture: GoldenWebsiteCase;
  scores: GoldenWebsiteScore;
  validation: GoldenValidation;
  report: GoldenWebsiteReport;
  blueprint: ReturnType<typeof buildBuilderBlueprint>;
  determinismSignature: string;
  passed: boolean;
}>;

export function runGoldenWebsite(fixture: GoldenWebsiteCase): GoldenWebsiteRun {
  const input = goldenWebsiteInput(fixture);
  const semantic = compileSemanticBlueprint(input);
  const blueprint = buildBuilderBlueprint(input);
  const serialized = serializeBlueprint(blueprint.nativeBlueprint);
  const restored = serialized.ok ? deserializeBlueprint(serialized.value) : { ok: false as const };
  const serializationPassed = Boolean(serialized.ok && restored.ok && serializeBlueprint(restored.ok ? restored.value : blueprint.nativeBlueprint).ok);
  const expectedSectionMatches = fixture.expectedSections.filter((section) => blueprint.sections.some((candidate) => candidate.role.toLowerCase().includes(section.toLowerCase()) || candidate.sourceSectionId === section)).length;
  const structureScore = Math.round((expectedSectionMatches / Math.max(1, fixture.expectedSections.length)) * 100);
  const editabilityScore = blueprint.widgets.every((widget) => widget.capabilities.canEdit) ? 100 : 60;
  const responsiveScore = blueprint.responsiveBindings.length > 0 && blueprint.widgets.every((widget) => widget.inspector.tabs.includes("responsive")) ? 100 : 60;
  const scores = calculateGoldenWebsiteScore({ structureScore, compositionScore: semantic.compositionQuality.score, designScore: semantic.designExecutionPlan.qualityScore.overall, editabilityScore, responsiveScore });
  const validation = validateGoldenWebsite(fixture, blueprint, semantic.compositionQuality, semantic.designExecutionPlan, serializationPassed);
  const selectedComponents = semantic.sections.map((section) => section.componentVariantId ?? "");
  const report: GoldenWebsiteReport = Object.freeze({
    website: fixture.id, scores, warnings: validation.warnings, failedRules: validation.failedRules, selectedComponents: Object.freeze(selectedComponents),
    compositionTrace: Object.freeze({ score: semantic.compositionQuality.score, warnings: Object.freeze(semantic.compositionQuality.warnings.map((warning) => warning.code)) }),
    designTrace: Object.freeze({ direction: semantic.designExecutionPlan.visualDirection, score: semantic.designExecutionPlan.qualityScore.overall, warnings: Object.freeze(semantic.designExecutionPlan.qualityScore.warnings.map((warning) => warning.code)) }),
  });
  const determinismSignature = JSON.stringify({ nodes: blueprint.widgets.map((widget) => ({ id: widget.id, type: widget.type, parentId: widget.parentId, children: widget.children, props: widget.props, style: widget.style })), scores, report });
  const minimum = fixture.premium ? 85 : 70;
  return Object.freeze({ fixture, scores, validation, report, blueprint, determinismSignature, passed: validation.passed && scores.overallScore >= Math.max(minimum, fixture.expectedScores.overall) });
}

export const GoldenWebsiteRunner = Object.freeze({ run: runGoldenWebsite });
