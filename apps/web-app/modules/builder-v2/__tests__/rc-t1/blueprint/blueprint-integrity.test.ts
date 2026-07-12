import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createCycleBlueprint,
  createDuplicateNodeIdBlueprint,
  createInvalidChildRelationshipBlueprint,
  createInvalidMissingRootBlueprint,
  createInvalidParentLinkBlueprint,
  createMissingChildReferenceBlueprint,
  createOrphanNodeBlueprint,
  createPrimitiveBlueprint,
  createResponsiveBlueprint,
  TEST_NODE_IDS,
} from "../../fixtures/testBlueprintFixtures";
import {
  deserializeBlueprint,
  serializeBlueprint,
} from "../../../core/serialization";
import { validateBlueprint } from "../../../core/validation";

function issueCodes(value: unknown): string[] {
  return validateBlueprint(value).issues.map((issue) => issue.code);
}

test("RC-T1 Blueprint accepts the deterministic valid fixture", () => {
  assert.equal(validateBlueprint(createPrimitiveBlueprint()).valid, true);
});

test("RC-T1 Blueprint rejects missing and non-page roots", () => {
  assert.ok(issueCodes(createInvalidMissingRootBlueprint()).includes("missing-root"));
  const invalid = createPrimitiveBlueprint();
  invalid.nodes[invalid.root] = { ...invalid.nodes[invalid.root], type: "section" };
  assert.ok(issueCodes(invalid).includes("root-not-page"));
});

test("RC-T1 Blueprint rejects identity, link, reachability, and cycle defects", () => {
  assert.ok(issueCodes(createDuplicateNodeIdBlueprint()).includes("node-id-mismatch"));
  assert.ok(issueCodes(createInvalidParentLinkBlueprint()).includes("missing-parent"));
  assert.ok(issueCodes(createMissingChildReferenceBlueprint()).includes("missing-child"));
  assert.ok(issueCodes(createOrphanNodeBlueprint()).includes("orphan-node"));
  assert.ok(issueCodes(createCycleBlueprint()).includes("cycle-detected"));
});

test("RC-T1 Blueprint rejects duplicate children and multiple parents", () => {
  const duplicate = createPrimitiveBlueprint();
  duplicate.nodes[TEST_NODE_IDS.columnA].children.push(TEST_NODE_IDS.heading);
  assert.ok(issueCodes(duplicate).includes("duplicate-child-reference"));

  const multiple = createPrimitiveBlueprint();
  multiple.nodes[TEST_NODE_IDS.columnB].children.push(TEST_NODE_IDS.heading);
  assert.ok(issueCodes(multiple).includes("child-has-multiple-parents"));
});

test("RC-T1 Blueprint rejects invalid hierarchy", () => {
  assert.ok(issueCodes(createInvalidChildRelationshipBlueprint()).includes("invalid-child-relationship"));
});

test("RC-T1 Blueprint rejects undefined values in arrays", () => {
  const invalid = createPrimitiveBlueprint();
  invalid.nodes[TEST_NODE_IDS.text].props.items = ["valid", undefined];
  assert.ok(issueCodes(invalid).includes("undefined-value"));
});

test("RC-T1 Blueprint serialization round trip preserves responsive and theme data", () => {
  const blueprint = createResponsiveBlueprint();
  const serialized = serializeBlueprint(blueprint);
  assert.equal(serialized.ok, true);
  if (!serialized.ok) return;
  const restored = deserializeBlueprint(serialized.value);
  assert.equal(restored.ok, true);
  if (!restored.ok) return;
  const serializedAgain = serializeBlueprint(restored.value);
  assert.equal(serializedAgain.ok, true);
  if (!serializedAgain.ok) return;
  assert.equal(serializedAgain.value, serialized.value);
  assert.deepEqual(restored.value.nodes[TEST_NODE_IDS.container].style.width, {
    desktop: "100%", tablet: "92%", mobile: "100%",
  });
  assert.equal(restored.value.theme?.id, "test-theme");
});

test("RC-T1 Blueprint repeated serialization is deterministic", () => {
  const first = serializeBlueprint(createResponsiveBlueprint());
  assert.equal(first.ok, true);
  if (!first.ok) return;
  let value = first.value;
  for (let index = 0; index < 10; index += 1) {
    const restored = deserializeBlueprint(value);
    assert.equal(restored.ok, true);
    if (!restored.ok) return;
    const serialized = serializeBlueprint(restored.value);
    assert.equal(serialized.ok, true);
    if (!serialized.ok) return;
    assert.equal(serialized.value, value);
    value = serialized.value;
  }
});

test("RC-T1 Blueprint deserialization rejects malformed JSON and invalid trees", () => {
  assert.equal(deserializeBlueprint("{not-json").ok, false);
  assert.equal(deserializeBlueprint(JSON.stringify(createInvalidParentLinkBlueprint())).ok, false);
});
