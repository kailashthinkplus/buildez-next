import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AiV10ForensicTrace, buildRenderedStyleContract, diffBlueprintStages } from "../../ai-v10/forensics";
import { createPrimitiveBlueprint } from "../fixtures/testBlueprintFixtures";

test("forensic trace is opt-in and writes immutable stage artifacts", () => {
  const previous = process.env.AI_V10_FORENSIC_TRACE;
  process.env.AI_V10_FORENSIC_TRACE = "1";
  try {
    const root = mkdtempSync(join(tmpdir(), "ai-v10-forensic-"));
    const trace = new AiV10ForensicTrace("fixed-seed", root);
    const blueprint = createPrimitiveBlueprint();
    trace.snapshot("14-blueprint-before-enrichment.json", blueprint);
    trace.snapshot("18-final-blueprint.json", blueprint);
    trace.finalize(blueprint);
    assert.match(readFileSync(join(root, "fixed-seed", "trace-summary.md"), "utf8"), /Blueprint stages: 2/);
    assert.throws(() => trace.snapshot("18-final-blueprint.json", blueprint), /EEXIST/);
  } finally {
    if (previous === undefined) delete process.env.AI_V10_FORENSIC_TRACE; else process.env.AI_V10_FORENSIC_TRACE = previous;
  }
});

test("Blueprint stage diff exposes structural, style, responsive and invalid mutations", () => {
  const before = createPrimitiveBlueprint();
  const id = Object.keys(before.nodes).find((nodeId) => before.nodes[nodeId].type === "heading")!;
  const after = structuredClone(before);
  after.nodes[id].parentId = after.root;
  after.nodes[id].style.width = { desktop: Number.NaN, mobile: 20 };
  const diff = diffBlueprintStages("before", before, "after", after);
  assert.ok(diff.reparentedNodes.some((item) => item.id === id));
  assert.ok(diff.changedResponsiveValues.some((item) => item.id === id && item.path === "style.width"));
  assert.ok(diff.invalidValuesIntroduced.some((item) => item.id === id));
});

test("geometry contract records raw and breakpoint-resolved styles and flags malformed desktop widths", () => {
  const blueprint = structuredClone(createPrimitiveBlueprint());
  const id = Object.keys(blueprint.nodes).find((nodeId) => blueprint.nodes[nodeId].type === "heading")!;
  blueprint.nodes[id].style.width = { desktop: 120, mobile: 80 };
  const contract = buildRenderedStyleContract(blueprint);
  const node = contract.nodes.find((item) => item.id === id)!;
  assert.deepEqual(node.raw.width, { desktop: 120, mobile: 80 });
  assert.equal(node.resolved.desktop.width, "120px");
  assert.ok(contract.anomalies.some((item) => item.code === "NARROW_DESKTOP_HEADING" && item.nodeId === id));
});

test("geometry contract proves renderers preserve the canonical grid display", () => {
  const blueprint = structuredClone(createPrimitiveBlueprint());
  const id = Object.keys(blueprint.nodes).find((nodeId) => blueprint.nodes[nodeId].type === "container")!;
  blueprint.nodes[id].style.display = "grid";
  delete blueprint.nodes[id].props.layout;
  const contract = buildRenderedStyleContract(blueprint);
  const node = contract.nodes.find((item) => item.id === id)!;
  assert.equal(node.resolved.desktop.display, "grid");
  assert.equal(node.rendererResolved.desktop.display, "grid");
  assert.ok(!contract.anomalies.some((item) => item.code === "RENDERER_DISPLAY_OVERRIDE" && item.nodeId === id));
});
