import assert from "node:assert/strict";
import test from "node:test";

import { buildGoldenWebsitePreview } from "../../website-engine/golden-websites";
import { runVisualCritic, type VisualCriticCompositionPlan } from "../../website-engine/visual-critic";
import type { BuilderBlueprint } from "../../types/blueprint";

type Section = NonNullable<VisualCriticCompositionPlan["orderedSectionSequence"]>[number];
const section = (id: string, componentVariantId: string, category: string): Section => ({ id, componentVariantId, category });

function evaluate(caseId: string, sections: readonly Section[], mutateBlueprint?: (blueprint: BuilderBlueprint) => BuilderBlueprint) {
  const preview = buildGoldenWebsitePreview(caseId)!;
  const blueprint = mutateBlueprint ? mutateBlueprint(preview.blueprint) : preview.blueprint;
  return runVisualCritic({ blueprint, compositionPlan: { orderedSectionSequence: sections, mobileStacking: { order: sections.map((item) => item.id) } }, designExecutionPlan: preview.designExecutionPlan, visualQualityScore: preview.visualQuality, businessFamily: preview.fixture.businessProfile.family, archetype: preview.fixture.archetype });
}

test("all golden previews expose deterministic section-level repair plans", () => {
  const first = buildGoldenWebsitePreview("luxury-residential-developer")!;
  const second = buildGoldenWebsitePreview("luxury-residential-developer")!;
  assert.deepEqual(first.repairPlan, second.repairPlan);
  assert.equal(first.repairPlan.recommendationOnly, true);
  assert.equal(first.repairPlan.blueprintMutated, false);
  assert.ok(first.repairPlan.affectedSections.every((item) => item.sectionId && item.violation && item.designPrinciple && item.confidence > 0));
});

test("luxury card fatigue identifies the middle grid and suggests an existing alternative", () => {
  const result = evaluate("luxury-residential-developer", [section("hero", "HeroProductValue01", "hero"), section("projects", "PortfolioShowcaseGrid01", "portfolio"), section("services", "ServiceMatrixCards01", "service"), section("amenities", "AmenityCards01", "service"), section("pricing", "PricingCards01", "pricing"), section("trust", "ReviewProofBlock01", "trust"), section("cta", "FinalConversionBlock01", "cta")]);
  assert.ok(result.affectedSections.some((item) => item.sectionId === "amenities" && item.violation === "repeated-layout-fatigue"));
  assert.ok(result.repairPlan.recommendations.some((item) => item.sectionId === "amenities" && (item.action === "change_layout_pattern" || item.action === "replace_component_variant")));
});

test("SaaS CTA overload identifies competing conversion sections and repairs cadence", () => {
  const result = evaluate("saas-product", [section("hero", "HeroProductValue01", "hero"), section("cta-one", "FinalConversionBlock01", "cta"), section("cta-two", "ContactLeadCaptureForm01", "contact"), section("cta-three", "StickyMobileCTA01", "cta")]);
  assert.ok(result.affectedSections.filter((item) => item.violation === "competing-conversion-actions").length === 3);
  assert.ok(result.repairPlan.recommendations.some((item) => item.action === "adjust_cta_cadence"));
});

test("restaurant without imagery identifies hero media balance and recommends media capability", () => {
  const result = evaluate("fine-dining", [section("hero", "HeroBookingFocused01", "hero"), section("menu", "MenuPreviewCards01", "menu"), section("trust", "ReviewProofBlock01", "trust"), section("cta", "FinalConversionBlock01", "cta")], (blueprint) => ({ ...blueprint, nodes: Object.fromEntries(Object.entries(blueprint.nodes).map(([id, node]) => [id, node.type === "image" ? { ...node, props: { ...node.props, src: "" } } : node])) }));
  assert.ok(result.affectedSections.some((item) => item.sectionId === "hero" && item.violation === "weak-media-balance"));
  assert.ok(result.repairPlan.recommendations.some((item) => item.sectionId === "hero" && ["replace_component_variant", "add_media_slot"].includes(item.action)));
});

test("healthcare without trust identifies the conversion section and trust sequence", () => {
  const result = evaluate("hospital", [section("hero", "HeroAppointmentFocused01", "hero"), section("services", "ServiceMatrixCards01", "service"), section("appointment", "ContactLeadCaptureForm01", "appointment")]);
  assert.ok(result.affectedSections.some((item) => item.sectionId === "appointment" && item.violation === "missing-trust-sequence"));
  assert.ok(result.repairPlan.recommendations.some((item) => item.sectionId === "appointment" && item.action === "adjust_cta_cadence"));
});

test("automotive without conversion path produces an explainable page-level repair", () => {
  const result = evaluate("automotive-service-center", [section("hero", "HeroBookingFocused01", "hero"), section("trust", "TrustBandInline01", "trust"), section("services", "VehicleServiceMatrix01", "service"), section("gallery", "GalleryLifestyleRail01", "gallery")]);
  const issue = result.issues.find((item) => item.id === "issue.cta-missing");
  const repair = result.repairPlan.recommendations.find((item) => item.issueId === issue?.id);
  assert.ok(issue);
  assert.equal(repair?.action, "adjust_cta_cadence");
  assert.ok(repair?.reason?.length);
});

test("repair planning never mutates the Blueprint", () => {
  const preview = buildGoldenWebsitePreview("saas-product")!;
  const before = JSON.stringify(preview.blueprint);
  evaluate("saas-product", [section("hero", "HeroProductValue01", "hero"), section("cta", "FinalConversionBlock01", "cta")]);
  assert.equal(JSON.stringify(preview.blueprint), before);
});
