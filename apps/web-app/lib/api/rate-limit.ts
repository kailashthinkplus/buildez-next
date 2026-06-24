// /apps/web-app/lib/api/rate-limit.ts

import { prisma } from "@buildez/db";
import { ApiError } from "./errors";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
  key: string;
}

/* ============================================================
   APPLY RATE LIMIT
============================================================ */
export async function applyRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitConfig) {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({
    where: { key },
  });

  // if missing, create fresh bucket
  if (!existing) {
    await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });
    return true; // allowed
  }

  // if expired → reset bucket
  if (existing.resetAt < now) {
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });
    return true;
  }

  // Too many requests
  if (existing.count >= limit) {
    throw new ApiError(
      429,
      "RATE_LIMIT_EXCEEDED",
      `Too many requests. Try again after ${Math.ceil(
        (existing.resetAt.getTime() - now.getTime()) / 1000
      )} seconds.`
    );
  }

  // Increment within window
  await prisma.rateLimit.update({
    where: { key },
    data: { count: existing.count + 1 },
  });

  return true;
}

/* ============================================================
   HELPER — Build a per-IP key
============================================================ */
export async function rateLimitIp(req: Request, config: Omit<RateLimitConfig, "key">) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return applyRateLimit({
    ...config,
    key: `rl:ip:${ip}`,
  });
}

/* ============================================================
   HELPER — Build a per-User key
============================================================ */
export function rateLimitUser(userId: string, config: Omit<RateLimitConfig, "key">) {
  return applyRateLimit({
    ...config,
    key: `rl:user:${userId}`,
  });
}

/* ============================================================
   HELPER — Per-route rate limit
============================================================ */
export function rateLimitRoute(route: string, config: Omit<RateLimitConfig, "key">) {
  return applyRateLimit({
    ...config,
    key: `rl:route:${route}`,
  });
}
