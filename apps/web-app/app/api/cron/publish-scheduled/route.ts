import { NextRequest, NextResponse } from "next/server";
import { runDuePublishScans } from "@/lib/publishing/publishPage";
import { buildAfterPublish } from "@/lib/publishing/buildAfterPublish";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * External-cron fallback for hosts where the in-process scheduler
 * (instrumentation.ts) can't stay warm between requests (serverless).
 * Point an external scheduler (Vercel Cron via vercel.json, cron-job.org,
 * GitHub Actions) at this route every 1-5 minutes.
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

  const result = await runDuePublishScans();
  await Promise.all(result.v12Sites.map(({ siteId, tenantId }) => buildAfterPublish(siteId, tenantId)));
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}
