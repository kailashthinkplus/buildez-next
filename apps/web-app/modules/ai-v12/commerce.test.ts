import assert from "node:assert/strict";
import test from "node:test";

import {
  catalogMissingInputs,
  commerceProductIdentity,
  detectCommerceIntent,
  type ExtractedCommerceProduct,
} from "./commerce";

function product(overrides: Partial<ExtractedCommerceProduct> = {}): ExtractedCommerceProduct {
  return {
    title: "Botanical serum",
    description: "",
    vendor: "",
    productType: "Skincare",
    tags: [],
    price: 49,
    hasPrice: true,
    compareAtPrice: 0,
    hasCompareAtPrice: false,
    currency: "USD",
    variantTitle: "Default",
    sku: "",
    inventory: 0,
    hasInventory: false,
    sourceFileName: "store.png",
    imageSegment: 1,
    hasImageRegion: true,
    imageX: 0.1,
    imageY: 0.2,
    imageWidth: 0.3,
    imageHeight: 0.4,
    confidence: 0.95,
    ...overrides,
  };
}

test("detects explicit ecommerce storefront requests", () => {
  const result = detectCommerceIntent("Build an ecommerce skincare website with product pages, cart and checkout");
  assert.equal(result.isEcommerce, true);
  assert.ok(result.confidence >= 0.5);
});

test("detects ordinary retail language without requiring the ecommerce keyword", () => {
  assert.equal(
    detectCommerceIntent("Create a premium fashion store for my new brand").isEcommerce,
    true,
  );
});

test("does not confuse a SaaS product landing page with a retail store", () => {
  const result = detectCommerceIntent("Create a SaaS product landing page for our software platform");
  assert.equal(result.isEcommerce, false);
});

test("catalog readiness requires truth-backed prices while missing media can be generated", () => {
  assert.deepEqual(catalogMissingInputs([product()]), []);
  assert.deepEqual(catalogMissingInputs([product({ hasPrice: false })]), ["prices and currency"]);
  assert.deepEqual(catalogMissingInputs([product({ hasImageRegion: false })]), []);
});

test("an absent catalogue requests photos, names and prices", () => {
  assert.deepEqual(
    catalogMissingInputs([]),
    ["product photos", "product names", "prices and currency"],
  );
});

test("catalogue retries resolve to the same ShopEZ product identity", () => {
  assert.equal(
    commerceProductIdentity("  A2 Face Serum  "),
    commerceProductIdentity("A2 face serum"),
  );
});

test("does not classify an editorial perfume launch with a Shop page as full ecommerce", () => {
  const result = detectCommerceIntent(`
    Design an immersive 3D website for Aurelia — a boutique perfume house
    launching a new fragrance. Include a homepage, The Fragrance story page,
    and a Shop page. Show the full product line with cinematic 3D presentation.
  `);

  assert.equal(result.isEcommerce, false);
});

test("does not classify boutique brand language alone as ecommerce", () => {
  assert.equal(
    detectCommerceIntent(
      "Design a premium website for a boutique perfume house with product storytelling"
    ).isEcommerce,
    false,
  );
});

test("a Shop page alone does not enable ShopEZ", () => {
  assert.equal(
    detectCommerceIntent(
      "Create a luxury brand website with Home, Our Story and Shop pages"
    ).isEcommerce,
    false,
  );
});

test("explicit transactional ecommerce still enables ShopEZ", () => {
  assert.equal(
    detectCommerceIntent(
      "Build an online perfume store with product catalogue, add to cart and checkout"
    ).isEcommerce,
    true,
  );
});
