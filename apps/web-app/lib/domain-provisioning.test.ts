import assert from "node:assert/strict";
import test from "node:test";

import { validDomain } from "./domain-provisioning";

test("accepts normal apex and subdomain hostnames", () => {
  assert.equal(validDomain("example.com"), true);
  assert.equal(validDomain("www.shop.example.co.in"), true);
});

test("rejects URLs, wildcard names, invalid labels, and oversized labels", () => {
  assert.equal(validDomain("https://example.com"), false);
  assert.equal(validDomain("*.example.com"), false);
  assert.equal(validDomain("-shop.example.com"), false);
  assert.equal(validDomain(`${"a".repeat(64)}.example.com`), false);
});
