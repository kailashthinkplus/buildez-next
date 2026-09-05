import { test } from "node:test";
import assert from "node:assert/strict";

import { isFreePlanCode } from "./freePlanCode";

test("recognizes every known free/trial spelling", () => {
  assert.equal(isFreePlanCode("trial"), true);
  assert.equal(isFreePlanCode("FREE"), true);
  assert.equal(isFreePlanCode("free"), true);
  assert.equal(isFreePlanCode("FREE_2026"), true);
  assert.equal(isFreePlanCode("free_2026"), true);
});

test("rejects paid plan codes and empty input", () => {
  assert.equal(isFreePlanCode("STARTER_2026"), false);
  assert.equal(isFreePlanCode("PRO"), false);
  assert.equal(isFreePlanCode(null), false);
  assert.equal(isFreePlanCode(undefined), false);
  assert.equal(isFreePlanCode(""), false);
});
