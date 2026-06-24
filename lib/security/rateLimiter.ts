// /apps/web-app/lib/security/rateLimiter.ts

import { prisma } from "@buildez/db";
import { randomUUID } from "crypto";

/* ============================================================
   RATE LIMITER MODEL (PRISMA)
   We do NOT create a new table — we store rate limit entries
   in the existing SystemNotification OR a KV table.
============================================================ */

/**
 * We will use Prisma with the RateLimit KV table.
 * If not present, we auto-create a fallback in memory.
 */

const MEMORY_CACHE: Record<string, { count: number; reset: number }> = {};
const USE_MEMORY_CACHE = process.env.NODE_ENV === "development";

/* ============================================================
   HELPER: GENERATE KEY
============================================================ */
function buildKey(scope: string, identifier: string) {
  return `rl:${scope}:${identifier}`;
}

/* ============================================================
   CORE RATE LIMIT CHECK
============================================================ */
export async function rateLimit({
  scope,
  identifier,
  limit,
  windowSeconds,
}: {
  scope: string;       // "otp", "login", "ai", "domain-check"
  identifier: string;  // email, phone, ip, userId
  limit: number;       // max attempts
  windowSeconds: number;
}): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const key = buildKey(scope, identifier);
  const now = Date.now();

  /* ============================================================
     DEVELOPMENT → use in-memory cache for speed
  ============================================================ */
  if (USE_MEMORY_CACHE) {
    const existing = MEMORY_CACHE[key];

    if (!existing || existing.reset < now) {
      MEMORY_CACHE[key] = {
        count: 1,
        reset: now + windowSeconds * 1000,
      };
      return {
        success: true,
        remaining: limit - 1,
        reset: MEMORY_CACHE[key].reset,
      };
    }

    if (existing.count >= limit) {
      return {
        success: false,
        remaining: 0,
        reset: existing.reset,
      };
    }

    existing.count++;
    return {
      success: true,
      remaining: limit - existing.count,
      reset: existing.reset,
    };
  }

  /* ============================================================
     PRODUCTION → use Prisma KV table
  ============================================================ */

  let record = await prisma.rateLimit.findUnique({
    where: { key },
  });

  // First time — create
  if (!record) {
    const reset = now + windowSeconds * 1000;

    await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt: new Date(reset),
      },
    });

    return {
      success: true,
      remaining: limit - 1,
      reset,
    };
  }

  const resetAt = record.resetAt.getTime();

  // Window expired — reset counter
  if (resetAt < now) {
    const newReset = now + windowSeconds * 1000;

    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        resetAt: new Date(newReset),
      },
    });

    return {
      success: true,
      remaining: limit - 1,
      reset: newReset,
    };
  }

  // Still in same window — block if exceeded
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: resetAt,
    };
  }

  // Increment count
  await prisma.rateLimit.update({
    where: { key },
    data: { count: record.count + 1 },
  });

  return {
    success: true,
    remaining: limit - (record.count + 1),
    reset: resetAt,
  };
}

/* ============================================================
   WRAPPER HELPERS
============================================================ */

export async function limitOTP(emailOrPhone: string) {
  return rateLimit({
    scope: "otp",
    identifier: emailOrPhone,
    limit: 5,
    windowSeconds: 60 * 10, // 10 minutes
  });
}

export async function limitLogin(ip: string) {
  return rateLimit({
    scope: "login",
    identifier: ip,
    limit: 10,
    windowSeconds: 60 * 10,
  });
}

export async function limitAiGeneration(userId: string) {
  return rateLimit({
    scope: "ai",
    identifier: userId,
    limit: 40,
    windowSeconds: 60 * 60, // 1 hour
  });
}

export async function limitDomainCheck(ip: string) {
  return rateLimit({
    scope: "domain-check",
    identifier: ip,
    limit: 30,
    windowSeconds: 60 * 60,
  });
}
