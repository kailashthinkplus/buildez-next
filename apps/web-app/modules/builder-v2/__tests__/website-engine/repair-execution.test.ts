import assert from "node:assert/strict";
import test from "node:test";

import { normalizeBlueprint, serializeBlueprint, stripUndefinedValues } from "../../core/serialization";
import { validateBlueprint } from "../../core/validation";
import { buildBuilderBlueprint } from "../../website-engine/builder-blueprint/BuilderBlueprintEngine";
import { GOLDEN_WEBSITE_CASES } from "../../website-engine/golden-websites";
import { goldenWebsiteInput } from "../../website-engine/golden-websites/framework/GoldenWebsiteRunner";
import { executeRepairPlan, type BlueprintRepairAction, type BlueprintRepairPlan } from "../../website-engine/repair";

const fixture = GOLDEN_WEBSITE_CASES.find((item) => item.id === "interior-design-studio")!;

function productHeroInput() {
  const source = goldenWebsiteInput(fixture);
  return {
    ...source,
    compositionResult: { ...source.compositionResult!, orderedSectionSequence: source.compositionResult!.orderedSectionSequence.map((item) => item.id === "hero" ? { ...item, componentId: "HeroProductValue01" } : item) },
    websiteSpec: { ...source.websiteSpec!, sections: source.websiteSpec!.sections.map((item) => String(item.id) === "hero" ? { ...item, componentVariantRef: "HeroProductValue01" } : item) },
  };
}

function plan(action: BlueprintRepairAction): BlueprintRepairPlan {
  return Object.freeze({ id: `plan.${action.id}`, source: "visual-repair-plan", actions: Object.freeze([action]), approvedActionIds: Object.freeze([action.id]), deterministic: true });
}

const action = (value: Partial<BlueprintRepairAction> & Pick<BlueprintRepairAction, "id" | "type">): BlueprintRepairAction => Object.freeze({ sourceRecommendationId: `recommendation.${value.id}`, confidence: .86, approved: true, ...value });

test("approved component replacement executes through CommandBus and remains undoable", () => {
  const compileInput = productHeroInput();
  const blueprint = buildBuilderBlueprint(compileInput).nativeBlueprint;
  const before = JSON.stringify(blueprint);
  const repair = action({ id: "replace-hero", type: "replace_component_variant", sectionId: "hero", from: "HeroProductValue01", to: "HeroEditorialSplit01" });
  const result = executeRepairPlan({ blueprint, plan: plan(repair), mode: "simulate", compileInput, businessFamily: "architecture_interiors", selectedComponents: fixture.expectedComponents });
  assert.equal(result.status, "simulated");
  assert.equal(result.sourceBlueprintMutated, false);
  assert.equal(result.persisted, false);
  assert.equal(JSON.stringify(blueprint), before);
  assert.equal(validateBlueprint(result.blueprint).valid, true);
  assert.equal(serializeBlueprint(result.blueprint).ok, true);
  assert.ok(result.effectiveness.after >= result.effectiveness.before);
  assert.equal(result.effectiveness.accepted, true);
  assert.equal(result.history.length, 1);
  assert.doesNotThrow(() => JSON.stringify(result.history));
  const applied = JSON.stringify(result.commandBus!.getBlueprint());
  result.commandBus!.undo(); assert.equal(JSON.stringify(result.commandBus!.getBlueprint()), JSON.stringify(stripUndefinedValues(normalizeBlueprint(blueprint))));
  result.commandBus!.redo(); assert.equal(JSON.stringify(result.commandBus!.getBlueprint()), applied);
});

test("design token, layout, and density repairs are native commands with one transaction history", () => {
  const compileInput = goldenWebsiteInput(fixture); const blueprint = buildBuilderBlueprint(compileInput).nativeBlueprint;
  const actions = [
    action({ id: "spacing", type: "adjust_design_token", token: "spacing.sectionY", delta: "+12%" }),
    action({ id: "layout", type: "change_layout_pattern", sectionId: "services", pattern: "editorial_split" }),
    action({ id: "density", type: "reduce_content_density", sectionId: "services" }),
  ];
  const repairPlan: BlueprintRepairPlan = Object.freeze({ id: "plan.multi", source: "visual-repair-plan", actions: Object.freeze(actions), approvedActionIds: Object.freeze(actions.map((item) => item.id)), deterministic: true });
  const result = executeRepairPlan({ blueprint, plan: repairPlan, mode: "apply", compileInput, businessFamily: fixture.businessProfile.family, selectedComponents: fixture.expectedComponents });
  assert.equal(result.status, "applied"); assert.equal(result.persisted, true); assert.equal(result.history.length, 1); assert.equal(result.history[0].transaction, true);
  assert.deepEqual(result.history[0].commandNames, ["Update Design Token", "Change Layout Pattern", "Reduce Content Density"]);
  assert.equal(result.validation.gates.every((gate) => gate.valid), true);
});

test("invalid and incompatible replacements are rejected before command execution", () => {
  const compileInput = productHeroInput(); const blueprint = buildBuilderBlueprint(compileInput).nativeBlueprint;
  for (const to of ["DoesNotExist01", "ServiceMatrixCards01"]) {
    const repair = action({ id: `invalid-${to}`, type: "replace_component_variant", sectionId: "hero", from: "HeroProductValue01", to });
    const result = executeRepairPlan({ blueprint, plan: plan(repair), mode: "simulate", compileInput, businessFamily: "architecture_interiors" });
    assert.equal(result.status, "rejected", to); assert.equal(result.history.length, 0, to); assert.ok(result.validation.issues.length, to);
  }
});

test("missing optional assets are preserved safely without fake URLs", () => {
  const compileInput = productHeroInput(); const original = buildBuilderBlueprint(compileInput).nativeBlueprint;
  const blueprint = { ...original, nodes: Object.fromEntries(Object.entries(original.nodes).map(([id, node]) => [id, node.type === "image" ? { ...node, props: { ...node.props, src: "" } } : node])) };
  const repair = action({ id: "asset-safe", type: "replace_component_variant", sectionId: "hero", from: "HeroProductValue01", to: "HeroEditorialSplit01" });
  const result = executeRepairPlan({ blueprint, plan: plan(repair), mode: "simulate", compileInput, businessFamily: "architecture_interiors" });
  assert.equal(result.status, "simulated");
  const images = Object.values(result.blueprint.nodes).filter((node) => node.type === "image");
  assert.ok(images.every((node) => !String(node.props.src ?? "").startsWith("http")));
  assert.ok(images.filter((node) => node.id.endsWith(".hero")).every((node) => "alt" in node.props && String(node.props.src ?? "") === ""));
});

test("unapproved plans cannot execute", () => {
  const compileInput = productHeroInput(); const blueprint = buildBuilderBlueprint(compileInput).nativeBlueprint;
  const unapproved = action({ id: "not-approved", type: "change_layout_pattern", sectionId: "services", pattern: "editorial_split", approved: false });
  const result = executeRepairPlan({ blueprint, plan: Object.freeze({ id: "plan.none", source: "visual-repair-plan", actions: Object.freeze([unapproved]), approvedActionIds: Object.freeze([]), deterministic: true }), mode: "apply" });
  assert.equal(result.status, "rejected"); assert.equal(result.executedActionIds.length, 0); assert.equal(result.persisted, false);
});
