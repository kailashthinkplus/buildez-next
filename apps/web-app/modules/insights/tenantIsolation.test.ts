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

test("published links always contain the exact site id", () => {
  assert.equal(publishedSitePath("site_correct"), "/published-preview/site_correct");
  assert.equal(
    publishedSitePath("site_correct", "about/team"),
    "/published-preview/site_correct/about/team",
  );
});

test("Insights accepts only URLs belonging to the selected site", () => {
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/published-preview/site_correct/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.example/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://appwire.buildez.site/about" }), true);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/published-preview/site_other" }), false);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://app.buildez.site/appwire" }), false);
  assert.equal(isInsightUrlOwnedBySite({ ...common, url: "https://other-tenant.example" }), false);
});
