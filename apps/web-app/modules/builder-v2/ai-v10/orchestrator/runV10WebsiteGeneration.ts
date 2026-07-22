import { runBrandIntelligence } from "../../website-engine/brand-intelligence/BrandIntelligenceEngine";
import { runBuilderBlueprintEngine } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { runBusinessIntelligence } from "../../website-engine/business-intelligence/BusinessIntelligenceEngine";
import { runComponentEngine } from "../../website-engine/components/ComponentEngine";
import { runCompositionEngine } from "../../website-engine/composition/CompositionEngine";
import { CreativeDirectorCompiler } from "../../website-engine/creative-director";
import { runContentIntelligence } from "../../website-engine/content-intelligence/ContentIntelligenceEngine";
import { runCritic } from "../../website-engine/critic/runCritic";
import { runDecisionEngine } from "../../website-engine/decision/decisionPlan";
import { runDesignEngine } from "../../website-engine/design/DesignEngine";
import { runExperienceEngine } from "../../website-engine/experience/ExperienceEngine";
import { runPatternIntelligence } from "../../website-engine/pattern-intelligence/PatternIntelligenceEngine";
import { runAIPlanner } from "../../website-engine/planner/AIPlanner";
import { runRendererParityCheck } from "../../website-engine/renderer-parity/rendererParity";
import { runRepair } from "../../website-engine/repair/runRepair";
import type { BusinessContext, BusinessFamily, JsonValue } from "../../website-engine/sdk";
import { runWebsiteSpecBuilder } from "../../website-engine/specification/WebsiteSpecBuilder";
import { runRenderedVisualQualityLoop, type RenderBlueprintForVisualQuality, type RenderedVisualQualityLoopResult } from "../../website-engine/visual-quality";
import type { BuilderBlueprint } from "../../types/blueprint";
import { runV10CreativeEnrichment, type V10CreativeEnrichmentInput } from "../creative/runV10CreativeEnrichment";
import { expandV10BlueprintRecipes } from "../blueprint/expandV10BlueprintRecipes";
import { runV10ImageGeneration } from "../media/runV10ImageGeneration";
import { applyV10BlueprintRepair } from "../repair/applyV10BlueprintRepair";
import { assertSemanticHydrationComplete } from "../creative/semanticHydrationValidation";
import { buildWidgetHydrationDiagnostics } from "../creative/typedWidgetHydration";
import { discoverNativeWidgetMediaSlots } from "../media/nativeWidgetMediaSlots";
import { AiV10ForensicTrace } from "../forensics";
import { enforceNativeWidgetPopulationGate } from "../../website-engine/builder-blueprint/widget-population";

export type RunV10WebsiteGenerationInput = {
  pageId: string;
  prompt: string;
  pageTitle?: string;
  pageSlug?: string;
  siteId?: string;
  siteName?: string;
  designTokens?: Record<string, unknown> | null;
  context?: Record<string, unknown>;
  onProgress?: (update: { agent: string; stage: string; summary: string; completed: number; total: number }) => void;
};

export type V10GenerationDependencies = Readonly<{
  runCreativeEnrichment: (input: V10CreativeEnrichmentInput) => Promise<BuilderBlueprint>;
  runImageGeneration: typeof runV10ImageGeneration;
  renderBlueprint?: RenderBlueprintForVisualQuality;
}>;

const DEFAULT_DEPENDENCIES: V10GenerationDependencies = Object.freeze({
  runCreativeEnrichment: runV10CreativeEnrichment,
  runImageGeneration: runV10ImageGeneration,
});

function withCurrentNativeBlueprint<T extends { blueprint: { nativeBlueprint: BuilderBlueprint } }>(artifact: T, blueprint: BuilderBlueprint): T {
  return { ...artifact, blueprint: { ...artifact.blueprint, nativeBlueprint: blueprint } };
}

const BUSINESS_FAMILIES = new Set<BusinessFamily>([
  "healthcare", "real_estate", "hospitality", "food_and_beverage", "education",
  "beauty_wellness", "fitness", "automotive", "construction", "architecture_interiors",
  "professional_services", "legal_finance", "ecommerce_d2c", "manufacturing_industrial",
  "logistics", "travel", "creative_portfolio", "ngo_community", "entertainment_events",
  "technology_saas", "personal_brand", "unknown",
]);

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function familyFor(value: unknown): BusinessFamily {
  const normalized = String(value ?? "").toLowerCase().replace(/[\s-]+/g, "_") as BusinessFamily;
  return BUSINESS_FAMILIES.has(normalized) ? normalized : "unknown";
}

