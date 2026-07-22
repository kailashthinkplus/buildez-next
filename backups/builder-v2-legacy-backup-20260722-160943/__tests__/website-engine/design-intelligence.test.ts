import assert from "node:assert/strict";
import test from "node:test";

import { DesignIntelligenceCompiler } from "../../website-engine/design-intelligence";
import { automotiveDesignFixture } from "../../website-engine/design-intelligence/fixtures/automotive";
import { healthcareDesignFixture } from "../../website-engine/design-intelligence/fixtures/healthcare";
import { luxuryRealEstateDesignFixture } from "../../website-engine/design-intelligence/fixtures/luxury-real-estate";
import { restaurantDesignFixture } from "../../website-engine/design-intelligence/fixtures/restaurant";
import { saasDesignFixture } from "../../website-engine/design-intelligence/fixtures/saas";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";

const fixtures = [luxuryRealEstateDesignFixture, restaurantDesignFixture, healthcareDesignFixture, automotiveDesignFixture, saasDesignFixture];

test("luxury real estate produces an airy editorial execution plan", () => {
  const plan = DesignIntelligenceCompiler.compile(luxuryRealEstateDesignFixture.input);
  assert.equal(plan.visualDirection, "luxury-editorial");
  assert.equal(plan.typographyPlan.headingScale, "editorial");
  assert.equal(plan.typographyPlan.bodyMeasure, "narrow");
  assert.equal(plan.spacingPlan.sectionPadding, "120px");
  assert.equal(plan.containerPlan.heroTreatment, "full-bleed-media");
  assert.equal(plan.containerPlan.textWidth, "620px");
  assert.equal(plan.mediaPlan.imageTreatment, "cinematic");
});

test("healthcare produces readable accessible hierarchy", () => {
  const plan = DesignIntelligenceCompiler.compile(healthcareDesignFixture.input);
  assert.equal(plan.visualDirection, "clear-clinical");
  assert.equal(plan.typographyPlan.bodySize, "18px");
  assert.ok(plan.typographyPlan.bodyLineHeight >= 1.6);
  assert.equal(plan.typographyPlan.bodyMeasure, "readable");
  assert.equal(plan.mediaPlan.croppingBehavior, "center-safe");
});

test("SaaS produces compact information-dense UI hierarchy", () => {
  const plan = DesignIntelligenceCompiler.compile(saasDesignFixture.input);
  assert.equal(plan.visualDirection, "product-precision");
  assert.equal(plan.typographyPlan.headingScale, "compact");
  assert.equal(plan.typographyPlan.headingWeight, "semibold");
  assert.equal(plan.spacingPlan.sectionDensity, "compact");
  assert.equal(plan.spacingPlan.cardSpacing, "24px");
  assert.equal(plan.mediaPlan.croppingBehavior, "contain-ui");
});

test("restaurant produces media-first editorial treatment", () => {
  const plan = DesignIntelligenceCompiler.compile(restaurantDesignFixture.input);
  assert.equal(plan.visualDirection, "hospitality-editorial");
  assert.equal(plan.containerPlan.heroTreatment, "full-bleed-media");
  assert.equal(plan.containerPlan.mediaBreakout, true);
  assert.equal(plan.mediaPlan.imageTreatment, "editorial-lifestyle");
  assert.equal(plan.mediaPlan.galleryBehavior, "immersive-rail");
});

test("responsive and restrained motion rules are generated for every golden fixture", () => {
  for (const fixture of fixtures) {
    const plan = DesignIntelligenceCompiler.compile(fixture.input);
    assert.equal(plan.responsivePlan.mobile.stackingPriority[0], "headline", fixture.id);
    assert.equal(plan.responsivePlan.mobile.ctaVisible, true, fixture.id);
    assert.equal(plan.responsivePlan.mobile.minimumBodySize, "16px", fixture.id);
    assert.equal(plan.motionPlan.reducedMotionRequired, true, fixture.id);
    assert.ok(plan.motionPlan.preferredEffects.length <= 3, fixture.id);
  }
});

test("premium fixtures score above 85 and scoring remains deterministic", () => {
  for (const fixture of fixtures) {
    const first = DesignIntelligenceCompiler.compile(fixture.input);
    const second = DesignIntelligenceCompiler.compile(fixture.input);
    assert.ok(first.qualityScore.overall > fixture.expected.minimumScore, `${fixture.id}: ${first.qualityScore.overall}`);
    assert.deepEqual(first, second);
    assert.equal(first.qualityScore.warnings.length, 0);
  }
});

test("SemanticBlueprintCompiler attaches isolated design execution metadata", () => {
  const result = compileSemanticBlueprint({
    websiteSpec: {
      id: "spec.design-intelligence", version: "1", business: { businessName: "Product", family: "technology_saas", audience: [], offerings: [], differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [], sourceNotes: [] },
      goals: { primaryGoal: "demo", secondaryGoals: [], conversionGoals: ["demo"] }, archetype: "lead_generation",
      sections: [{ id: "hero", type: "hero", purpose: "Product value", requiredContentFields: [], requiredAssetIds: [], editable: true, componentVariantRef: "hero.product" }],
      factsUsed: [], missingFacts: [], confidence: 1,
    },
  } as never);
  assert.equal(result.designExecutionPlan.visualDirection, "product-precision");
  assert.equal(result.designExecutionPlan.responsivePlan.mobile.ctaVisible, true);
  assert.deepEqual(result.sections.map((section) => section.id), ["hero"]);
  assert.ok(result.seeds.length > 1);
});
