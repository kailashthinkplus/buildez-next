import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Provenance = {
  persistenceExact: boolean;
  records: Array<{
    widgetType: string;
    firstBadStage: string;
    missingRequiredPropPaths: string[];
    emptyMediaSlots: string[];
    valuesEqualToDefaults: string[];
    evidence: string[];
  }>;
};

function provenance(): Provenance {
  return JSON.parse(readFileSync(join(
    process.cwd(),
    "test-results/ai-v10-forensic/sanjeevini-group-seed-104729/widget-population-provenance.json",
  ), "utf8")) as Provenance;
}

describe("RC-3.5A widget population forensic evidence", () => {
  it("traces every selected native widget and preserves persistence evidence", () => {
    const audit = provenance();
    assert.deepEqual(audit.records.map((record) => record.widgetType).sort(), [
      "carousel", "cta", "faq", "floatingWhatsApp", "galleryLightbox", "hero",
      "leadForm", "logoCloud", "smartFooter", "timeline",
    ]);
    assert.equal(audit.persistenceExact, true);
    assert.equal(audit.records.every((record) => record.evidence.includes("persistence exact=true")), true);
  });

  it("records the first observed failure boundary instead of asserting visual success", () => {
    const byType = Object.fromEntries(provenance().records.map((record) => [record.widgetType, record]));
    assert.equal(byType.hero.firstBadStage, "renderer-prop-shape-mismatch");
    assert.equal(byType.carousel.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.galleryLightbox.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.faq.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.leadForm.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.timeline.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.smartFooter.firstBadStage, "incomplete-compiler-props");
    assert.equal(byType.logoCloud.firstBadStage, "wrong-capability-selected");
    assert.equal(byType.floatingWhatsApp.firstBadStage, "unsafe-required-data-missing");
    assert.equal(byType.cta.firstBadStage, "no-failure");
  });

  it("distinguishes renderer/demo fallbacks from defaultNode prop leakage", () => {
    const byType = Object.fromEntries(provenance().records.map((record) => [record.widgetType, record]));
    assert.deepEqual(byType.carousel.valuesEqualToDefaults, []);
    assert.ok(byType.carousel.emptyMediaSlots.includes("slides[].media"));
    assert.ok(byType.galleryLightbox.emptyMediaSlots.includes("items[].src"));
    assert.ok(byType.leadForm.missingRequiredPropPaths.includes("fields[].name"));
  });
});
