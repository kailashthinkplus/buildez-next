import assert from "node:assert/strict";
import test from "node:test";

import { evaluateDomainPropagation } from "./dns-verification";

const check = (resolver: string, routed: boolean, ownership: boolean) => ({
  resolver,
  routed,
  ownership,
  addresses: routed ? ["203.0.113.10"] : [],
});

test("requires routing and ownership on at least two resolvers", () => {
  const result = evaluateDomainPropagation([
    check("Local", true, true),
    check("Cloudflare", true, true),
    check("Google", false, true),
  ]);
  assert.equal(result.ready, true);
  assert.equal(result.readyResolvers, 2);
});

test("does not activate when routing or ownership is incomplete", () => {
  const result = evaluateDomainPropagation([
    check("Local", true, false),
    check("Cloudflare", false, true),
    check("Google", true, true),
  ]);
  assert.equal(result.ready, false);
  assert.equal(result.readyResolvers, 1);
});
