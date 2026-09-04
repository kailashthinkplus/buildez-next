import assert from "node:assert/strict";
import test from "node:test";

import {
  BUILDEZ_FAVICON_URL,
  buildSiteMetadata,
} from "./site-metadata";

function iconUrls(metadata: ReturnType<typeof buildSiteMetadata>) {
  const icons = metadata.icons as {
    icon?: Array<{ url: string }>;
    shortcut?: Array<{ url: string }>;
  };
  return {
    icon: icons.icon?.[0]?.url,
    shortcut: icons.shortcut?.[0]?.url,
  };
}

test("published tenant pages use the tenant favicon", () => {
  const tenantFavicon = "https://assets.example.com/tenant-favicon.png";
  const metadata = buildSiteMetadata({
    siteName: "Tenant",
    pageSlug: "home",
    settings: { faviconUrl: tenantFavicon },
    pageMetadata: {},
  });

  assert.deepEqual(iconUrls(metadata), {
    icon: tenantFavicon,
    shortcut: tenantFavicon,
  });
});

test("published pages fall back to BuildEZ only without a tenant favicon", () => {
  const metadata = buildSiteMetadata({
    siteName: "Tenant",
    pageSlug: "home",
    settings: {},
    pageMetadata: {},
  });

  assert.deepEqual(iconUrls(metadata), {
    icon: BUILDEZ_FAVICON_URL,
    shortcut: BUILDEZ_FAVICON_URL,
  });
});
