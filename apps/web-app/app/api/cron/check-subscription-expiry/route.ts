import { NextRequest, NextResponse } from "next/server";
import { runExpiryAlertScan } from "@/lib/billing/expiryAlerts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * External-cron only — unlike scheduled page publishing there's no
 * in-process fallback in instrumentation.ts for this one (a multi-day
 * alert window doesn't need sub-minute freshness). Point an external
 * scheduler (Vercel Cron via vercel.json, cron-job.org, GitHub Actions)
 * at this route once a day.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const provided = req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runExpiryAlertScan();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
