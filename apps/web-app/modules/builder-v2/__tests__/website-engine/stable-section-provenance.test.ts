import assert from "node:assert/strict";
import test from "node:test";
import { buildSectionSpecsWithDiagnostics } from "../../website-engine/specification/sectionSpecBuilder";
import { compileSemanticBlueprint } from "../../website-engine/builder-blueprint/SemanticBlueprintCompiler";

const patterns = ["editorial_hero", "sticky_mobile_cta", "footer_trust_closure", "trust_band"];
const selections = patterns.map((patternId, index) => ({ section: { id: `section.${patternId}.${index + 1}`, purpose: `${patternId} purpose`, category: patternId.includes("hero") ? "hero" : patternId.includes("sticky") ? "conversion-block" : "proof", patternId }, selection: { variant: { id: index < 2 ? "SharedComponent01" : `${patternId}.component`, category: index < 2 ? "hero" : "proof", family: "test", patternIds: [patternId], label: patternId, metadata: {}, requiredFacts: [], requiredAssets: [], editableMappingIntent: {} } } }));
const sequence = [...selections].reverse().map((item, orderHint) => ({ id: item.section.id, componentId: item.selection.variant.id, category: item.section.category, family: "test", purpose: item.section.purpose, requiredFacts: [], requiredAssets: [], orderHint }));
const input = { patternIntelligence: { selectedPatterns: patterns.map((patternId) => ({ patternId, reason: patternId, satisfies: [], risks: [] })) }, componentResult: { sectionSelections: selections, recommendedSelections: selections.map((item) => item.selection) }, compositionResult: { orderedSectionSequence: sequence } } as any;
const websiteSpec = (sections: unknown[]) => ({ id: "stable-spec", business: { family: "real_estate" }, goals: { primaryGoal: "consult", secondaryGoals: [], conversionGoals: [] }, sections });

test("reordered composition retains stable section-to-pattern provenance", () => {
  const result = buildSectionSpecsWithDiagnostics(input);
  assert.equal(result.diagnostics.length, 0);
  assert.deepEqual(Object.fromEntries(result.sections.map((section) => [section.id, section.patternRefs[0]])), Object.fromEntries(selections.map((item) => [item.section.id, item.section.patternId])));
});

test("sections sharing a component remain distinct in semantic compilation", () => {
  const sectionSpecs = buildSectionSpecsWithDiagnostics(input).sections;
  const result = compileSemanticBlueprint({ ...input, websiteSpec: websiteSpec(sectionSpecs) } as never);
  const editorial = result.sections.find((section) => section.id.includes("editorial_hero"))!;
  const sticky = result.sections.find((section) => section.id.includes("sticky_mobile_cta"))!;
  assert.equal(editorial.purpose, "editorial_hero purpose");
  assert.equal(sticky.purpose, "sticky_mobile_cta purpose");
  assert.deepEqual(editorial.patternIds, ["editorial_hero"]);
  assert.deepEqual(sticky.patternIds, ["sticky_mobile_cta"]);
  assert.notEqual(editorial.type, sticky.type);
  assert.equal(result.associationDiagnostics.length, 0);
});

test("missing stable association is explicit and never falls back through component ID", () => {
  const orphan = { ...sequence[0], id: "legacy-orphan" };
  const result = buildSectionSpecsWithDiagnostics({ ...input, componentResult: undefined, compositionResult: { orderedSectionSequence: [orphan] } } as any);
  assert.deepEqual(result.sections[0].patternRefs, []);
  assert.equal(result.diagnostics[0].code, "MISSING_STABLE_SECTION_ASSOCIATION");

  const compiled = compileSemanticBlueprint({ componentResult: input.componentResult, compositionResult: { orderedSectionSequence: [orphan] }, websiteSpec: websiteSpec([{ ...buildSectionSpecsWithDiagnostics(input).sections[0], componentVariantRef: orphan.componentId }]) } as never);
  assert.equal(compiled.sections[0].purpose, orphan.purpose);
  assert.equal(compiled.associationDiagnostics[0].code, "MISSING_STABLE_SECTION_ASSOCIATION");
});
