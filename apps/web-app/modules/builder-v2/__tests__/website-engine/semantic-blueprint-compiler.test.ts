import assert from "node:assert/strict";
import test from "node:test";

import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { RecipeRegistry } from "../../website-engine/builder-blueprint/recipes";
import { ComponentVariantCompilerRegistry, ComponentVariantRecipeRegistry } from "../../website-engine/builder-blueprint/component-recipes";
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

const HERO_VARIANTS = ["HeroEditorialSplit01", "HeroProductValue01", "HeroBookingFocused01", "HeroAppointmentFocused01"] as const;

function heroVariantInput(componentVariantId: typeof HERO_VARIANTS[number]) {
  const input = structuredClone(semanticInput()) as any;
  input.websiteSpec.sections[0].componentVariantRef = componentVariantId;
  input.compositionResult.orderedSectionSequence[0].componentId = componentVariantId;
  input.componentResult.recommendedSelections[0].variant.id = componentVariantId;
  input.componentResult.recommendedSelections[0].variant.category = "hero";
  input.componentResult.recommendedSelections[0].variant.family = "hero";
  input.compositionResult.pageRhythm = { rhythm: "editorial", notes: ["intent"] };
  input.compositionResult.visualBreathing = { level: "airy", notes: ["intent"] };
  input.compositionResult.sectionWeights = [{ sectionId: "opening", weight: "heavy", reason: "hero" }];
  input.compositionResult.mobileStacking = { order: ["opening", "work", "answers", "close"], stickyActionRecommended: false, notes: ["copy before media"] };
  input.compositionResult.compositionPlan = { mediaContentAlternation: { pattern: "alternating", notes: ["intent"] } };
  return input;
}

