import { applyRateLimit } from "@/lib/api/rate-limit";
import { getTenantPlan } from "@/lib/plan/getPlan";

const HOUR_SECONDS = 60 * 60;
const DAY_SECONDS = 24 * HOUR_SECONDS;

// Used when a tenant has no active plan/subscription on file.
const DEFAULT_UPLOAD_RATE_LIMIT_PER_HOUR = 15;
const DEFAULT_MAX_DAILY_UPLOADS = 30;

export function uploadRateLimitKey(tenantId: string) {
  return `rl:upload:tenant:${tenantId}`;
}

export function uploadDailyLimitKey(tenantId: string) {
  return `rl:upload-daily:tenant:${tenantId}`;
}

/**
 * Gates an image/media upload against the tenant's plan: a rolling 24-hour
 * cap on total uploads (`Plan.maxDailyUploads`) and a rolling 1-hour rate
 * limit against burst abuse (`Plan.uploadRateLimitPerHour`). Both counters
 * live in the same `RateLimit` bucket table used by `enforceAiRateLimit`,
 * so windows roll over correctly with no separate reset job.
 *
 * Throws `ApiError(429, "RATE_LIMIT_EXCEEDED")` when either limit is hit.
 * Call this before doing any upload work (reading the file, hashing,
 * writing to R2) so a blocked request doesn't pay that cost.
 */
export async function enforceUploadLimit(tenantId: string) {
  const planData = await getTenantPlan(tenantId);
  const plan = planData?.plan;

  const maxDailyUploads = plan?.maxDailyUploads ?? DEFAULT_MAX_DAILY_UPLOADS;
  const rateLimitPerHour =
    plan?.uploadRateLimitPerHour ?? DEFAULT_UPLOAD_RATE_LIMIT_PER_HOUR;

  await applyRateLimit({
    key: uploadDailyLimitKey(tenantId),
    limit: maxDailyUploads,
    windowSeconds: DAY_SECONDS,
  });

  await applyRateLimit({
    key: uploadRateLimitKey(tenantId),
    limit: rateLimitPerHour,
    windowSeconds: HOUR_SECONDS,
  });
}
