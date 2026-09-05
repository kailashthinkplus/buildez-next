import { PlanError } from "../api/errors";

/**
 * A plan with `trialDays` set (currently only FREE_2026) grants full access
 * for that many days from Subscription.startedAt. Legacy plans have
 * `trialDays: null` and are never subject to this — grandfathered tenants
 * keep behaving exactly as before.
 */
export type TrialStatus = {
  isTrial: boolean;
  trialEndsAt: Date | null;
  expired: boolean;
  daysRemaining: number | null;
};

export function computeTrialStatus(
  plan: { trialDays: number | null } | null | undefined,
  subscription: { trialEndsAt: Date | null; startedAt: Date | null } | null | undefined,
): TrialStatus {
  const trialDays = plan?.trialDays ?? null;
  if (!trialDays) {
    return { isTrial: false, trialEndsAt: null, expired: false, daysRemaining: null };
  }

  const trialEndsAt =
    subscription?.trialEndsAt ??
    (subscription?.startedAt ? new Date(subscription.startedAt.getTime() + trialDays * 86_400_000) : null);

  if (!trialEndsAt) {
    return { isTrial: true, trialEndsAt: null, expired: false, daysRemaining: trialDays };
  }

  const msRemaining = trialEndsAt.getTime() - Date.now();
  return {
    isTrial: true,
    trialEndsAt,
    expired: msRemaining <= 0,
    daysRemaining: Math.max(0, Math.ceil(msRemaining / 86_400_000)),
  };
}

export function assertTrialNotExpired(trial: TrialStatus) {
  if (trial.expired) {
    throw new PlanError("Your 30-day trial has ended. Upgrade to a paid plan to keep using BuildEZ.");
  }
}
