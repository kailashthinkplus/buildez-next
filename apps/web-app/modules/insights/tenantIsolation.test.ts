import assert from "node:assert/strict";
import test from "node:test";

import { publishedSitePath } from "../../lib/runtime/published-site-path";
import { auditRelevantSettings, isInsightUrlOwnedBySite } from "./server";

const common = {
  requestOrigin: "https://app.buildez.site",
  siteId: "site_correct",
  siteSlug: "appwire",
  verifiedDomains: ["appwire.example"],
  platformDomain: "buildez.site",
};

test("published links use readable website and page slugs", () => {
  assert.equal(publishedSitePath("appwire"), "/appwire");
  assert.equal(
    publishedSitePath("appwire", "about/team"),
    "/appwire/about/team",
  );
});

test("the Score/SEO cache fingerprint ignores settings from unrelated agents (e.g. Chatbot)", () => {
  const scoped = auditRelevantSettings({
    seoTitle: "Northstar Studio",
    seoDescription: "A design studio",
    googleAnalyticsId: "G-123",
    aiChannels: { websiteChatbot: { welcomeMessage: "Hi there!" }, whatsapp: { phoneNumber: "+1555" } },
    billing: { plan: "PRO" },
    theme: { primaryColor: "#000" },
  });
  assert.deepEqual(scoped, {
    seoTitle: "Northstar Studio",
    seoDescription: "A design studio",
    googleAnalyticsId: "G-123",
  });
  assert.ok(!("aiChannels" in scoped), "Chatbot/WhatsApp config must never affect the audit fingerprint");
  assert.ok(!("billing" in scoped));
  assert.ok(!("theme" in scoped));
});

test("Insights accepts only URLs belonging to the selected site", () => {
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/appwire/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.example/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.buildez.site/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/site-other" }), false);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://other-tenant.example" }), false);
});
