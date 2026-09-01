import assert from "node:assert/strict";
import test from "node:test";

import { publishedSitePath } from "../../lib/runtime/published-site-path";
import { isInsightUrlOwnedBySite } from "./server";

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

test("Insights accepts only URLs belonging to the selected site", () => {
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/appwire/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.example/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.buildez.site/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/site-other" }), false);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://other-tenant.example" }), false);
});
