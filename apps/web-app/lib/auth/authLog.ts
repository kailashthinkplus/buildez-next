// /Users/kailash/buildez/apps/web-app/lib/auth/authLog.ts

import { prisma } from "@buildez/db";
import { AuthProvider } from "@prisma/client";

/**
 * Write authentication event to AuthLog table
 * Supports optional IP + User Agent fields only if your schema includes them.
 */
export async function writeAuthLog({
  userId,
  provider,
  success,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  provider: AuthProvider;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.authLog.create({
      data: {
        userId: userId ?? null,
        provider,
        success,

        // Only include fields that exist in Prisma schema
        ...(ipAddress ? { ipAddress } : {}),
        ...(userAgent ? { userAgent } : {}),
      },
    });
  } catch (err) {
    console.error("❌ Failed to write auth log:", err);
  }
}
