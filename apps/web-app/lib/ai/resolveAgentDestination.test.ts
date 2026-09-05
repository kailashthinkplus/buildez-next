import { test } from "node:test";
import assert from "node:assert/strict";

import { resolveAgentDestination } from "./resolveAgentDestination";

test("routes clearly domain-specific requests to their specialist agent", () => {
  assert.equal(resolveAgentDestination("Fix my SEO — the meta description is missing on the homepage"), "seo-agent");
  assert.equal(resolveAgentDestination("My site's Core Web Vitals score is terrible, why is it so slow?"), "speed-agent");
  assert.equal(resolveAgentDestination("Add alt text everywhere for accessibility, we failed a WCAG audit"), "accessibility-agent");
  assert.equal(resolveAgentDestination("Set up WhatsApp automation for customer replies"), "whatsapp-agent");
  assert.equal(resolveAgentDestination("Our checkout funnel has a high abandoned cart rate"), "conversion-agent");
});

test("falls back to null (general website builder) for ordinary build/edit requests", () => {
  assert.equal(resolveAgentDestination("Add a pricing section to the homepage"), null);
  assert.equal(resolveAgentDestination("Make the hero image bigger and change the button color to blue"), null);
  assert.equal(resolveAgentDestination(""), null);
  assert.equal(resolveAgentDestination("   "), null);
});
