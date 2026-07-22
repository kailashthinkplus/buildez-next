import assert from "node:assert/strict";
import test from "node:test";

import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";
import { compileCreativeDirection } from "../../website-engine/creative-director";
import { GOLDEN_WEBSITE_CASES, createGoldenWebsiteCase, runGoldenWebsite } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";

const industryFixtures = [
  ["luxury-developer", "real_estate", "luxury"], ["affordable-housing", "real_estate", "warm"],
  ["premium-dealership", "automotive", "bold"], ["service-center", "automotive", "technical"],
  ["hospital", "healthcare", "minimal"], ["specialist-clinic", "healthcare", "premium"],
  ["fine-dining", "food_and_beverage", "cinematic"], ["casual-restaurant", "food_and_beverage", "warm"],
  ["enterprise-software", "technology_saas", "technical"],
] as const;

test("same Website Intelligence input produces identical immutable creative direction", () => {
  const input = goldenWebsiteInput(createGoldenWebsiteCase("luxury-developer", "real_estate"));
  const first = compileCreativeDirection(input); const second = compileCreativeDirection(input);
  assert.deepEqual(first, second);
  assert.ok(Object.isFrozen(first)); assert.ok(Object.isFrozen(first.sectionStrategy)); assert.ok(Object.isFrozen(first.creativeWarnings));
  assert.equal(first.metadataOnly, true); assert.equal(first.deterministic, true);
});

test("industry fixtures receive distinct art direction personalities", () => {
  for (const [id, family, expectedStyle] of industryFixtures) {
    const plan = compileCreativeDirection(goldenWebsiteInput(createGoldenWebsiteCase(id, family)));
    assert.equal(plan.compositionStyle, expectedStyle, id);
    assert.ok(plan.visualPersonality.length > 20, id);
    assert.ok(plan.sectionStrategy.narrativeFlow.length > 0, id);
    assert.ok(plan.creativeScore >= 0 && plan.creativeScore <= 100, id);
  }
  assert.notEqual(compileCreativeDirection(goldenWebsiteInput(createGoldenWebsiteCase("luxury-developer", "real_estate"))).visualPersonality, compileCreativeDirection(goldenWebsiteInput(createGoldenWebsiteCase("affordable-housing", "real_estate"))).visualPersonality);
});

test("anti-template rules detect card fatigue, CTA overload, repeated splits, and weak storytelling", () => {
  const base = goldenWebsiteInput(createGoldenWebsiteCase("template-failure", "professional_services"));
  const definitions = [
    ["hero", "HeroProductValue01", "hero"], ["grid-a", "ServiceMatrixCards01", "service"], ["grid-b", "FeatureGridCards01", "feature"], ["grid-c", "PricingCards01", "pricing"],
    ["split-a", "FeatureSplit01", "feature"], ["split-b", "BenefitsSplit01", "benefit"], ["split-c", "OutcomeSplit01", "outcome"],
    ["cta-a", "FinalConversionBlock01", "cta"], ["cta-b", "ContactLeadCaptureForm01", "contact"], ["cta-c", "BookingConversionBlock01", "booking"],
  ] as const;
  const input = { ...base, compositionResult: { ...base.compositionResult!, orderedSectionSequence: definitions.map(([id, componentId, category], orderHint) => ({ id, componentId, category, family: category, purpose: id, requiredFacts: [], requiredAssets: [], orderHint })), sectionWeights: definitions.map(([id]) => ({ sectionId: id, weight: "medium" as const, reason: "intentional failure" })) } };
  const plan = compileCreativeDirection(input);
  const codes = plan.creativeWarnings.map((item) => item.code);
  assert.ok(codes.includes("creative.card-fatigue")); assert.ok(codes.includes("creative.cta-overload")); assert.ok(codes.includes("creative.repeated-splits")); assert.ok(codes.includes("creative.weak-storytelling"));
  assert.ok(plan.creativeScore < 70);
  assert.ok(plan.visualRhythmPlan.sectionVariationScore < 70);
});

test("SemanticBlueprintCompiler attaches creative metadata without changing native seeds", () => {
  const input = goldenWebsiteInput(createGoldenWebsiteCase("fine-dining", "food_and_beverage"));
  const result = compileSemanticBlueprint(input);
  assert.equal(result.creativeDirectionPlan.compositionStyle, "cinematic");
  assert.equal(result.creativeDirectionPlan.metadataOnly, true);
  assert.ok(result.seeds.length > 0);
  assert.equal(JSON.stringify(result.seeds).includes("creativeDirectionPlan"), false);
});

test("all 52 golden websites expose deterministic creative metadata", () => {
  assert.equal(GOLDEN_WEBSITE_CASES.length, 52);
  for (const fixture of GOLDEN_WEBSITE_CASES) {
    const first = runGoldenWebsite(fixture); const second = runGoldenWebsite(fixture);
    assert.equal(first.creativeScore, first.report.creativeScore, fixture.id);
    assert.deepEqual(first.creativeDirectionPlan, second.creativeDirectionPlan, fixture.id);
    assert.deepEqual(first.creativeWarnings, first.report.creativeWarnings, fixture.id);
  }
});

test("premium golden examples meet the creative quality threshold", () => {
  for (const id of ["luxury-residential-developer", "fine-dining", "luxury-brand", "saas-product"]) {
    const fixture = GOLDEN_WEBSITE_CASES.find((item) => item.id === id)!;
    assert.ok(runGoldenWebsite(fixture).creativeScore >= 85, id);
  }
});
