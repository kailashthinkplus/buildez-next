import { NextRequest, NextResponse } from "next/server";
import { runDueDomainVerifications } from "@/lib/domains/autoVerify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Sweeps every PENDING custom domain and activates whichever have
 * propagated. Point an external scheduler at this route every few
 * minutes — see /api/cron/publish-scheduled for why this can't just live
 * in instrumentation.ts's in-process scheduler (it needs node:dns and
 * node:child_process, which can't be bundled for that file's edge target).
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

  const result = await runDueDomainVerifications();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
