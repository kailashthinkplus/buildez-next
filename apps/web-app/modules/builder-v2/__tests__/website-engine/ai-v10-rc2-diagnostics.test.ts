import assert from "node:assert/strict";
import test from "node:test";
import { classifyOverflow, duplicateFingerprint, semanticPurposeClass } from "../../ai-v10/forensics/rc2Diagnostics";

test("semantic duplicate fingerprints use purpose and anatomy rather than role alone", () => {
  const a = duplicateFingerprint({ purpose: "trust proof", componentCategory: "proof", archetype: "floatingProofSection", sourcePattern: "footer trust closure" });
  const b = duplicateFingerprint({ purpose: "trust building", componentCategory: "proof", archetype: "floatingProofSection", sourcePattern: "trust band" });
  const c = duplicateFingerprint({ purpose: "property gallery", componentCategory: "gallery", archetype: "galleryJourney", sourcePattern: "lifestyle gallery" });
  assert.equal(semanticPurposeClass("footer trust closure"), "proof-trust");
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("overflow classifier groups rounding, intentional media and narrow-track symptoms", () => {
  assert.equal(classifyOverflow({ id: "heading.metric_1", width: 97, height: 160, scrollWidth: 182, scrollHeight: 162 }), "narrow-track-text-wrapping");
  assert.equal(classifyOverflow({ id: "heading.hero", width: 500, height: 100, scrollWidth: 500, scrollHeight: 102 }), "measurement-rounding");
  assert.equal(classifyOverflow({ id: "container.rail", width: 400, height: 200, scrollWidth: 900, scrollHeight: 200, overflowX: "auto" }), "intentional-media-overflow");
});
