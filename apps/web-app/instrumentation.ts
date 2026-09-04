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
 *
 * This path calls runDuePublishScans() but deliberately does NOT trigger the
 * eager V12 republish-bundle build the /api/cron/publish-scheduled route
 * does after the same call — this file is compiled for an edge-like target
 * in addition to nodejs, and the build helper's dependency on node:fs/
 * node:child_process can't be bundled for that target (breaks the dev
 * server entirely if pulled in here, even via a nested dynamic import). A
 * scheduled publish through this path still lands correctly in the DB; the
 * runtime's own lazy build-on-request path just serves as the (slightly
 * later) trigger for the bundle rebuild instead of it happening eagerly.
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

  // Domain auto-verify deliberately does NOT live here: autoVerify.ts pulls
  // in domain-provisioning.ts (node:child_process, for the nginx CLI calls)
  // and dns-verification.ts (node:dns/promises) transitively, and — same
  // issue as buildAfterPublish above — this file is compiled for an
  // edge-like target too, which can't bundle those. It runs as an
  // external-cron-triggered route instead; see /api/cron/verify-domains.
}
