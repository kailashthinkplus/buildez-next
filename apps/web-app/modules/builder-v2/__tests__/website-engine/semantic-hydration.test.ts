import assert from "node:assert/strict";
import test from "node:test";

import { applyCreativeEnrichment, type Enrichment } from "../../ai-v10/creative/runV10CreativeEnrichment";
import {
  assertCreativePatchCoverage,
  assertSemanticHydrationComplete,
  collectCreativeNodeIds,
  findSemanticPlaceholders,
  validateCreativePatchCoverage,
  validateSemanticHydration,
} from "../../ai-v10/creative/semanticHydrationValidation";
import { persistAfterSemanticHydration } from "../../ai-v10/persistence/semanticHydrationPersistenceGate";
import { createPrimitiveBlueprint, TEST_NODE_IDS } from "../fixtures/testBlueprintFixtures";

function semanticBlueprint() {
  const blueprint = createPrimitiveBlueprint();
  return {
    ...blueprint,
    nodes: {
      ...blueprint.nodes,
      [TEST_NODE_IDS.heading]: { ...blueprint.nodes[TEST_NODE_IDS.heading], props: { text: "{{hero.headline}}", level: "h1" } },
      [TEST_NODE_IDS.text]: { ...blueprint.nodes[TEST_NODE_IDS.text], props: { text: "Welcome to {{business.name}}", nested: { values: ["{{hero.description}}"] } } },
      [TEST_NODE_IDS.button]: { ...blueprint.nodes[TEST_NODE_IDS.button], props: { text: "{{primary_cta}}", url: "{{primary_cta.url}}" } },
      [TEST_NODE_IDS.image]: { ...blueprint.nodes[TEST_NODE_IDS.image], props: { src: "{{hero.image}}", alt: "{{hero.image.alt}}", aiImagePrompt: "{{hero.image.prompt}}" } },
    },
  };
}

function completeEnrichment(): Enrichment {
  return { nodes: {
    [TEST_NODE_IDS.heading]: { props: { text: "Homes designed around how Bengaluru lives" } },
    [TEST_NODE_IDS.text]: { props: { text: "Thoughtful residences with enduring materials.", nested: { values: ["Explore considered spaces for everyday life."] } } },
    [TEST_NODE_IDS.button]: { props: { text: "Explore residences", url: "#residences" } },
    [TEST_NODE_IDS.image]: { props: { src: "", alt: "A landscaped contemporary residence", aiImagePrompt: "Editorial architectural photograph of a landscaped Bengaluru residence" } },
  } };
}

test("findSemanticPlaceholders detects multiple nested semantic tokens", () => {
  assert.deepEqual(findSemanticPlaceholders({ a: "{{one}} and {{two.value}}", b: ["{{three-item}}"] }), ["{{one}}", "{{two.value}}", "{{three-item}}"]);
});

test("validateSemanticHydration reports node IDs and prop paths", () => {
  const result = validateSemanticHydration(semanticBlueprint());
  assert.equal(result.valid, false);
  assert.ok(result.unresolvedNodeIds.includes(TEST_NODE_IDS.text));
  assert.ok(result.issues.some((issue) => issue.path === "props.nested.values[0]"));
});

test("collectCreativeNodeIds returns only placeholder-bearing creative nodes", () => {
  assert.deepEqual(new Set(collectCreativeNodeIds(semanticBlueprint())), new Set([TEST_NODE_IDS.heading, TEST_NODE_IDS.text, TEST_NODE_IDS.button, TEST_NODE_IDS.image]));
});

test("missing semantic node patch fails strict coverage", () => {
  const enrichment = completeEnrichment();
  delete enrichment.nodes?.[TEST_NODE_IDS.text];
  assert.throws(() => assertCreativePatchCoverage(semanticBlueprint(), enrichment), /Missing required patch/);
});

