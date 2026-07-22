import assert from "node:assert/strict";
import test from "node:test";

import { GOLDEN_WEBSITE_CASES, buildGoldenWebsitePreview } from "../../website-engine/golden-websites";
import { runVisualCritic } from "../../website-engine/visual-critic";

test("all 52 golden websites expose deterministic critic metadata and safe recommendations", () => {
  assert.equal(GOLDEN_WEBSITE_CASES.length, 52);
  for (const fixture of GOLDEN_WEBSITE_CASES) {
    const first = buildGoldenWebsitePreview(fixture.id)!;
    const second = buildGoldenWebsitePreview(fixture.id)!;
    assert.deepEqual(first.visualCritic, second.visualCritic, fixture.id);
    assert.ok(first.visualCritic.score >= 0 && first.visualCritic.score <= 100, fixture.id);
    assert.equal(first.visualCritic.metadataOnly, true, fixture.id);
    assert.equal(first.visualCritic.blueprintMutated, false, fixture.id);
    assert.equal(first.visualScore, first.visualQuality.overall, fixture.id);
    assert.equal(first.criticScore, first.visualCritic.score, fixture.id);
    assert.deepEqual(first.repairPlan, first.visualCritic.repairPlan, fixture.id);
    assert.equal(first.repairPlan.recommendationOnly, true, fixture.id);
    assert.ok(first.visualCritic.recommendations.every((repair) => repair.automatic === false && repair.confidence >= 0 && repair.confidence <= 1), fixture.id);
  }
});

test("critic does not mutate the Blueprint", () => {
  const preview = buildGoldenWebsitePreview("saas-product")!;
  const before = JSON.stringify(preview.blueprint);
  runVisualCritic({ blueprint: preview.blueprint, compositionPlan: { orderedSectionSequence: preview.fixture.sections.map((section) => ({ id: section.id, componentId: section.componentVariantId, category: section.category, purpose: section.purpose })) }, designExecutionPlan: preview.designExecutionPlan, visualQualityScore: preview.visualQuality });
  assert.equal(JSON.stringify(preview.blueprint), before);
});

test("three consecutive grids produce layout repair recommendations", () => {
  const preview = buildGoldenWebsitePreview("consulting")!;
  const compositionPlan = { orderedSectionSequence: [
    { id: "hero", componentId: "HeroEditorialSplit01", category: "hero" },
    { id: "services", componentId: "ServiceMatrixCards01", category: "service" },
    { id: "features", componentId: "FeatureGrid01", category: "feature" },
    { id: "pricing", componentId: "PricingCards01", category: "pricing" },
    { id: "trust", componentId: "ReviewProofBlock01", category: "trust" },
    { id: "cta", componentId: "FinalConversionBlock01", category: "cta" },
  ] };
  const result = runVisualCritic({ blueprint: preview.blueprint, compositionPlan, designExecutionPlan: preview.designExecutionPlan, visualQualityScore: preview.visualQuality });
  assert.ok(result.issues.some((finding) => finding.id === "issue.repeated-grids"));
  assert.ok(result.recommendations.some((repair) => repair.action === "change_layout_pattern" && repair.suggestedPattern === "editorial_split"));
});

test("conversion critic detects missing trust, early CTA, and CTA overload", () => {
  const preview = buildGoldenWebsitePreview("law-firm")!;
  const compositionPlan = { orderedSectionSequence: [
    { id: "hero", componentId: "HeroEditorialSplit01", category: "hero" },
    { id: "cta-one", componentId: "FinalConversionBlock01", category: "cta" },
    { id: "cta-two", componentId: "ContactLeadCaptureForm01", category: "contact" },
    { id: "cta-three", componentId: "FinalBookingBlock01", category: "booking" },
  ] };
  const result = runVisualCritic({ blueprint: preview.blueprint, compositionPlan, visualQualityScore: preview.visualQuality });
  const ids = result.issues.map((finding) => finding.id);
  assert.ok(ids.includes("issue.cta-overload"));
  assert.ok(ids.includes("issue.cta-too-early"));
  assert.ok(ids.includes("issue.trust-before-conversion"));
  assert.equal(result.repairPriority, "high");
  assert.ok(result.recommendations.filter((repair) => repair.action === "adjust_cta_cadence").length >= 3);
});

test("typography, media, and responsive regressions are detected", () => {
  const preview = buildGoldenWebsitePreview("luxury-residential-developer")!;
  const nodes = Object.fromEntries(Object.entries(preview.blueprint.nodes).map(([id, node]) => [id, {
    ...node,
    ...(node.type === "heading" ? { props: { ...node.props, level: "h3" } } : {}),
    ...(node.type === "image" ? { props: { ...node.props, src: "" } } : {}),
    ...(id === preview.blueprint.root ? { style: { ...node.style, minWidth: "900px", overflowX: "scroll" } } : {}),
  }]));
  const blueprint = { ...preview.blueprint, nodes };
  const visualQualityScore = { ...preview.visualQuality, typography: 40, imagery: 40, responsive: 40, overall: 45 };
  const result = runVisualCritic({ blueprint, compositionPlan: { orderedSectionSequence: [{ id: "hero", componentId: "HeroEditorialSplit01", category: "hero" }, { id: "content", componentId: "ServiceMatrixCards01", category: "service" }] }, visualQualityScore });
  const ids = result.issues.map((finding) => finding.id);
  assert.ok(ids.includes("issue.weak-heading-hierarchy"));
  assert.ok(ids.includes("issue.visual-storytelling-insufficient") || ids.includes("issue.hero-media-missing"));
  assert.ok(ids.includes("issue.mobile-overflow"));
  assert.ok(result.recommendations.every((repair) => repair.automatic === false));
});
