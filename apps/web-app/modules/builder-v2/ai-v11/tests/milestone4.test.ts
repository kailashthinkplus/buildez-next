import assert from "node:assert/strict";
import test from "node:test";
import { validateBlueprint } from "../../core/validation";
import { collectRenderCustomCss } from "../../core/rendering/renderCustomCss";
import { parseTsx } from "../ast/parser";
import { normalizeTsx } from "../ast/normalize";
import { buildDesignGraph } from "../design-graph/builder";
import { compileDesignGraphToBlueprint } from "../compiler/blueprintCompiler";
import {
  V11_ENGINEERING_FIXTURE_IDS,
  buildV11VisualFixture,
} from "../benchmarks/visual/visualFixture";
import { certifyVisualLevels } from "../benchmarks/scoring/certificationLevels";
import {
  scoreVisualFidelity,
  type VisualEvidence,
} from "../benchmarks/scoring/visualFidelity";
import {
  compareRegion,
  overlapDistance,
  type RectEvidence,
} from "../benchmarks/scoring/geometry";
import {
  classifyLoss,
  rankRecurringLosses,
} from "../benchmarks/losses/classifier";
import { NEGATIVE_SOURCE_CORPUS } from "../security/negativeCorpus";
import { assessUntrustedSource } from "../security/sourceGate";
import { certifyBlueprintCustomCss } from "../security/cssCertification";
import {
  measureFixturePipeline,
  OFFLINE_BUDGETS,
} from "../benchmarks/performance/measurePipeline";
const evidence: VisualEvidence = {
  pixelDifferenceRatio: 0.1,
  sectionOrderCorrect: true,
  headingDelta: 0.1,
  ctaDelta: 0.1,
  heroMediaDelta: 0.1,
  floatingCardDelta: 0.1,
  editorialImageDelta: 0.1,
  headingFontSizeDelta: 0.01,
  gridCompositionCorrect: true,
  overlapCorrect: true,
  responsiveStackingCorrect: true,
  backgroundPresent: true,
  imageCropCorrect: true,
  residualEffectsPresent: true,
  contentComplete: true,
  editable: true,
  canvasRuntimeParity: true,
  horizontalOverflow: false,
  productionRendererUsed: true,
  compilerOutputUsed: true,
  heroMediaRolePresent: true,
};
test("M4 discovers exactly eight committed allowlisted fixtures", () =>
  assert.equal(V11_ENGINEERING_FIXTURE_IDS.length, 8));