function businessContextFor(input: RunV10WebsiteGenerationInput): BusinessContext {
  const context = input.context ?? {};
  const promptBusinessName = input.prompt.match(/\b([A-Z][A-Za-z0-9&' -]{2,48}\s(?:Group|Developers|Homes|Properties|Realty|Estates))\b/i)?.[1]?.trim();
  const contextName = clean(context.companyName);
  const safeContextName = contextName && !/^(goals?|company|business|website|unknown)$/i.test(contextName) ? contextName : undefined;
  const factKeys = new Set(["companyName", "industry", "location", "audience", "offer", "useCase", "designIntent"]);
  const knownFacts = Object.fromEntries(
    Object.entries(context).filter(([key, value]) => factKeys.has(key) && (value === null || ["string", "number", "boolean"].includes(typeof value)))
  ) as Record<string, JsonValue>;
  return Object.freeze({
    businessName: promptBusinessName ?? safeContextName ?? input.siteName,
    family: familyFor(context.industry),
    industryId: clean(context.industry),
    location: clean(context.location),
    audience: [clean(context.audience) ?? "qualified visitors"],
    offerings: [clean(context.offer) ?? "primary offer"],
    differentiators: [],
    proofPoints: [],
    knownFacts,
    missingFacts: [],
    sourceNotes: ["ai-v10.website-engine"],
  });
}

export async function runV10WebsiteGeneration(
  input: RunV10WebsiteGenerationInput,
  dependencies: V10GenerationDependencies = DEFAULT_DEPENDENCIES
) {
  const generationRunId = typeof input.context?.generationRunId === "string"
    ? input.context.generationRunId
    : `${input.pageId}-${Date.now()}`;
  const forensic = new AiV10ForensicTrace(generationRunId);
  forensic.snapshot("00-input.json", { ...input, onProgress: input.onProgress ? "[callback]" : undefined, generationRunId });
  const businessContext = businessContextFor(input);
  const subject = businessContext.businessName || businessContext.industryId || "this website";
  const report = (completed: number, agent: string, stage: string, summary: string) =>
    input.onProgress?.({ agent, stage, summary, completed, total: 15 });
  report(0, "IntentAgent", "engine-planning", `Interpreting the approved goals and audience for ${subject}.`);
  const planner = runAIPlanner({ prompt: input.prompt, businessContext }).data;
  report(1, "BusinessIntelligenceAgent", "business-intelligence", `Building the business, audience, and conversion model for ${subject}.`);
  const businessProfile = runBusinessIntelligence({
    rawPromptSummary: input.prompt,
    businessContext,
  }).data;
  forensic.snapshot("01-business-profile.json", businessProfile);
  report(2, "BrandIntelligenceAgent", "brand-intelligence", `Translating the selected art direction into a distinctive brand system for ${subject}.`);
  const brandProfile = runBrandIntelligence({
    businessProfile,
    businessContext,
    brandHints: input.context as never,
  } as never).data;
  forensic.snapshot("02-brand-profile.json", brandProfile);
  report(3, "ContentStrategyAgent", "content-strategy", `Planning the page narrative, proof, and calls to action for ${subject}.`);
  const contentStrategy = runContentIntelligence({
    businessProfile,
    brandProfile,
    knownFacts: businessContext.knownFacts,
  } as never).data;
  forensic.snapshot("03-content-strategy.json", contentStrategy);
  report(4, "ExperienceAgent", "experience", `Designing the visitor journey and conversion sequence for ${subject}.`);
  const experienceStrategy = runExperienceEngine({ businessProfile, contentStrategy } as never).data;
  forensic.snapshot("04-experience-strategy.json", experienceStrategy);
  report(5, "PatternAgent", "pattern-intelligence", `Choosing use-case-specific sections and avoiding repetitive landing-page patterns.`);
  const patternIntelligence = runPatternIntelligence({ businessProfile, contentStrategy, experienceStrategy } as never).data;
  forensic.snapshot("05-pattern-intelligence.json", patternIntelligence);
  report(6, "DesignSystemAgent", "design-system", `Creating typography, color, spacing, and visual rhythm from the approved direction.`);
  const designResult = runDesignEngine({
    businessProfile,
    brandProfile,
    contentStrategy,
    experienceStrategy,
    patternIntelligence,
  }).data;
  forensic.snapshot("06-design-result.json", designResult);
  const artDirectionBrief = CreativeDirectorCompiler.compile({
    websiteSpec: { business: { family: businessProfile.businessFamily }, archetype: planner.interpretedIntent?.archetypeHints[0] } as never,
    designResult,
    patternIntelligence,
  }).artDirectionBrief;
  forensic.snapshot("07-art-direction-brief.json", artDirectionBrief);
  report(7, "ComponentSelectionAgent", "components", `Selecting editable Builder components for the planned content and interactions.`);
  const componentResult = runComponentEngine({
    businessProfile,
    brandProfile,
    patternIntelligence,
    designResult,
    artDirectionBrief,
    experienceStrategy,
  }).data;
  forensic.snapshot("08-component-candidates.json", { rankedCandidates: componentResult.rankedCandidates, sectionCandidates: componentResult.sectionCandidates });
  forensic.snapshot("09-component-selection.json", { recommendedSelections: componentResult.recommendedSelections, sectionSelections: componentResult.sectionSelections, compilerCoverage: componentResult.compilerCoverage, anatomyDiagnostics: componentResult.anatomyDiagnostics, visualCapabilityDiagnostics: componentResult.visualCapabilityDiagnostics, explorationSeed: componentResult.explorationSeed });
  const capabilityTrace = componentResult.visualCapabilityDiagnostics ?? [];
  forensic.snapshot("09-native-visual-capabilities.json", {
    sections: capabilityTrace,
    coverage: {
      primitiveSectionCount: capabilityTrace.filter((item) => !item.selectedCapability).length,
      premiumWidgetCount: capabilityTrace.filter((item) => item.selectedCapability).length,
      interactiveWidgetCount: capabilityTrace.filter((item) => item.interactionLevel === "interactive").length,
      fullBleedSectionCount: capabilityTrace.filter((item) => item.containerMode === "fullBleed").length,
      fullWidthSectionCount: capabilityTrace.filter((item) => item.containerMode === "fullWidth").length,
      boxedSectionCount: capabilityTrace.filter((item) => item.containerMode === "boxed").length,
      uniqueSilhouetteCount: new Set(capabilityTrace.map((item) => item.selectedCapability).filter(Boolean)).size,
      fallbackCompilerCount: capabilityTrace.filter((item) => item.compilerCoverage !== "native-adapter").length,
    },
  });
  report(8, "CompositionAgent", "composition", `Composing varied editorial layouts and responsive section structures.`);
  const compositionResult = runCompositionEngine({
    businessProfile,
    contentStrategy,
    experienceStrategy,
    patternIntelligence,
    designResult,
    componentResult,
    artDirectionBrief,
  } as never).data;
  forensic.snapshot("10-composition-result.json", compositionResult);
  const initialDecision = runDecisionEngine({
    businessIntelligence: businessProfile,
    brandIntelligence: brandProfile,
    contentStrategy,
    experienceStrategy,
    patternIntelligence,
  }).data.plan;
  const specification = runWebsiteSpecBuilder({
    businessContext,
    businessProfile,
    brandProfile,
    contentStrategy,
    experienceStrategy,
    patternIntelligence,
    designResult,
    componentResult,
    compositionResult,
    decisionPlan: initialDecision,
  }).data;
  forensic.snapshot("11-website-spec.json", specification);
  report(9, "BlueprintCompilerAgent", "builder-blueprint", `Turning the approved design decisions into native editable sections.`);
  const blueprintArtifact = runBuilderBlueprintEngine({
    websiteSpec: specification.websiteSpec,
    websiteDNA: specification.websiteDNA,
    designResult,
    componentResult,
    compositionResult,
    patternIntelligence,
    artDirectionBrief,
  }).data;
  forensic.snapshot("12-semantic-compilation.json", blueprintArtifact);
  forensic.snapshot("13-widget-seeds.json", blueprintArtifact.blueprint.widgets);
  const engineBlueprint = expandV10BlueprintRecipes(blueprintArtifact.blueprint.nativeBlueprint);
  forensic.snapshot("14-blueprint-before-enrichment.json", engineBlueprint);
  report(10, "CreativeEnrichmentAgent", "creative-enrichment", `Writing use-case-aware copy and refining the approved layouts. This is usually the longest creative step.`);
  let creativeBeat = 0;
  const creativeMilestones = [
    "Developing section-specific headlines, proof, and conversion copy.",
    "Applying the selected art direction across the native section layouts.",
    "Refining responsive hierarchy, spacing, and visual contrast.",
    "Checking customer-facing copy for repetition and internal language.",
    "Finalizing editable node patches for the composed page.",
  ];
  const creativeTimer = setInterval(() => {
    const detail = creativeMilestones[Math.min(creativeBeat, creativeMilestones.length - 1)];
    creativeBeat += 1;
    report(10, "CreativeEnrichmentAgent", `creative-enrichment-${creativeBeat}`, `${detail} ${creativeBeat * 15}s elapsed in this creative pass.`);
  }, 15000);
  const enrichedBlueprint = await dependencies.runCreativeEnrichment({
    generationRunId: typeof input.context?.generationRunId === "string" ? input.context.generationRunId : undefined,
    prompt: input.prompt,
    businessContext: businessContext as unknown as Record<string, unknown>,
    websiteSpec: specification.websiteSpec,
    designResult,
    componentResult,
    compositionResult,
    blueprint: engineBlueprint,
  }).finally(() => clearInterval(creativeTimer));
  assertSemanticHydrationComplete(enrichedBlueprint, "after-creative-enrichment");
  forensic.snapshot("15-blueprint-after-enrichment.json", enrichedBlueprint);
  forensic.snapshot("widget-hydration-diagnostics.json", buildWidgetHydrationDiagnostics(engineBlueprint, undefined, enrichedBlueprint));

  report(11, "ImageGenerationAgent", "image-generation", `Generating and uploading imagery matched to ${subject}; several assets may be processed sequentially.`);
  const imageResult = await dependencies.runImageGeneration(enrichedBlueprint, input.siteId, (completed, total) => {
    report(11, "ImageGenerationAgent", `image-generation-${completed}`, `Generated and uploaded ${completed} of ${total} planned website images for ${subject}.`);
  });
  assertSemanticHydrationComplete(imageResult.blueprint, "after-image-generation");
  forensic.snapshot("16-blueprint-after-images.json", imageResult.blueprint);
  forensic.snapshot("widget-media-assignment.json", { before:discoverNativeWidgetMediaSlots(enrichedBlueprint),after:discoverNativeWidgetMediaSlots(imageResult.blueprint),applied:imageResult.applied,warnings:imageResult.warnings });
  report(12, "CriticAgent", "quality-review", `Reviewing hierarchy, content specificity, composition depth, and image coverage.`);
  const initialParity = runRendererParityCheck({ blueprint: imageResult.blueprint, sourceId: `ai-v10.${input.pageId}.pre-repair` });
  const hydratedArtifact = withCurrentNativeBlueprint(blueprintArtifact, imageResult.blueprint);
  const initialEvaluation = runCritic({
    websiteSpec: specification.websiteSpec,
    websiteDNA: specification.websiteDNA,
    builderBlueprintResult: hydratedArtifact,
    rendererParityResult: initialParity,
    componentResult,
    compositionResult,
    knownFacts: businessContext.knownFacts,
    missingFacts: specification.missingFacts,
  }).data;
  const repairPlan = runRepair({
    criticResult: initialEvaluation,
    rendererParityResult: initialParity,
    websiteSpec: specification.websiteSpec,
    websiteDNA: specification.websiteDNA,
    builderBlueprintResult: hydratedArtifact,
    componentResult,
    compositionResult,
    missingFacts: specification.missingFacts,
  }).data;
  report(13, "RepairAgent", "cleanup", `Applying deterministic output cleanup; the critic repair plan remains advisory.`);
  let blueprint = applyV10BlueprintRepair(imageResult.blueprint);
  forensic.snapshot("17-blueprint-after-repair.json", blueprint);
  assertSemanticHydrationComplete(blueprint, "after-deterministic-cleanup");
  let renderedVisualQuality: RenderedVisualQualityLoopResult | undefined;
  if (dependencies.renderBlueprint) {
    report(13, "VisualQualityAgent", "rendered-visual-quality", "Rendering desktop, tablet, and mobile candidates for pixel-level visual review.");
    const forensicRender: RenderBlueprintForVisualQuality = async (candidate, iteration) => {
      const screenshots = await dependencies.renderBlueprint!(candidate, iteration);
      forensic.captureScreenshots(screenshots);
      return screenshots;
    };
    renderedVisualQuality = await runRenderedVisualQualityLoop({ blueprint, render: forensicRender, maxIterations: 3 });
    blueprint = renderedVisualQuality.blueprint;
    assertSemanticHydrationComplete(blueprint, "after-rendered-visual-repair");
  }
  const populationEnforcement = enforceNativeWidgetPopulationGate({blueprint,businessContext:businessContext as unknown as Record<string,unknown>,knownFacts:businessContext.knownFacts as unknown as Record<string,unknown>,missingFacts:specification.missingFacts});
  blueprint=populationEnforcement.blueprint;
  forensic.snapshot("widget-population-gate.json", populationEnforcement.diagnostics);
  if(!populationEnforcement.gate.passed){forensic.snapshot("18-final-blueprint-rejected.json",blueprint);throw new Error(`NATIVE_WIDGET_POPULATION_GATE_FAILED: ${populationEnforcement.gate.failures.slice(0,8).map((failure)=>`${failure.widgetId}:${failure.code}`).join(", ")}`);}
  report(14, "ParityAgent", "renderer-parity", `Verifying responsive Builder compatibility and preparing the page for review.`);
  const rendererParity = runRendererParityCheck({ blueprint, sourceId: `ai-v10.${input.pageId}.final` });
  const finalArtifact = withCurrentNativeBlueprint(blueprintArtifact, blueprint);
  const evaluation = runCritic({
    websiteSpec: specification.websiteSpec,
    websiteDNA: specification.websiteDNA,
    builderBlueprintResult: finalArtifact,
    rendererParityResult: rendererParity,
    componentResult,
    compositionResult,
    knownFacts: businessContext.knownFacts,
    missingFacts: specification.missingFacts,
  }).data;
  const semanticHydration = assertSemanticHydrationComplete(blueprint, "before-generation-return");
  forensic.snapshot("18-final-blueprint.json", blueprint);
  forensic.finalize(blueprint);
  const qualityCategories = Object.freeze({
    engineeringQuality: Object.freeze({ score: Math.max(0, 100 - rendererParity.issues.reduce((sum, issue) => sum + (issue.severity === "blocker" ? 30 : issue.severity === "major" ? 15 : 4), 0)), passed: rendererParity.parityReady }),
    semanticQuality: Object.freeze({ score: evaluation.overallScore, passed: evaluation.passed }),
    visualQuality: Object.freeze({ available: Boolean(renderedVisualQuality), score: renderedVisualQuality ? Math.min(renderedVisualQuality.evaluation.compositionScore, renderedVisualQuality.evaluation.typographyScore, renderedVisualQuality.evaluation.imageryScore, renderedVisualQuality.evaluation.hierarchyScore, renderedVisualQuality.evaluation.originalityScore, renderedVisualQuality.evaluation.responsiveScore) : undefined, passed: renderedVisualQuality?.evaluation.passed }),
    populationQuality: Object.freeze({ passed:populationEnforcement.gate.passed,fullyPopulatedWidgets:populationEnforcement.gate.fullyPopulatedWidgets,totalWidgets:populationEnforcement.gate.totalWidgets }),
    passed: populationEnforcement.gate.passed && rendererParity.parityReady && evaluation.passed && (renderedVisualQuality ? renderedVisualQuality.evaluation.passed : true),
    nonCompensating: true as const,
  });
  report(15, "ParityAgent", "complete", `Website generation for ${subject} is complete.`);

  return {
    blueprint,
    spec: specification.websiteSpec,
    evaluation,
    repairPlan,
    renderedVisualQuality,
    qualityCategories,
    trace: [
      "ai-v10.website-engine.planner",
      "ai-v10.website-engine.business-intelligence",
      "ai-v10.website-engine.brand-intelligence",
      "ai-v10.website-engine.content-intelligence",
      "ai-v10.website-engine.experience",
      "ai-v10.website-engine.pattern-intelligence",
      "ai-v10.website-engine.design",
      "ai-v10.website-engine.components",
      "ai-v10.website-engine.composition",
      "ai-v10.website-engine.specification",
      "ai-v10.website-engine.builder-blueprint",
      "ai-v10.gpt-5.6.engine-node-enrichment",
      "ai-v10.gpt-image-2.asset-generation",
      "ai-v10.website-engine.critic",
      "ai-v10.website-engine.repair-plan-advisory",
      "ai-v10.website-engine.deterministic-cleanup-applied",
      ...(renderedVisualQuality ? ["ai-v10.website-engine.rendered-visual-quality-loop"] : []),
      "ai-v10.website-engine.final-parity",
    ],
    metadata: {
      aiMode: "ai-v10-native-website-engine",
      aiGenerationVersion: "v10",
      creativeModel: process.env.OPENAI_V10_WEBSITE_MODEL || "gpt-5.6-sol",
      imageModel: process.env.OPENAI_V10_IMAGE_MODEL || "gpt-image-2",
      generatedImageCount: imageResult.applied,
      imageWarnings: imageResult.warnings,
      websiteEngineSpecId: specification.websiteSpec.id,
      websiteEngineBlueprintId: blueprintArtifact.blueprint.id,
      websiteEngineEvaluation: evaluation,
      websiteEngineRepairPlan: repairPlan,
      websiteEngineRepairPlanApplied: false,
      websiteEngineRendererParity: rendererParity,
      websiteEngineStages: 15,
      aiV9Used: false,
      semanticHydration: {
        valid: semanticHydration.valid,
        unresolvedCount: semanticHydration.unresolvedCount,
        unresolvedNodeIds: semanticHydration.unresolvedNodeIds,
      },
      canonicalBlueprint: blueprintArtifact.validation.valid && semanticHydration.valid,
      agents: [
        { agent: "IntentAgent", stage: "engine-planning", ok: true, summary: "Interpreted the approved website brief." },
        { agent: "BusinessIntelligenceAgent", stage: "business-intelligence", ok: true, summary: "Built the use-case and audience model." },
        { agent: "BrandIntelligenceAgent", stage: "brand-intelligence", ok: true, summary: "Translated the art direction into brand rules." },
        { agent: "ContentStrategyAgent", stage: "content-strategy", ok: true, summary: "Planned the narrative, proof, and conversion journey." },
        { agent: "ExperienceAgent", stage: "experience", ok: true, summary: "Designed the page journey and interaction priorities." },
        { agent: "PatternAgent", stage: "pattern-intelligence", ok: true, summary: "Selected use-case-aware patterns and avoided generic repetition." },
        { agent: "DesignSystemAgent", stage: "design-system", ok: true, summary: "Created typography, color, spacing, and composition rules." },
        { agent: "ComponentSelectionAgent", stage: "components", ok: true, summary: "Selected editable builder-native components." },
        { agent: "CompositionAgent", stage: "composition", ok: true, summary: "Composed varied editorial layouts and section rhythm." },
        { agent: "BlueprintCompilerAgent", stage: "builder-blueprint", ok: true, summary: "Compiled the Engine specification into a canonical blueprint." },
        { agent: "CreativeEnrichmentAgent", stage: "creative-enrichment", ok: true, summary: "Enriched Engine-owned nodes with page-ready copy and art direction." },
        { agent: "ImageGenerationAgent", stage: "image-generation", ok: imageResult.warnings.length === 0, summary: `Applied ${imageResult.applied} generated images.`, warnings: imageResult.warnings },
        { agent: "CriticAgent", stage: "quality-review", ok: true, summary: "Reviewed the result against the approved website direction." },
        { agent: "RepairAgent", stage: "cleanup", ok: true, summary: "Applied deterministic cleanup; critic recommendations remain advisory." },
        { agent: "ParityAgent", stage: "renderer-parity", ok: rendererParity.parityReady, summary: "Verified the canonical blueprint against renderer constraints.", warnings: rendererParity.warnings.map((warning) => warning.message) },
      ],
    },
  };
}
