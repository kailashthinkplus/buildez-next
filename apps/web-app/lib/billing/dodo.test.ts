import assert from "node:assert/strict";
import test from "node:test";

import { dodoPlanForProduct, parseDodoCreditPacks, parseDodoProductMap } from "./dodo";

test("normalizes Dodo plan product mappings", () => {
  assert.deepEqual(parseDodoProductMap(JSON.stringify({ "starter:monthly": " pdt_starter " })), {
    "STARTER:MONTHLY": "pdt_starter",
  });
});

test("resolves a configured recurring product without trusting webhook metadata", () => {
  const previous = process.env.DODO_PAYMENTS_PRODUCT_IDS;
  process.env.DODO_PAYMENTS_PRODUCT_IDS = JSON.stringify({ "PRO:YEARLY": "pdt_pro_year" });
  try {
    assert.deepEqual(dodoPlanForProduct("pdt_pro_year"), { planCode: "PRO", billingCycle: "yearly" });
    assert.equal(dodoPlanForProduct("pdt_unknown"), undefined);
  } finally {
    if (previous === undefined) delete process.env.DODO_PAYMENTS_PRODUCT_IDS;
    else process.env.DODO_PAYMENTS_PRODUCT_IDS = previous;
  }
});

test("accepts only valid one-time credit pack configuration", () => {
  const packs = parseDodoCreditPacks(JSON.stringify({
    small: { productId: "pdt_small", credits: 500, price: 499, currency: "inr" },
    invalid: { productId: "", credits: -1, price: 100 },
  }));
  assert.deepEqual(packs, [{
    key: "SMALL",
    name: "500 AI credits",
    credits: 500,
    price: 499,
    currency: "INR",
    productId: "pdt_small",
  }]);
});
