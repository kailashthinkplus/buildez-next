import assert from "node:assert/strict";
import test from "node:test";

import { GOLDEN_WEBSITE_CASES, calculateGoldenWebsiteScore, createGoldenWebsiteCase, runGoldenWebsite } from "../../website-engine/golden-websites";

test("benchmark covers at least 50 unique launch-critical website archetypes", () => {
  assert.ok(GOLDEN_WEBSITE_CASES.length >= 50);
  assert.equal(GOLDEN_WEBSITE_CASES.length, 52);
  assert.equal(new Set(GOLDEN_WEBSITE_CASES.map((fixture) => fixture.id)).size, GOLDEN_WEBSITE_CASES.length);
  assert.ok(new Set(GOLDEN_WEBSITE_CASES.map((fixture) => fixture.businessProfile.family)).size >= 15);
});

test("all golden websites generate valid editable native deterministic Blueprints", () => {
  for (const fixture of GOLDEN_WEBSITE_CASES) {
    const first = runGoldenWebsite(fixture);
    const second = runGoldenWebsite(fixture);
    assert.equal(first.passed, true, `${fixture.id}: ${JSON.stringify(first.report)}`);
    assert.equal(first.blueprint.validation.valid, true, fixture.id);
    assert.equal(first.blueprint.nativeCompatibility.compatible, true, fixture.id);
    assert.equal(first.validation.capabilities.editable, true, fixture.id);
    assert.equal(first.validation.capabilities.responsive, true, fixture.id);
    assert.equal(first.validation.capabilities.serializable, true, fixture.id);
    assert.equal(first.validation.capabilities["runtime-parity"], true, fixture.id);
    assert.ok(first.scores.overallScore >= fixture.expectedScores.overall, fixture.id);
    assert.equal(first.determinismSignature, second.determinismSignature, fixture.id);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(first.report)), fixture.id);
  }
});

test("golden reports expose selected components and quality traces", () => {
  const result = runGoldenWebsite(GOLDEN_WEBSITE_CASES[0]);
  assert.equal(result.report.website, GOLDEN_WEBSITE_CASES[0].id);
  assert.deepEqual(result.report.selectedComponents, GOLDEN_WEBSITE_CASES[0].expectedComponents);
  assert.ok(result.report.compositionTrace.score >= 85);
  assert.ok(result.report.designTrace.score >= 85);
  assert.equal(typeof result.report.designTrace.direction, "string");
});

test("poor composition fails the benchmark and detects missing trust", () => {
  const base = createGoldenWebsiteCase("poor-real-estate", "real_estate");
  const sections = Object.freeze([
    { id: "hero", category: "hero", componentVariantId: "HeroEditorialSplit01", purpose: "Opening" },
    { id: "services", category: "service", componentVariantId: "ServiceMatrixCards01", purpose: "Services" },
    { id: "cta", category: "cta", componentVariantId: "FinalConversionBlock01", purpose: "Convert now" },
  ]);
  const fixture = Object.freeze({ ...base, sections, expectedSections: Object.freeze(sections.map((section) => section.id)), expectedComponents: Object.freeze(sections.map((section) => section.componentVariantId)) });
  const result = runGoldenWebsite(fixture);
  assert.equal(result.passed, false);
  assert.ok(result.report.compositionTrace.warnings.includes("missing-trust"));
  assert.ok(result.validation.failedRules.includes("anti-pattern-missing-trust"));
});

test("CTA abuse is detected as an anti-pattern", () => {
  const base = createGoldenWebsiteCase("cta-abuse", "professional_services");
  const sections = Object.freeze([
    { id: "hero", category: "hero", componentVariantId: "HeroEditorialSplit01", purpose: "Opening" },
    { id: "trust", category: "trust", componentVariantId: "TrustBandInline01", purpose: "Proof" },
    { id: "cta-one", category: "cta", componentVariantId: "FinalConversionBlock01", purpose: "Contact" },
    { id: "cta-two", category: "contact", componentVariantId: "ContactLeadCaptureForm01", purpose: "Contact again" },
    { id: "cta-three", category: "booking", componentVariantId: "FinalBookingBlock01", purpose: "Book now" },
  ]);
  const fixture = Object.freeze({ ...base, sections, expectedSections: Object.freeze(sections.map((section) => section.id)), expectedComponents: Object.freeze(sections.map((section) => section.componentVariantId)) });
  const result = runGoldenWebsite(fixture);
  assert.equal(result.passed, false);
  assert.ok(result.report.compositionTrace.warnings.includes("cta-abuse"));
  assert.ok(result.validation.failedRules.includes("anti-pattern-cta-abuse"));
});

test("design-score regression drops a premium website below its quality gate", () => {
  const score = calculateGoldenWebsiteScore({ structureScore: 100, compositionScore: 92, designScore: 20, editabilityScore: 100, responsiveScore: 100 });
  assert.ok(score.overallScore < 85);
  assert.equal(score.designScore, 20);
});
