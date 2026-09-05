/**
 * "trial" is a legacy onboarding artifact, "FREE" is the legacy catalog
 * code, and "FREE_2026" is the current catalog's free/trial plan. All three
 * mean the same thing to the product: no payment required. Centralized here
 * so new codes only need to be added in one place.
 */
const FREE_PLAN_CODES = new Set(["TRIAL", "FREE", "FREE_2026"]);

export function isFreePlanCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return FREE_PLAN_CODES.has(code.toUpperCase());
}
