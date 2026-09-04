import { NextRequest } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { getTenantPlan } from "@/lib/plan/getPlan";
import { dodoClient, dodoCreditPack, parseDodoCreditPacks } from "@/lib/billing/dodo";
import { getV12CreditBalance } from "@/modules/ai-v12/creditBalance";
import { publicOrigin } from "@/lib/runtime/requestOrigin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // getUser()'s own auth.plan.Plan resolution can come back without the
  // Plan relation populated for some subscriptions (see the fallback
  // comment in lib/auth/getUser.ts) — getTenantPlan() is the same lookup
  // the builder's own credit meter (/api/builder-v3/credits) uses and
  // reliably resolves aiCredits via the subscription's planCode, which is
  // why the builder shows the correct balance while this endpoint didn't.
  const tenantPlan = await getTenantPlan(auth.tenant.id);
  const creditLimit = typeof tenantPlan?.plan?.aiCredits === "number" ? tenantPlan.plan.aiCredits : 0;
  const balance = await getV12CreditBalance({ tenantId: auth.tenant.id, creditLimit });
  return Response.json({
    balance,
    canPurchase: auth.permissions.manageBilling,
    packs: parseDodoCreditPacks().map((pack) => ({
      key: pack.key,
      name: pack.name,
      credits: pack.credits,
      price: pack.price,
      currency: pack.currency,
    })),
  }, { headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } });
}

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant || !auth.permissions.manageBilling) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.user.email) return Response.json({ error: "Add an email address before buying credits." }, { status: 400 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const pack = dodoCreditPack(typeof body.packKey === "string" ? body.packKey : "");
  if (!pack) return Response.json({ error: "Choose an available credit pack." }, { status: 400 });
  try {
    const origin = publicOrigin(req);
    const returnUrl = `${origin}/app/workspace/billing?credits=success`;
    const customer = typeof auth.plan?.dodoCustomerId === "string" && auth.plan.dodoCustomerId
      ? { customer_id: auth.plan.dodoCustomerId }
      : { email: auth.user.email, ...(auth.user.name ? { name: auth.user.name } : {}) };
    const session = await dodoClient().checkoutSessions.create({
      product_cart: [{ product_id: pack.productId, quantity: 1 }],
      customer,
      metadata: {
        purchaseType: "ai_credits",
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        packKey: pack.key,
      },
      return_url: returnUrl,
      cancel_url: `${origin}/app/workspace/billing?credits=cancelled`,
      feature_flags: { redirect_immediately: true },
    });
    if (!session.checkout_url) throw new Error("Payment service returned no checkout URL.");
    return Response.json({ checkoutUrl: session.checkout_url });
  } catch (error) {
    console.error("Credit checkout failed:", error);
    return Response.json({ error: "Credit checkout could not be started." }, { status: 502 });
  }
}
