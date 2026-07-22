import assert from "node:assert/strict";
import test from "node:test";

import { findSemanticPlaceholders } from "../../ai-v10/creative/semanticHydrationValidation";
import { GOLDEN_WEBSITE_CASES, buildGoldenWebsitePreview } from "../../website-engine/golden-websites";
import { evaluateVisualQuality } from "../../website-engine/visual-quality";

test("all 52 golden fixtures receive stable visual quality scores", () => {
  assert.equal(GOLDEN_WEBSITE_CASES.length, 52);
  for (const fixture of GOLDEN_WEBSITE_CASES) {
    const first = buildGoldenWebsitePreview(fixture.id);
    const second = buildGoldenWebsitePreview(fixture.id);
    assert.ok(first, fixture.id);
    assert.ok(second, fixture.id);
    assert.deepEqual(first.visualQuality, second.visualQuality, fixture.id);
    assert.ok(first.visualQuality.overall >= 70, `${fixture.id}: ${JSON.stringify(first.visualQuality)}`);
    for (const dimension of ["layout", "typography", "hierarchy", "imagery", "responsive"] as const) assert.ok(first.visualQuality[dimension] >= 0 && first.visualQuality[dimension] <= 100, `${fixture.id}:${dimension}`);
  }
});

test("golden preview uses a complete hydrated native Blueprint", () => {
  for (const fixture of GOLDEN_WEBSITE_CASES) {
    const preview = buildGoldenWebsitePreview(fixture.id)!;
    assert.equal(preview.renderStatus, "ready", fixture.id);
    assert.ok(preview.blueprint.nodes[preview.blueprint.root], fixture.id);
    assert.equal(findSemanticPlaceholders(preview.blueprint).length, 0, fixture.id);
    assert.equal(Object.values(preview.blueprint.nodes).some((node) => node.type === "image" && !String(node.props.src ?? "").startsWith("data:image/svg+xml,")), false, fixture.id);
  }
});

test("visual evaluator detects overflow and hierarchy regressions deterministically", () => {
  const preview = buildGoldenWebsitePreview("luxury-residential-developer")!;
  const page = preview.blueprint.nodes[preview.blueprint.root];
  const broken = {
    ...preview.blueprint,
    nodes: Object.fromEntries(Object.entries(preview.blueprint.nodes).map(([id, node]) => [id, {
      ...node,
      ...(id === page.id ? { style: { ...node.style, minWidth: "900px", overflowX: "scroll" } } : {}),
      ...(node.type === "heading" ? { props: { ...node.props, level: "h3" } } : {}),
    }])),
  };
  const first = evaluateVisualQuality({ blueprint: broken, selectedComponents: preview.selectedComponents });
  const second = evaluateVisualQuality({ blueprint: broken, selectedComponents: preview.selectedComponents });
  assert.deepEqual(first, second);
  assert.ok(first.layout < preview.visualQuality.layout);
  assert.ok(first.typography < preview.visualQuality.typography);
  assert.ok(first.warnings.some((warning) => warning.code === "overflow-risk"));
  assert.ok(first.warnings.some((warning) => warning.code === "heading-h1-count"));
});

test("unknown reference metadata never blocks preview generation", () => {
  assert.equal(buildGoldenWebsitePreview("does-not-exist"), undefined);
  const preview = buildGoldenWebsitePreview("automotive-service-center");
  assert.ok(preview);
  assert.equal(preview.reference, undefined);
});
