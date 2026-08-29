import DodoPayments from "dodopayments";

import { prisma } from "@buildez/db";

export type BillingCycle = "monthly" | "yearly";

export type DodoCreditPack = Readonly<{
  key: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  productId: string;
}>;

type ProductMap = Readonly<Record<string, string>>;

export function parseDodoProductMap(value = process.env.DODO_PAYMENTS_PRODUCT_IDS): ProductMap {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
      .map(([key, productId]) => [key.toUpperCase(), productId.trim()]));
  } catch {
    return {};
  }
}

export function dodoProductId(planCode: string, billingCycle: BillingCycle) {
  return parseDodoProductMap()[`${planCode.toUpperCase()}:${billingCycle.toUpperCase()}`];
}

export function dodoPlanForProduct(productId: string) {
  const match = Object.entries(parseDodoProductMap()).find(([, value]) => value === productId);
  if (!match) return undefined;
  const [planCode, cycle] = match[0].split(":");
  if (!planCode || !["MONTHLY", "YEARLY"].includes(cycle)) return undefined;
  return { planCode, billingCycle: cycle.toLowerCase() as BillingCycle };
}

export function parseDodoCreditPacks(value = process.env.DODO_PAYMENTS_CREDIT_PRODUCTS): DodoCreditPack[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed as Record<string, unknown>).flatMap(([rawKey, rawPack]) => {
      const pack = record(rawPack);
      const productId = typeof pack.productId === "string" ? pack.productId.trim() : "";
      const credits = typeof pack.credits === "number" ? Math.floor(pack.credits) : 0;
      const price = typeof pack.price === "number" ? Math.floor(pack.price) : 0;
      const currency = typeof pack.currency === "string" ? pack.currency.trim().toUpperCase() : "INR";
      if (!productId || credits <= 0 || price < 0 || !currency) return [];
      const key = rawKey.trim().toUpperCase();
      return [{
        key,
        name: typeof pack.name === "string" && pack.name.trim() ? pack.name.trim() : `${credits.toLocaleString()} AI credits`,
        credits,
        price,
        currency,
        productId,
      }];
    }).sort((a, b) => a.credits - b.credits);
  } catch {
    return [];
  }
}

export function dodoCreditPack(key: string) {
  return parseDodoCreditPacks().find((pack) => pack.key === key.trim().toUpperCase());
}

export function dodoEnvironment() {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
}

export function dodoClient() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new Error("Dodo Payments is not configured yet.");
  return new DodoPayments({ bearerToken, environment: dodoEnvironment() });
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function date(value: unknown) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== "string") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function subscriptionState(status: string) {
  const normalized = status.toLowerCase();
  return {
    status: normalized === "active" ? "ACTIVE" : normalized.toUpperCase(),
    paymentStatus: normalized === "active" ? "PAID"
      : ["failed", "on_hold"].includes(normalized) ? "FAILED"
      : normalized === "pending" ? "PENDING"
      : ["cancelled", "expired"].includes(normalized) ? "ENDED"
      : normalized === "paused" ? "PAUSED"
      : undefined,
  };
}

