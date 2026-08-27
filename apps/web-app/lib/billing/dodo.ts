import DodoPayments from "dodopayments";

import { prisma } from "@buildez/db";

export type BillingCycle = "monthly" | "yearly";

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
      : undefined,
  };
}

export async function syncDodoSubscription(payload: unknown) {
  const root = record(payload);
  const data = record(root.data);
  if (data.payload_type !== "Subscription") return { ignored: true };
  const metadata = record(data.metadata);
  const tenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
  const userId = typeof metadata.userId === "string" ? metadata.userId : "";
  const planCode = typeof metadata.planCode === "string" ? metadata.planCode.toUpperCase() : "";
  const billingCycle = metadata.billingCycle === "yearly" ? "yearly" : metadata.billingCycle === "monthly" ? "monthly" : "";
  const externalId = typeof data.subscription_id === "string" ? data.subscription_id : "";
  const productId = typeof data.product_id === "string" ? data.product_id : "";
  if (!tenantId || !userId || !planCode || !billingCycle || !externalId || !productId) {
    throw new Error("Dodo subscription webhook is missing BuildEZ metadata.");
  }
  if (dodoProductId(planCode, billingCycle) !== productId) {
    throw new Error("Dodo subscription product does not match configured plan pricing.");
  }
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
  const paidAt = active ? date(root.timestamp) || new Date() : undefined;

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
    }
    return { ignored: false, subscriptionId: subscription.id, status: subscription.status };
  });
}
