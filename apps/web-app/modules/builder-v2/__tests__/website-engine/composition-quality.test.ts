import assert from "node:assert/strict";
import test from "node:test";

import { COMPOSITION_QUALITY_FIXTURES, CompositionQualityEngine } from "../../website-engine/composition-quality";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";

test("golden industry compositions preserve preferred ordering and score above 85", () => {
  for (const fixture of COMPOSITION_QUALITY_FIXTURES) {
    const result = CompositionQualityEngine.evaluate(fixture);
    assert.equal(result.passed, true, `${fixture.id}: ${JSON.stringify(result)}`);
    assert.ok(result.score >= fixture.expectedMinimumScore, `${fixture.id}: expected >= ${fixture.expectedMinimumScore}, received ${result.score}`);
  }
});

test("missing trust fails and warns before conversion", () => {
  const result = CompositionQualityEngine.evaluate({
    businessFamily: "automotive",
    sections: [
      { id: "hero", componentVariantId: "HeroBookingFocused01", category: "hero", purpose: "Opening" },
      { id: "services", componentVariantId: "VehicleServiceMatrix01", category: "service", purpose: "Services" },
      { id: "booking", componentVariantId: "FinalBookingBlock01", category: "booking", purpose: "Book now" },
    ],
  });
  assert.equal(result.passed, false);
  assert.ok(result.warnings.some((warning) => warning.code === "missing-trust"));
  assert.ok(result.warnings.some((warning) => warning.code === "conversion-too-early"));
});

test("conversion block before proof emits an early CTA warning", () => {
  const result = CompositionQualityEngine.evaluate({
    businessFamily: "healthcare",
    sections: [
      { id: "hero", componentVariantId: "HeroAppointmentFocused01", category: "hero", purpose: "Care" },
      { id: "appointment", componentVariantId: "AppointmentCTA01", category: "appointment", purpose: "Appointment" },
      { id: "credentials", componentVariantId: "CredentialsBand01", category: "credential", purpose: "Credentials" },
      { id: "services", componentVariantId: "ServiceMatrixCards01", category: "service", purpose: "Services" },
    ],
  });
  assert.ok(result.warnings.some((warning) => warning.code === "conversion-too-early"));
  assert.ok(result.conversionScore < 70);
});

test("three consecutive card layouts trigger card fatigue", () => {
  const result = CompositionQualityEngine.evaluate({
    businessFamily: "professional_services",
    sections: [
      { id: "hero", componentVariantId: "HeroEditorialSplit01", category: "hero", purpose: "Opening" },
      { id: "trust", componentVariantId: "TrustBandInline01", category: "trust", purpose: "Proof" },
      { id: "services", componentVariantId: "ServiceMatrixCards01", category: "service", purpose: "Services cards" },
      { id: "features", componentVariantId: "FeatureGrid01", category: "feature", purpose: "Feature cards" },
      { id: "pricing", componentVariantId: "PricingCards01", category: "pricing", purpose: "Pricing cards" },
      { id: "contact", componentVariantId: "FinalContactBlock01", category: "contact", purpose: "Contact" },
    ],
  });
  assert.ok(result.warnings.some((warning) => warning.code === "card-fatigue"));
  assert.ok(result.visualBalanceScore < 70);
});

test("poor short composition scores below 60", () => {
  const result = CompositionQualityEngine.evaluate({
    businessFamily: "real_estate",
    sections: [
      { id: "hero", componentVariantId: "HeroEditorialSplit01", category: "hero", purpose: "Opening" },
      { id: "cta", componentVariantId: "FinalConversionBlock01", category: "cta", purpose: "Book now" },
    ],
  });
  assert.ok(result.score < 60, JSON.stringify(result));
  assert.equal(result.passed, false);
  assert.ok(result.warnings.some((warning) => warning.code === "missing-visual-storytelling"));
});

test("semantic compiler attaches warning-only composition metadata without changing section order", () => {
  const orderedSectionSequence = [
    { id: "hero", componentId: "hero.architectural", category: "hero", family: "hero", purpose: "Opening", requiredFacts: [], requiredAssets: [], orderHint: 0 },
    { id: "cta", componentId: "FinalConversionBlock01", category: "cta", family: "conversion", purpose: "Book now", requiredFacts: [], requiredAssets: [], orderHint: 1 },
  ];
  const result = compileSemanticBlueprint({
    websiteSpec: {
      id: "spec.quality", version: "1", business: { businessName: "Quality", family: "real_estate", audience: [], offerings: [], differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [], sourceNotes: [] },
      goals: { primaryGoal: "site visit", secondaryGoals: [], conversionGoals: ["site visit"] }, archetype: "brochure",
      sections: orderedSectionSequence.map((section) => ({ id: section.id, type: section.category, purpose: section.purpose, requiredContentFields: [], requiredAssetIds: [], editable: true, componentVariantRef: section.componentId })),
      factsUsed: [], missingFacts: [], confidence: 1,
    },
    compositionResult: { orderedSectionSequence },
  } as never);
  assert.deepEqual(result.sections.map((section) => section.id), ["hero", "cta"]);
  assert.equal(result.compositionQuality.passed, false);
  assert.ok(result.compositionQuality.warnings.length > 0);
  assert.equal(result.seeds[0].children?.length, 2);
});
