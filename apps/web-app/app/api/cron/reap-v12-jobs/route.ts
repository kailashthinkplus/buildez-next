import { NextRequest, NextResponse } from "next/server";
import { reapAllActiveV12Jobs, reapStaleV12Jobs } from "@/lib/ai/v12JobRecovery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Clears V12GenerationJob rows abandoned by a dead process instance — see
 * lib/ai/v12JobRecovery.ts for why this can't live in instrumentation.ts's
 * in-process scheduler (same node:crypto edge-bundling issue as
 * /api/cron/verify-domains).
 *
 * Two modes:
 * - Default: reaps only STALE jobs (safe for a periodic external cron —
 *   point a scheduler at this route every few minutes).
 * - `?all=1`: reaps every active job unconditionally. Only safe to call
 *   right after a fresh process start (this app runs as a single pm2 fork
 *   instance, so anything still "running" at that point is necessarily
 *   orphaned) — call this once, manually, immediately after each
 *   `pm2 restart`/deploy, not on a recurring schedule.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const provided = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = req.nextUrl.searchParams.get("all") === "1";
  const cleared = all ? await reapAllActiveV12Jobs() : await reapStaleV12Jobs();
  return NextResponse.json({ cleared, all });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