test("unknown node ID fails strict coverage", () => {
  const enrichment = completeEnrichment();
  enrichment.nodes!.unknown = { props: { text: "Unknown" } };
  assert.equal(validateCreativePatchCoverage(semanticBlueprint(), enrichment).valid, false);
});

test("a patch retaining a semantic placeholder fails", () => {
  const enrichment = completeEnrichment();
  enrichment.nodes![TEST_NODE_IDS.text].props!.text = "Still {{hero.description}}";
  assert.throws(() => assertCreativePatchCoverage(semanticBlueprint(), enrichment), /still contains semantic placeholders/);
});

test("non-semantic nodes do not require GPT patches", () => {
  const blueprint = semanticBlueprint();
  assert.ok(!collectCreativeNodeIds(blueprint).includes(TEST_NODE_IDS.section));
  assert.equal(validateCreativePatchCoverage(blueprint, completeEnrichment()).valid, true);
});

test("style, hierarchy, type, id, and children patch fields are rejected", () => {
  const enrichment = completeEnrichment() as Enrichment & { nodes: Record<string, Record<string, unknown>> };
  Object.assign(enrichment.nodes[TEST_NODE_IDS.heading], { style: {}, parentId: "x", type: "text", id: "x", children: [] });
  assert.throws(() => assertCreativePatchCoverage(semanticBlueprint(), enrichment), /props only/);
});

test("empty heading, text, and button values fail required-field validation", () => {
  const enrichment = completeEnrichment();
  enrichment.nodes![TEST_NODE_IDS.heading].props!.text = " ";
  enrichment.nodes![TEST_NODE_IDS.button].props!.url = "";
  assert.throws(() => assertCreativePatchCoverage(semanticBlueprint(), enrichment), /non-empty|requires/);
});

test("image src may remain empty but alt and aiImagePrompt are mandatory", () => {
  assert.equal(validateCreativePatchCoverage(semanticBlueprint(), completeEnrichment()).valid, true);
  const incomplete = completeEnrichment();
  incomplete.nodes![TEST_NODE_IDS.image].props!.alt = "";
  assert.equal(validateCreativePatchCoverage(semanticBlueprint(), incomplete).valid, false);
});

test("image placeholder alt fails", () => {
  const incomplete = completeEnrichment();
  incomplete.nodes![TEST_NODE_IDS.image].props!.alt = "View of {{gallery.item_2.alt}}";
  assert.equal(validateCreativePatchCoverage(semanticBlueprint(), incomplete).valid, false);
});

test("valid creative output hydrates all semantic tokens without changing structure or style", () => {
  const before = semanticBlueprint();
  const after = applyCreativeEnrichment(before, completeEnrichment());
  assertSemanticHydrationComplete(after);
  assert.deepEqual(after.nodes[TEST_NODE_IDS.heading].children, before.nodes[TEST_NODE_IDS.heading].children);
  assert.deepEqual(after.nodes[TEST_NODE_IDS.heading].style, before.nodes[TEST_NODE_IDS.heading].style);
  assert.equal(after.nodes[TEST_NODE_IDS.heading].type, before.nodes[TEST_NODE_IDS.heading].type);
});

test("semantic hydration survives JSON serialization round-trip", () => {
  const hydrated = applyCreativeEnrichment(semanticBlueprint(), completeEnrichment());
  assertSemanticHydrationComplete(JSON.parse(JSON.stringify(hydrated)));
});

test("persistence gate performs zero writes for unresolved semantic content", async () => {
  let writes = 0;
  await assert.rejects(() => persistAfterSemanticHydration(semanticBlueprint(), async () => { writes += 1; }), /SEMANTIC_HYDRATION_INCOMPLETE/);
  assert.equal(writes, 0);
});

test("persistence gate permits a fully hydrated blueprint", async () => {
  let writes = 0;
  await persistAfterSemanticHydration(applyCreativeEnrichment(semanticBlueprint(), completeEnrichment()), async () => { writes += 1; });
  assert.equal(writes, 1);
});