export async function syncDodoSubscription(payload: unknown) {
  const root = record(payload);
  const data = record(root.data);
  if (data.payload_type !== "Subscription") return { ignored: true };
  const metadata = record(data.metadata);
  const externalId = typeof data.subscription_id === "string" ? data.subscription_id : "";
  const productId = typeof data.product_id === "string" ? data.product_id : "";
  const configuredPlan = dodoPlanForProduct(productId);
  if (!externalId || !productId || !configuredPlan) {
    throw new Error("Dodo subscription product does not match configured plan pricing.");
  }
  const existing = await prisma.subscription.findUnique({ where: { dodoSubscriptionId: externalId } });
  const tenantId = existing?.tenantHistoryId || (typeof metadata.tenantId === "string" ? metadata.tenantId : "");
  const userId = existing?.userId || (typeof metadata.userId === "string" ? metadata.userId : "");
  const { planCode, billingCycle } = configuredPlan;
  if (!tenantId || !userId) throw new Error("Dodo subscription webhook is missing BuildEZ ownership metadata.");
  const plan = await prisma.plan.findFirst({
    where: { code: planCode, isPublic: true },
    include: { pricing: { where: { billingCycle, isActive: true }, take: 1 } },
  });
  const pricing = plan?.pricing[0];
  if (!plan || !pricing) throw new Error("Dodo subscription references an unavailable BuildEZ plan.");
  const remoteStatus = typeof data.status === "string" ? data.status : "pending";
  const state = subscriptionState(remoteStatus);
  const customer = record(data.customer);
  const customerId = typeof customer.customer_id === "string" ? customer.customer_id : undefined;
  const active = state.status === "ACTIVE";
  const eventType = typeof root.type === "string" ? root.type : "";
  const paidAt = ["subscription.active", "subscription.renewed"].includes(eventType)
    ? date(root.timestamp) || new Date()
    : undefined;

  return prisma.$transaction(async (tx) => {
    let subscription = await tx.subscription.findUnique({ where: { dodoSubscriptionId: externalId } });
    if (!subscription) {
      subscription = await tx.subscription.findFirst({
        where: {
          tenantHistoryId: tenantId,
          planCode,
          billingCycle,
          dodoSubscriptionId: null,
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });
    }
    const values = {
      planCode,
      planId: plan.id,
      billingCycle,
      status: state.status,
      paymentStatus: state.paymentStatus,
      amountPaid: pricing.amount,
      currency: String(data.currency || pricing.currency),
      dodoCustomerId: customerId,
      dodoSubscriptionId: externalId,
      currentPeriodEnd: date(data.next_billing_date),
      startedAt: date(data.previous_billing_date) || date(data.created_at),
      paidAt,
      userId,
      tenantHistoryId: tenantId,
    } as const;
    if (!subscription) {
      subscription = await tx.subscription.create({ data: values });
    } else {
      subscription = await tx.subscription.update({ where: { id: subscription.id }, data: values });
    }
    if (active) {
      const current = await tx.subscription.findFirst({ where: { tenantActiveId: tenantId } });
      if (current && current.id !== subscription.id) {
        await tx.subscription.update({ where: { id: current.id }, data: { tenantActiveId: null } });
      }
      subscription = await tx.subscription.update({
        where: { id: subscription.id },
        data: { tenantActiveId: tenantId },
      });
      await tx.tenant.update({ where: { id: tenantId }, data: { subscriptionId: subscription.id } });
    } else if (subscription.tenantActiveId === tenantId) {
      subscription = await tx.subscription.update({
        where: { id: subscription.id },
        data: { tenantActiveId: null },
      });
      await tx.tenant.updateMany({
        where: { id: tenantId, subscriptionId: subscription.id },
        data: { subscriptionId: null },
      });
    }
    return { ignored: false, subscriptionId: subscription.id, status: subscription.status };
  });
}

export async function fulfillDodoCreditPayment(payload: unknown) {
  const root = record(payload);
  const data = record(root.data);
  if (root.type !== "payment.succeeded" || data.payload_type !== "Payment") return { ignored: true };
  if (typeof data.subscription_id === "string" && data.subscription_id) return { ignored: true };
  const metadata = record(data.metadata);
  if (metadata.purchaseType !== "ai_credits") return { ignored: true };
  const tenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
  const userId = typeof metadata.userId === "string" ? metadata.userId : "";
  const packKey = typeof metadata.packKey === "string" ? metadata.packKey.toUpperCase() : "";
  const paymentId = typeof data.payment_id === "string" ? data.payment_id : "";
  const pack = dodoCreditPack(packKey);
  const productCart = Array.isArray(data.product_cart) ? data.product_cart.map(record) : [];
  const hasExpectedProduct = pack && productCart.some((item) => item.product_id === pack.productId && item.quantity === 1);
  if (!tenantId || !userId || !paymentId || !pack || !hasExpectedProduct) {
    throw new Error("Dodo credit payment does not match a configured BuildEZ credit pack.");
  }
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) throw new Error("Dodo credit payment tenant ownership could not be verified.");

  const { addV12TopUpCredits } = await import("@/modules/ai-v12/creditAccounting");
  return prisma.$transaction(async (tx) => {
    const created = await tx.aiCreditLedgerEntry.createMany({
      data: [{
        tenantId,
        type: "TOPUP_PURCHASE",
        amount: pack.credits,
        topUpCredits: pack.credits,
        reason: `Purchased ${pack.name} through Dodo Payments`,
        idempotencyKey: `dodo-payment:${paymentId}`,
        metadata: {
          provider: "dodo",
          paymentId,
          checkoutSessionId: typeof data.checkout_session_id === "string" ? data.checkout_session_id : null,
          productId: pack.productId,
          packKey: pack.key,
          paidAmount: typeof data.total_amount === "number" ? data.total_amount : null,
          currency: typeof data.currency === "string" ? data.currency : null,
          userId,
        },
      }],
      skipDuplicates: true,
    });
    if (created.count === 0) return { ignored: false, duplicate: true, credits: pack.credits };
    await addV12TopUpCredits({ tenantId, amount: pack.credits }, tx);
    return { ignored: false, duplicate: false, credits: pack.credits };
  });
}

export async function syncDodoWebhook(payload: unknown) {
  const root = record(payload);
  if (record(root.data).payload_type === "Subscription") return syncDodoSubscription(payload);
  return fulfillDodoCreditPayment(payload);
}