test("M4 compiles, validates, and round-trips all eight fixtures", () => {
  for (const id of V11_ENGINEERING_FIXTURE_IDS) {
    const fixture = buildV11VisualFixture(id);
    assert.equal(fixture.id, id);
    assert.ok(Object.keys(fixture.blueprint.nodes).length > 8);
  }
});
test("three certification levels are non-compensating", () => {
  const report = scoreVisualFidelity(evidence);
  const levels = certifyVisualLevels(report);
  assert.equal(levels.architectureProof, true);
  const weak = {
    ...report,
    categories: { ...report.categories, geometry: 74 },
  };
  const gated = certifyVisualLevels(weak);
  assert.equal(gated.architectureProof, true);
  assert.equal(gated.acceptableFidelity, false);
  assert.equal(gated.productionGradeFidelity, false);
  assert.equal(gated.controllingCategory, "geometry");
});
test("geometry is parent and viewport normalized and measures wrapping and overlap", () => {
  const a: RectEvidence = {
    x: 30,
    y: 20,
    width: 300,
    height: 120,
    parentX: 0,
    parentY: 0,
    parentWidth: 390,
    parentHeight: 600,
    lineCount: 3,
    fontSize: 48,
    lineHeight: 50,
    borderRadius: 24,
  };
  const b = { ...a, x: 60, lineCount: 4 };
  const delta = compareRegion(a, b, 390);
  assert.ok(delta.x > 0.07);
  assert.equal(delta.lineCount, 0.25);
  assert.equal(overlapDistance(a, { ...a, height: 600 }), 600);
});
test("material losses retain provenance and are ranked", () => {
  const provenance = {
    sourceFile: "fixture.tsx",
    line: 2,
    column: 3,
    sourceElement: "h1",
  };
  const loss = classifyLoss({
    fixture: "x",
    viewport: "tablet",
    region: "hero-heading",
    observedLoss: "wrap",
    sourceProperty: "md:max-w-4xl",
    emittedProperty: "maxWidth",
    recommendedFix: "preserve responsive max width",
    provenance,
    diagnosticCode: "RESPONSIVE_RESET_UNRESOLVED",
  });
  assert.equal(loss.stage, "responsive inheritance/reset loss");
  assert.deepEqual(loss.provenance, provenance);
  assert.equal(rankRecurringLosses([loss, loss])[0].count, 2);
});
test("security negative corpus fails closed and is never renderable", () => {
  for (const [name, source] of NEGATIVE_SOURCE_CORPUS) {
    const result = assessUntrustedSource(source, `${name}.tsx`);
    assert.equal(result.safe, false, name);
    assert.equal(result.renderable, false, name);
    assert.ok(result.findings.every((f) => f.line > 0 && f.column > 0));
  }
});
test("CSS security certification removes executable and network-loading CSS while preserving safe declarations", () => {
  const source = `export default function Page(){return <section><article className="card">Safe card</article><style>{\`
    @import url("https://example.com/import.css");
    .card {
      --glass-blur: 20px;
      backdrop-filter: blur(var(--glass-blur));
      mask-image: url('/assets/local-mask.svg');
      behavior: url(test.htc);
      background: expression(alert(1));
      background-image: url("https://example.com/tracker.png");
      background-image: url("javascript:alert(1)");
    }
  \`}</style></section>}`;
  const graph = buildDesignGraph(normalizeTsx(parseTsx(source, "css-security.tsx")));
  const compilation = compileDesignGraphToBlueprint(graph);
  const card = Object.values(compilation.blueprint.nodes).find(
    (node) => String((node.props.advanced as any)?.customCss).includes("backdrop-filter"),
  );
  const customCss = String((card?.props.advanced as any)?.customCss ?? "");
  const renderedCss = collectRenderCustomCss(compilation.blueprint);
  const serializedCustomCss = Object.values(compilation.blueprint.nodes)
    .map((node) => String((node.props.advanced as any)?.customCss ?? ""))
    .join("\n");

  assert.match(customCss, /--glass-blur:\s*20px/);
  assert.match(customCss, /backdrop-filter:\s*blur\(var\(--glass-blur\)\)/);
  assert.match(customCss, /mask-image:\s*url\(['"]?\/assets\/local-mask\.svg/);
  assert.doesNotMatch(serializedCustomCss, /behavior\s*:|expression\s*\(|@import|https?:\/\/|javascript\s*:/i);
  assert.deepEqual(certifyBlueprintCustomCss(compilation.blueprint), []);
  assert.ok(compilation.diagnostics.some((item) => item.code === "UNSAFE_CSS_PROPERTY"));
  assert.ok(compilation.diagnostics.some((item) => item.code === "UNSAFE_CSS_VALUE"));
  assert.ok(compilation.diagnostics.some((item) => item.code === "UNSAFE_CSS_AT_RULE"));
  assert.equal(validateBlueprint(compilation.blueprint).valid, true);
  assert.match(renderedCss, /backdrop-filter/);
  assert.doesNotMatch(renderedCss, /behavior\s*:|expression\s*\(|@import|https?:\/\/|javascript\s*:/i);
});
test("offline pipeline performance is measured against provisional budgets", () => {
  for (const id of V11_ENGINEERING_FIXTURE_IDS) {
    const fixture = buildV11VisualFixture(id);
    const result = measureFixturePipeline(fixture.sourceFile);
    assert.ok(result.parseMs < OFFLINE_BUDGETS.parseMs);
    assert.ok(result.interpretMs < OFFLINE_BUDGETS.interpretMs);
    assert.ok(result.nodeCount < OFFLINE_BUDGETS.nodeCount);
  }
});