function structuralSignature(componentVariantId: typeof HERO_VARIANTS[number]) {
  const result = compileSemanticBlueprint(heroVariantInput(componentVariantId));
  const heroSeeds = result.seeds.filter((seed) => seed.sourceSectionId === "opening");
  const local = (id: string | null | undefined) => id?.replace(/\.opening$/, "") ?? null;
  return JSON.stringify(heroSeeds.map((seed) => ({ id: local(seed.id), type: seed.type, parent: local(seed.parentId), children: seed.children?.map(local) ?? [], display: seed.style?.display, direction: seed.style?.flexDirection, columns: seed.style?.gridTemplateColumns, role: seed.props?.semanticRole })));
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

test("four exact hero component IDs route through native variant recipes without regex matching", () => {
  for (const componentVariantId of HERO_VARIANTS) {
    const section = compileSemanticBlueprint(heroVariantInput(componentVariantId)).sections[0];
    const resolved = ComponentVariantCompilerRegistry.resolve(section);
    assert.equal(resolved?.name, componentVariantId);
    assert.equal(resolved?.compiler.variantId, componentVariantId);
    assert.equal(typeof resolved?.compiler.compile, "function");
    assert.equal(compileSemanticBlueprint(heroVariantInput(componentVariantId)).selectedRecipes[0].recipe, componentVariantId);
  }
  const nearMatch = { ...compileSemanticBlueprint(heroVariantInput("HeroEditorialSplit01")).sections[0], componentVariantId: "HeroEditorialSplit01Suffix" };
  assert.equal(ComponentVariantRecipeRegistry.resolve(nearMatch), undefined);
});

test("hero compiler architecture locks layout, CTA, media, role, and responsive placement", () => {
  const seedsFor = (variant: typeof HERO_VARIANTS[number]) => compileSemanticBlueprint(heroVariantInput(variant)).seeds.filter((seed) => seed.sourceSectionId === "opening");
  const byId = (variant: typeof HERO_VARIANTS[number]) => new Map(seedsFor(variant).map((seed) => [seed.id, seed]));

  const editorial = byId("HeroEditorialSplit01");
  assert.equal(editorial.get("container.opening")?.style?.display, "grid");
  assert.deepEqual(editorial.get("container.opening")?.style?.gridTemplateColumns, { desktop: "1.05fr .95fr", tablet: "1fr 1fr", mobile: "1fr" });
  assert.equal(editorial.get("button.primary_cta.opening")?.parentId, "container.actions.opening");
  assert.equal(editorial.get("image.editorial_image.opening")?.parentId, "column.editorial-media.opening");

  const product = byId("HeroProductValue01");
  assert.equal(product.get("container.opening")?.style?.display, "flex");
  assert.deepEqual(product.get("container.opening")?.children, ["container.product-intro.opening", "container.product-stage.opening"]);
  assert.equal(product.get("button.primary_cta.opening")?.parentId, "container.product-intro.opening");
  assert.equal(product.get("image.product_media.opening")?.parentId, "column.product-media.opening");
  assert.equal(product.get("column.product-media.opening")?.parentId, "container.product-stage.opening");

  const booking = byId("HeroBookingFocused01");
  assert.equal(booking.get("button.booking_cta.opening")?.parentId, "column.booking-action.opening");
  assert.deepEqual(booking.get("container.reassurance.opening")?.style?.gridColumn, { desktop: "1 / -1", tablet: "1 / -1", mobile: "auto" });
  assert.equal(seedsFor("HeroBookingFocused01").some((seed) => seed.type === "image"), false);

  const appointment = byId("HeroAppointmentFocused01");
  assert.equal(appointment.get("container.opening")?.style?.flexDirection, "column");
  assert.equal(appointment.get("button.appointment_cta.opening")?.parentId, "column.appointment-content.opening");
  assert.deepEqual(appointment.get("container.appointment-help.opening")?.children, ["column.process-help.opening", "column.trust-note.opening"]);
  assert.equal(seedsFor("HeroAppointmentFocused01").some((seed) => seed.type === "image"), false);
});

test("native hero variants have distinct meaningful structures and exactly one h1", () => {
  assert.equal(new Set(HERO_VARIANTS.map(structuralSignature)).size, HERO_VARIANTS.length);
  for (const componentVariantId of HERO_VARIANTS) {
    const result = compileSemanticBlueprint(heroVariantInput(componentVariantId));
    const heroSeeds = result.seeds.filter((seed) => seed.sourceSectionId === "opening");
    assert.equal(heroSeeds.filter((seed) => seed.type === "heading" && seed.props?.level === "h1").length, 1);
    assert.ok(heroSeeds.some((seed) => ["heading", "text", "button", "image"].includes(seed.type) && JSON.stringify(seed.props).includes("{{hero.")));
    assert.equal(heroSeeds.some((seed) => ["section", "container", "column"].includes(seed.type) && JSON.stringify(seed.props).includes("{{")), false);
  }
});

test("native hero variants validate, map natively, and serialize losslessly", () => {
  for (const componentVariantId of HERO_VARIANTS) {
    const result = buildBuilderBlueprint(heroVariantInput(componentVariantId));
    assert.equal(result.validation.valid, true, `${componentVariantId}: ${JSON.stringify(result.validation.issues)}`);
    assert.equal(result.nativeCompatibility.compatible, true, componentVariantId);
    const serialized = JSON.stringify(result.nativeBlueprint);
    assert.equal(JSON.stringify(JSON.parse(serialized)), serialized);
  }
});

test("unknown variants and non-hero sections retain legacy registry fallback and section order", () => {
  const input = heroVariantInput("HeroEditorialSplit01") as any;
  input.websiteSpec.sections[0].componentVariantRef = "HeroUnknown01";
  input.compositionResult.orderedSectionSequence[0].componentId = "HeroUnknown01";
  input.componentResult.recommendedSelections[0].variant.id = "HeroUnknown01";
  const result = compileSemanticBlueprint(input);
  assert.deepEqual(result.sections.map((section) => section.id), ["opening", "work", "answers", "close"]);
  assert.equal(result.selectedRecipes[0].recipe, RecipeRegistry.resolve(result.sections[0]).name);
  assert.equal(result.selectedRecipes[1].recipe, RecipeRegistry.resolve(result.sections[1]).name);
});

test("v10 legacy recipe expansion does not overwrite semantic compiler output", () => {
  const result = buildBuilderBlueprint(semanticInput()).nativeBlueprint;
  assert.equal(expandV10BlueprintRecipes(result), result);
});
