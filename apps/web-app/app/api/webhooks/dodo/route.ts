import { Webhooks } from "@dodopayments/nextjs";

import { syncDodoSubscription } from "@/lib/billing/dodo";

export const runtime = "nodejs";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "not-configured",
  onPayload: async (payload) => { await syncDodoSubscription(payload); },
});
