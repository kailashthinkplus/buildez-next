// /apps/web-app/lib/logging/auditLogger.ts

import { prisma } from "@buildez/db";

/* ============================================================
   1. AUTH LOGS
============================================================ */
export async function logAuthEvent({
  userId,
  provider,
  success,
  ip,
  ua,
}: {
  userId?: string;
  provider: string;
  success: boolean;
  ip?: string | null;
  ua?: string | null;
}) {
  await prisma.authLog.create({
    data: {
      userId: userId ?? null,
      provider,
      success,
      ipAddress: ip ?? "",
      userAgent: ua ?? "",
    },
  });
}

/* ============================================================
   2. TENANT EVENT (billing, publish, settings change)
============================================================ */
export async function logTenantEvent({
  tenantId,
  type,
  payload,
}: {
  tenantId: string;
  type: string; // e.g. "publish", "billing_update", "settings_saved"
  payload?: any;
}) {
  await prisma.tenantEvent.create({
    data: {
      tenantId,
      type,
      payload: payload ?? {},
    },
  });
}

/* ============================================================
   3. AI EVENT LOGGING
============================================================ */
export async function logAiEvent({
  tenantId,
  userId,
  siteId,
  pageId,
  action,
  prompt,
  response,
  model,
  tokensIn,
  tokensOut,
  status,
  error,
}: {
  tenantId: string;
  userId?: string | null;
  siteId?: string | null;
  pageId?: string | null;
  action: string;
  prompt?: string;
  response?: string;
  model?: string;
  tokensIn?: number | null;
  tokensOut?: number | null;
  status: "success" | "error";
  error?: string | null;
}) {
  await prisma.aiEvent.create({
    data: {
      tenantId,
      userId: userId ?? null,
      siteId: siteId ?? null,
      pageId: pageId ?? null,
      action,
      prompt,
      response,
      model,
      tokensIn,
      tokensOut,
      status,
      error,
    },
  });
}

/* ============================================================
   4. SYSTEM NOTIFICATION
============================================================ */
export async function sendSystemNotification({
  type,
  title,
  message,
  entityType,
  entityId,
}: {
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}) {
  await prisma.systemNotification.create({
    data: {
      type,
      title,
      message,
      entityType: entityType ?? null,
      entityId: entityId ?? null,
    },
  });
}

/* ============================================================
   5. HELPER FOR ERROR LOGGING (AI / PUBLISH / BUILDER)
============================================================ */
export async function logError({
  message,
  stack,
  context = {},
}: {
  message: string;
  stack?: string;
  context?: Record<string, any>;
}) {
  console.error("[AuditError]", { message, context });

  await prisma.systemNotification.create({
    data: {
      type: "error",
      title: message,
      message: stack ?? "",
      entityType: "server",
      entityId: "global",
    },
  });
}
