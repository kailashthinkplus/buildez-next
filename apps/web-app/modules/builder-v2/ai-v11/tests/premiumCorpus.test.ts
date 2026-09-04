import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ENGINEERING_REGRESSION_FIXTURES } from "../benchmarks/fixtures/engineering-regression/manifest";
import {
  PREMIUM_FIXTURES,
  isApprovedGoldStandard,
} from "../benchmarks/premium/registry";
import { PREMIUM_CATEGORIES } from "../benchmarks/premium/schema";
import {
  diagnoseGenericDesign,
  scoreSourceDesignQuality,
  PREMIUM_QUALITY_CATEGORIES,
} from "../benchmarks/premium/quality";
import { assessUntrustedSource } from "../security/sourceGate";
import {
  buildV11VisualFixture,
  V11_PREMIUM_FIXTURE_IDS,
} from "../benchmarks/visual/visualFixture";
test("engineering and premium fixtures remain separately classified", () => {
  assert.ok(
    ENGINEERING_REGRESSION_FIXTURES.every(
      (f) => f.classification === "engineering-regression",
    ),
  );
  assert.equal(new Set(PREMIUM_FIXTURES.map((f) => f.fixtureId)).size, 10);
});
test("ten premium categories and composition grammars are distinct", () => {
  assert.deepEqual(
    new Set(PREMIUM_FIXTURES.map((f) => f.category)),
    new Set(PREMIUM_CATEGORIES),
  );
  assert.equal(new Set(PREMIUM_FIXTURES.map((f) => f.designGrammar)).size, 10);
});
test("manual approval metadata is required and candidates are never auto-approved", () => {
  assert.equal(PREMIUM_FIXTURES.filter(isApprovedGoldStandard).length, 0);
  for (const f of PREMIUM_FIXTURES) {
    assert.equal(f.approval.state, "authored-candidate");
    assert.equal(f.approval.approvedBy, null);
  }
});
test("low quality cannot qualify as gold standard", () => {
  const categories = Object.fromEntries(
    PREMIUM_QUALITY_CATEGORIES.map((k) => [k, 74]),
  ) as any;
  const score = scoreSourceDesignQuality(categories, []);
  assert.equal(score.endUserAcceptable, false);
  assert.equal(score.premiumLaunchQuality, false);
});
test("generic pattern diagnostics are source-quality only", () => {
  assert.ok(
    diagnoseGenericDesign(
      `<section><div className="grid grid-cols-1 md:grid-cols-2">${"<article/>".repeat(4)}</div></section>`,
    ).includes("GENERIC_REPEATED_CARD_PATTERN"),
  );
  assert.ok(
    diagnoseGenericDesign(
      `<section><div className="grid grid-cols-1 md:grid-cols-2"><h1/></div></section>`,
    ).includes("GENERIC_SPLIT_HERO"),
  );
});
test("premium sources are local, static, parseable, and never executed", () => {
  for (const f of PREMIUM_FIXTURES) {
    assert.ok(f.asset.startsWith("/v11-premium/") && !f.asset.includes("http"));
    const source = readFileSync(
      resolve(
        process.cwd(),
        "modules/builder-v2/ai-v11/fixtures",
        f.sourceFile,
      ),
      "utf8",
    );
    assert.equal(assessUntrustedSource(source, f.sourceFile).safe, true);
    assert.ok((source.match(/<section\b/g) ?? []).length >= 3);
  }
});
test("all premium candidates compile through validation and serialization for preview", () => {
  assert.equal(V11_PREMIUM_FIXTURE_IDS.length, 10);
  for (const id of V11_PREMIUM_FIXTURE_IDS) {
    const fixture = buildV11VisualFixture(id);
    assert.equal(fixture.classification, "premium-candidate");
    assert.ok(Object.keys(fixture.blueprint.nodes).length > 0);
  }
});
