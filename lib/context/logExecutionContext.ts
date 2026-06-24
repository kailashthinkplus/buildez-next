// ============================================================================
// EXECUTION CONTEXT DEBUG LOGGER (DEV ONLY)
// ============================================================================

import type { ExecutionContext } from "./resolveExecutionContext";

export function logExecutionContext(
  ctx: ExecutionContext,
  options?: {
    label?: string;
    requestId?: string;
  }
) {
  if (process.env.NODE_ENV !== "development") return;

  const label = options?.label ?? "ExecutionContext";

  console.groupCollapsed(
    `%c🔍 ${label}`,
    "color:#60a5fa;font-weight:bold"
  );

  console.table({
    tenantId: ctx.tenantId,
    siteId: ctx.siteId,
    siteSlug: ctx.siteSlug,
    pageId: ctx.pageId,
    pageSlug: ctx.pageSlug,
    userId: ctx.userId,
    scope: ctx.scope,
    source: ctx.source,
  });

  if (options?.requestId) {
    console.log("requestId:", options.requestId);
  }

  console.groupEnd();
}
