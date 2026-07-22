import assert from "node:assert/strict";
import test from "node:test";
import { prepareV11Direction } from "../preflight/prepareV11Direction";

test("V11 direction choices come from current site context instead of industry presets", () => {
  const direction = prepareV11Direction({
    prompt: "Create the homepage",
    context: { companyName: "Sanjeevini Clinic", industry: "Dental care", audience: "Families", offer: "Book an appointment" },
  });
  assert.equal(direction.questions.length, 3);
  assert.match(direction.summary, /Sanjeevini Clinic/);
  assert.match(direction.questions[0].options.map((item) => item.label).join(" "), /Appointment-first care|Services made simple|Doctor and clinic trust/);
  assert.match(direction.questions[1].options.map((item) => item.label).join(" "), /Research the real business/);
  assert.doesNotMatch(JSON.stringify(direction), /site visit|shortlist properties|developer trust/i);
});

test("V11 gives an uploaded reference its own interpretation choices", () => {
  const direction = prepareV11Direction({ prompt: "Recreate this", context: { companyName: "New Brand", referenceAnalysis: "Dark editorial layout with a compact header." } });
  assert.match(direction.questions[2].options.map((item) => item.label).join(" "), /Pixel-close reconstruction|Same layout, new brand|New design from its ideas/i);
});

test("V11 derives useful storefront directions from an ecommerce reference and ignores placeholder site names", () => {
  const direction = prepareV11Direction({
    prompt: "Recreate the uploaded design",
    context: { websiteName: "my webpage", referenceAnalysis: "Skincare ecommerce storefront with product grids, categories, best sellers, journal and newsletter." },
  });
  const serialized = JSON.stringify(direction);
  assert.match(direction.questions[0].label, /storefront journey/i);
  assert.match(direction.questions[0].options.map((item) => item.label).join(" "), /Discovery-led catalog|Bestseller conversion|Brand story with shopping/);
  assert.match(direction.questions[2].options.map((item) => item.label).join(" "), /Pixel-close reconstruction/);
  assert.doesNotMatch(serialized, /the primary offer|intended audience|my webpage|right choice/i);
});
