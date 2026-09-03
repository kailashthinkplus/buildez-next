/*
 * Deliberately kept out of lib/publishing/publishPage.ts (see the comment on
 * publishPageNow there): this indirectly imports node:child_process/node:fs
 * via v12PublishedBundle.ts, which breaks instrumentation.ts's edge-target
 * compilation if it's anywhere in publishPage.ts's import graph — even
 * behind a nested dynamic import. Only call this from route handlers, which
 * are never reached by that bundle.
 */
export async function buildAfterPublish(siteId: string, tenantId: string) {
  const { ensureV12PublishedBundle } = await import("@/modules/runtime/v12PublishedBundle");
  // Build now, while live files still match what was just published —
  // V12ProjectFile rows are mutable-in-place (no historical content), so
  // this is the only point where "current" and "published" are guaranteed
  // to be the same thing. A failure here is logged, not thrown: the DB
  // publish already succeeded, and the runtime's own lazy build-on-request
  // path (v12PublishedBundle.ts) still serves as a retry.
  await ensureV12PublishedBundle(siteId, tenantId).catch((error) => {
    console.error(`[publish] eager bundle build failed for site ${siteId}:`, error);
  });
}
