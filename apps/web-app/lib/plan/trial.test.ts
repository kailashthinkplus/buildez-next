import { test } from "node:test";
import assert from "node:assert/strict";

import { computeTrialStatus, assertTrialNotExpired } from "./trial";
import { PlanError } from "../api/errors";

test("a plan without trialDays is never a trial", () => {
  const status = computeTrialStatus({ trialDays: null }, { trialEndsAt: null, startedAt: new Date() });
  assert.equal(status.isTrial, false);
  assert.equal(status.expired, false);
  assert.equal(status.trialEndsAt, null);
});

test("a trial plan within its window is not expired", () => {
  const startedAt = new Date(Date.now() - 5 * 86_400_000); // started 5 days ago
  const status = computeTrialStatus({ trialDays: 30 }, { trialEndsAt: null, startedAt });
  assert.equal(status.isTrial, true);
  assert.equal(status.expired, false);
  assert.ok(status.daysRemaining !== null && status.daysRemaining > 0 && status.daysRemaining <= 25);
});

test("a trial plan past its window is expired", () => {
  const startedAt = new Date(Date.now() - 31 * 86_400_000); // started 31 days ago
  const status = computeTrialStatus({ trialDays: 30 }, { trialEndsAt: null, startedAt });
  assert.equal(status.isTrial, true);
  assert.equal(status.expired, true);
  assert.equal(status.daysRemaining, 0);
});

test("an explicit trialEndsAt takes priority over recomputing from startedAt", () => {
  const startedAt = new Date(Date.now() - 60 * 86_400_000);
  const trialEndsAt = new Date(Date.now() + 86_400_000); // still a day left
  const status = computeTrialStatus({ trialDays: 30 }, { trialEndsAt, startedAt });
  assert.equal(status.expired, false);
});

test("assertTrialNotExpired throws a PlanError only when expired", () => {
  assert.doesNotThrow(() => assertTrialNotExpired({ isTrial: true, trialEndsAt: null, expired: false, daysRemaining: 5 }));
  assert.throws(
    () => assertTrialNotExpired({ isTrial: true, trialEndsAt: null, expired: true, daysRemaining: 0 }),
    PlanError,
  );
});
