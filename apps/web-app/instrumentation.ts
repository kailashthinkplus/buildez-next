/*
 * Bootstraps a lightweight in-process scheduler for scheduled page publishing.
 * There is no external job queue in this app — this makes "schedule publish"
 * work automatically on any persistent Node host (`next start`). On serverless
 * hosts where this process doesn't stay warm between requests, wire an external
 * pinger (Vercel Cron, cron-job.org, GitHub Actions) to POST /api/cron/publish-scheduled
 * instead — see that route for the shared-secret contract.
 *
 * `register()` is Next.js's documented once-per-server-start hook (stable since
 * Next 13.4, no experimental flag needed here on Next 15).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const globalScope = globalThis as unknown as {
    __buildezPublishSchedulerStarted?: boolean;
  };

  // Guards against double-registration under dev-mode HMR/recompiles.
  if (globalScope.__buildezPublishSchedulerStarted) return;
  globalScope.__buildezPublishSchedulerStarted = true;

  const { runDuePublishScans } = await import("./lib/publishing/publishPage");

  const INTERVAL_MS = 60_000;

  setInterval(() => {
    runDuePublishScans().catch((error) => {
      console.error("[scheduled publish] scan failed:", error);
    });
  }, INTERVAL_MS);
}
