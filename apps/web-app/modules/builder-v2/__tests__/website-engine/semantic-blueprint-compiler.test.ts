import assert from "node:assert/strict";
import test from "node:test";

import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { RecipeRegistry } from "../../website-engine/builder-blueprint/recipes";
import { expandV10BlueprintRecipes } from "../../ai-v10/blueprint/expandV10BlueprintRecipes";

function semanticInput() {
  const sequence = [
    { id: "opening", componentId: "hero.architectural", category: "hero", family: "hero", purpose: "Opening story", requiredFacts: [], requiredAssets: ["hero"], orderHint: 0 },
    { id: "work", componentId: "portfolio.editorial", category: "portfolio", family: "gallery", purpose: "Selected work", requiredFacts: [], requiredAssets: ["projects"], orderHint: 1 },
    { id: "answers", componentId: "faq.accordion", category: "FAQ", family: "content", purpose: "Common questions", requiredFacts: [], requiredAssets: [], orderHint: 2 },
    { id: "close", componentId: "cta.concierge", category: "CTA", family: "conversion", purpose: "Conversion close", requiredFacts: [], requiredAssets: [], orderHint: 3 },
  ];
  return {
    websiteSpec: {
      id: "spec.semantic", version: "1", business: { businessName: "Sanjeevini Group", family: "real_estate", audience: [], offerings: [], differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [], sourceNotes: [] },
      goals: { primaryGoal: "site visit", secondaryGoals: [], conversionGoals: [] }, archetype: "brochure",
      sections: sequence.map((section) => ({ id: section.id, type: section.category, purpose: section.purpose, requiredContentFields: [], requiredAssetIds: section.requiredAssets, editable: true, patternRefs: [`pattern.${section.category.toLowerCase()}`], componentVariantRef: section.componentId })),
      factsUsed: [], missingFacts: [], confidence: 1,
    },
    compositionResult: { orderedSectionSequence: sequence },
    componentResult: { recommendedSelections: sequence.map((section) => ({ variant: { id: section.componentId, category: section.category, family: section.family, patternIds: [`pattern.${section.category.toLowerCase()}`], label: section.purpose, version: "1", metadata: {}, requiredFacts: [], requiredAssets: [], editableMappingIntent: {} } })) },
    patternIntelligence: { selectedPatterns: sequence.map((section) => ({ patternId: `pattern.${section.category.toLowerCase()}`, reason: "fit", satisfies: [], risks: [] })) },
    designResult: {
      id: "design.semantic", designLanguage: { name: "Editorial" },
      typographyProfile: { headingFamily: "Cormorant Garamond", bodyFamily: "Inter" },
      colorProfile: { background: "#fbf8f2", foreground: "#201b17", accent: "#9b4b32", muted: "#e8ded2" },
      spacingProfile: { sectionY: 104, gutter: 30, gridGap: 26 }, layoutProfile: { maxWidth: "1240px" },
      motionProfile: { level: "low", behavior: ["reveal"] }, responsiveProfile: { mobile: ["stack"], tablet: ["adapt"], desktop: ["expand"] },
      themeProfile: { radius: "18px", shadow: "0 20px 60px rgba(0,0,0,.1)" },
      designTokens: { id: "tokens.semantic", color: { primary: "#9b4b32" }, typography: {}, spacing: { sectionY: 104 }, radius: { card: 18 }, shadow: {} },
    },
  } as never;
}

test("semantic compiler preserves composition order and selects distinct recipes", () => {
  const result = compileSemanticBlueprint(semanticInput());
  assert.deepEqual(result.sections.map((section) => section.id), ["opening", "work", "answers", "close"]);
  assert.deepEqual(result.selectedRecipes.map((selection) => selection.recipe), ["hero", "portfolio", "faq", "cta"]);
  assert.deepEqual(result.seeds[0].children, ["section.opening", "section.work", "section.answers", "section.close"]);
});

test("semantic recipes emit placeholders, varied structures, and no legacy copy", () => {
  const result = compileSemanticBlueprint(semanticInput());
  const serialized = JSON.stringify(result.seeds);
  assert.doesNotMatch(serialized, /Editable verified content goes here|Missing facts remain explicit/);
  assert.match(serialized, /\{\{hero\.headline\}\}/);
  assert.match(serialized, /\{\{portfolio\.item_1_title\}\}/);
  const heroContainer = result.seeds.find((seed) => seed.id === "container.opening");
  const portfolioGrid = result.seeds.find((seed) => seed.id === "container.items.work");
  assert.notDeepEqual(heroContainer?.style?.gridTemplateColumns, portfolioGrid?.style?.gridTemplateColumns);
});

test("semantic blueprint remains native, editable, responsive, inspectable, and design-token driven", () => {
  const result = buildBuilderBlueprint(semanticInput());
  assert.equal(result.validation.valid, true, JSON.stringify(result.validation.issues));
  assert.equal(result.nativeCompatibility.compatible, true);
  assert.ok(result.widgets.every((widget) => widget.capabilities.canEdit));
  assert.ok(result.widgets.every((widget) => widget.inspector.tabs.includes("responsive")));
  assert.ok(result.widgets.every((widget) => widget.motionBindings.length > 0));
  assert.ok(result.responsiveBindings.length > 0);
  assert.equal((result.nativeBlueprint.theme.tokens as any).colors.primary, "#9b4b32");
  assert.equal((result.nativeBlueprint.theme.tokens as any).spacing.sectionY, 104);
});

test("recipe registry exposes every RC-9A recipe family", () => {
  assert.deepEqual(RecipeRegistry.names().sort(), ["about", "comparison", "contact", "cta", "faq", "feature-grid", "footer", "gallery", "hero", "portfolio", "pricing", "services", "stats", "testimonials", "timeline"].sort());
});

test("v10 legacy recipe expansion does not overwrite semantic compiler output", () => {
  const result = buildBuilderBlueprint(semanticInput()).nativeBlueprint;
  assert.equal(expandV10BlueprintRecipes(result), result);
});
