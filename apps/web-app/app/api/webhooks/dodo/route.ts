import { Webhooks } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { syncDodoWebhook } from "@/lib/billing/dodo";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  if (!webhookKey) {
    return NextResponse.json({ error: "Dodo webhook is not configured" }, { status: 503 });
  }

  return Webhooks({
    webhookKey,
    onPayload: async (payload) => { await syncDodoWebhook(payload); },
  })(request);
}
