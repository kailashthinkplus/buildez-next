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

/**
 * `PlanPricing.dodoProductId` (kept in sync by `syncPlanPricingToDodo`) is the
 * source of truth once a plan has been synced; the env var map is only a
 * fallback for plans that predate that sync.
 */
export async function resolveDodoProductId(planCode: string, billingCycle: BillingCycle) {
  const pricing = await prisma.planPricing.findUnique({
    where: { planCode_billingCycle: { planCode: planCode.toUpperCase(), billingCycle } },
    select: { id: true, dodoProductId: true },
  });
  if (pricing?.dodoProductId) return pricing.dodoProductId;

  const envProductId = dodoProductId(planCode, billingCycle);
  if (envProductId && pricing) {
    // Promote the env-configured id into the DB so the next superadmin price
    // edit updates this existing Dodo product instead of creating a new one.
    await prisma.planPricing
      .update({ where: { id: pricing.id }, data: { dodoProductId: envProductId } })
      .catch(() => undefined);
  }
  return envProductId;
}

export async function resolveDodoPlanForProduct(productId: string) {
  const pricing = await prisma.planPricing.findFirst({
    where: { dodoProductId: productId },
    select: { planCode: true, billingCycle: true },
  });
  if (pricing && (pricing.billingCycle === "monthly" || pricing.billingCycle === "yearly")) {
    return { planCode: pricing.planCode, billingCycle: pricing.billingCycle as BillingCycle };
  }
  return dodoPlanForProduct(productId);
}

function dodoBillingInterval(billingCycle: BillingCycle) {
  const interval = billingCycle === "yearly" ? "Year" as const : "Month" as const;
  return {
    payment_frequency_count: 1,
    payment_frequency_interval: interval,
    subscription_period_count: 1,
    subscription_period_interval: interval,
  };
}

/**
 * Pushes a plan's current price to Dodo so checkout always matches what
 * superadmin last saved. Creates the Dodo product on first sync (and stores
 * its id on `PlanPricing`); on later syncs it updates the existing product's
 * price in place, which only affects new checkouts — Dodo does not
 * retroactively reprice already-active subscriptions.
 */
export async function syncPlanPricingToDodo(pricing: {
  id: string;
  planCode: string;
  billingCycle: string;
  amount: number;
  currency: string;
  dodoProductId: string | null;
}, planName: string) {
  if (pricing.billingCycle !== "monthly" && pricing.billingCycle !== "yearly") return null;

  const client = dodoClient();
  const price = {
    type: "recurring_price" as const,
    currency: pricing.currency as never,
    discount: 0,
    price: pricing.amount,
    ...dodoBillingInterval(pricing.billingCycle),
  };

  if (pricing.dodoProductId) {
    await client.products.update(pricing.dodoProductId, { price });
    return pricing.dodoProductId;
  }

  const product = await client.products.create({
    name: `${planName} (${pricing.billingCycle})`,
    price,
    tax_category: "saas",
  });
  await prisma.planPricing.update({
    where: { id: pricing.id },
    data: { dodoProductId: product.product_id },
  });
  return product.product_id;
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

export function latestSucceededDodoPaymentId(payments: readonly unknown[]) {
  return payments
    .map(record)
    .filter(
      (payment) =>
        payment.status === "succeeded" &&
        typeof payment.payment_id === "string" &&
        payment.payment_id.length > 0,
    )
    .sort((left, right) => {
      const leftTime = date(left.created_at)?.getTime() ?? 0;
      const rightTime = date(right.created_at)?.getTime() ?? 0;
      return rightTime - leftTime;
    })[0]?.payment_id as string | undefined;
}

export async function syncLatestDodoSubscriptionPayment(
  subscriptionId: string,
) {
  if (!subscriptionId) return { ignored: true } as const;

  const client = dodoClient();
  const page = await client.payments.list({
    subscription_id: subscriptionId,
    status: "succeeded",
    page_size: 100,
  });
  const paymentId = latestSucceededDodoPaymentId(page.items);
  if (!paymentId) return { ignored: true } as const;

  const payment = await client.payments.retrieve(paymentId);
  return recordDodoSubscriptionPayment({
    type: "payment.succeeded",
    timestamp: payment.updated_at || payment.created_at,
    data: { ...payment, payload_type: "Payment" },
  });
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
  const configuredPlan = await resolveDodoPlanForProduct(productId);
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
      cancelAtPeriodEnd: Boolean(data.cancel_at_next_billing_date),
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
    const amountMinor = typeof data.total_amount === "number" ? Math.max(0, Math.round(data.total_amount)) : 0;
    const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : pack.currency;
    const paidAt = date(root.timestamp) || date(data.updated_at) || new Date();
    const transaction = await tx.billingTransaction.upsert({
      where: { providerPaymentId: paymentId },
      update: {
        status: "SUCCEEDED",
        amountMinor,
        currency,
        paidAt,
        type: "CREDIT_TOP_UP",
        metadata: {
          packKey: pack.key,
          packName: pack.name,
          credits: pack.credits,
          invoiceUrl: typeof data.invoice_url === "string" ? data.invoice_url : null,
          invoiceId: typeof data.invoice_id === "string" ? data.invoice_id : null,
        },
      },
      create: {
        tenantId,
        userId,
        providerPaymentId: paymentId,
        type: "CREDIT_TOP_UP",
        status: "SUCCEEDED",
        amountMinor,
        currency,
        paidAt,
        metadata: {
          packKey: pack.key,
          packName: pack.name,
          credits: pack.credits,
          invoiceUrl: typeof data.invoice_url === "string" ? data.invoice_url : null,
          invoiceId: typeof data.invoice_id === "string" ? data.invoice_id : null,
        },
      },
    });
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
    if (created.count === 0) return { ignored: false, duplicate: true, credits: pack.credits, transactionId: transaction.id };
    await addV12TopUpCredits({ tenantId, amount: pack.credits }, tx);
    return { ignored: false, duplicate: false, credits: pack.credits, transactionId: transaction.id };
  });
}

export async function recordDodoSubscriptionPayment(payload: unknown) {
  const root = record(payload);
  const data = record(root.data);
  const subscriptionId = typeof data.subscription_id === "string" ? data.subscription_id : "";
  const paymentId = typeof data.payment_id === "string" ? data.payment_id : "";
  if (!subscriptionId || !paymentId || data.status !== "succeeded") return { ignored: true };

  const metadata = record(data.metadata);
  const productCart = Array.isArray(data.product_cart) ? data.product_cart.map(record) : [];
  const productId = typeof productCart[0]?.product_id === "string" ? productCart[0].product_id as string : "";
  let localSubscription = await prisma.subscription.findUnique({
    where: { dodoSubscriptionId: subscriptionId },
  });
  if (!localSubscription) {
    // `payments.retrieve()` doesn't echo back `product_cart` for
    // subscription-linked payments, so `productId` above is often empty and
    // the plan can't be resolved from the payment alone. Fall back to the
    // PENDING row created at checkout time (matched by checkout session, or
    // by tenant+user as a last resort) so its planCode can stand in below.
    const metadataTenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : "";
    const metadataUserId = typeof metadata.userId === "string" ? metadata.userId : "";
    const checkoutSessionId = typeof data.checkout_session_id === "string" ? data.checkout_session_id : "";
    if (metadataTenantId || checkoutSessionId) {
      localSubscription = await prisma.subscription.findFirst({
        where: {
          ...(checkoutSessionId ? { dodoCheckoutSessionId: checkoutSessionId } : { tenantHistoryId: metadataTenantId }),
          ...(metadataUserId ? { userId: metadataUserId } : {}),
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });
    }
  }
  const localBillingCycle = localSubscription?.billingCycle;
  const configuredPlan =
    (await resolveDodoPlanForProduct(productId)) ||
    (localSubscription?.planCode &&
    (localBillingCycle === "monthly" || localBillingCycle === "yearly")
      ? {
          planCode: localSubscription.planCode,
          billingCycle: localBillingCycle,
        }
      : undefined);
  const amountMinor = typeof data.total_amount === "number" ? Math.max(0, Math.round(data.total_amount)) : -1;
  const currency = typeof data.currency === "string" ? data.currency.toUpperCase() : "";

  if (!configuredPlan || amountMinor < 0 || !currency) {
    throw new Error("Subscription payment ownership or amount could not be verified.");
  }
  const tenantId = localSubscription?.tenantHistoryId || (typeof metadata.tenantId === "string" ? metadata.tenantId : "");
  const userId = localSubscription?.userId || (typeof metadata.userId === "string" ? metadata.userId : "");
  if (!tenantId || !userId || (localSubscription && localSubscription.planCode !== configuredPlan.planCode)) {
    throw new Error("Subscription payment ownership or plan could not be verified.");
  }
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
  if (!tenant) throw new Error("Subscription payment workspace could not be verified.");

  const paidAt = date(root.timestamp) || date(data.updated_at) || new Date();
  return prisma.$transaction(async (tx) => {
    if (localSubscription) {
      await tx.subscription.update({
        where: { id: localSubscription.id },
        data: {
          dodoSubscriptionId: subscriptionId,
          paymentStatus: "PAID",
          paidAt,
          currency,
        },
      });
    }

    const transaction = await tx.billingTransaction.upsert({
      where: { providerPaymentId: paymentId },
      update: {
        status: "SUCCEEDED",
        amountMinor,
        currency,
        paidAt,
        subscriptionId: localSubscription?.id,
        planCode: configuredPlan.planCode,
        billingCycle: configuredPlan.billingCycle,
        metadata: {
          checkoutSessionId: typeof data.checkout_session_id === "string" ? data.checkout_session_id : null,
          invoiceUrl: typeof data.invoice_url === "string" ? data.invoice_url : null,
          invoiceId: typeof data.invoice_id === "string" ? data.invoice_id : null,
        },
      },
      create: {
        tenantId,
        userId,
        subscriptionId: localSubscription?.id,
        providerPaymentId: paymentId,
        status: "SUCCEEDED",
        amountMinor,
        currency,
        planCode: configuredPlan.planCode,
        billingCycle: configuredPlan.billingCycle,
        paidAt,
        metadata: {
          checkoutSessionId: typeof data.checkout_session_id === "string" ? data.checkout_session_id : null,
          invoiceUrl: typeof data.invoice_url === "string" ? data.invoice_url : null,
          invoiceId: typeof data.invoice_id === "string" ? data.invoice_id : null,
        },
      },
    });

    return { ignored: false, transactionId: transaction.id };
  });
}

/*
 * A subscription checkout that fails, is cancelled, or expires before the
 * subscription is ever created only ever reaches us as a `Payment`-type
 * event (there is no `Subscription` payload to react to, and it is never
 * `payment.succeeded`). Left unhandled, the `Subscription` row created
 * eagerly at checkout time (status "PENDING") never moves out of that
 * state — it just sits there indefinitely, indistinguishable from an
 * in-flight payment. This closes that gap by resolving the matching
 * pending row to a terminal state whenever Dodo reports anything other
 * than success for it.
 */
export async function handleFailedDodoCheckout(payload: unknown) {
  const root = record(payload);
  const data = record(root.data);
  if (data.payload_type !== "Payment" || root.type === "payment.succeeded") {
    return { ignored: true };
  }
  const checkoutSessionId = typeof data.checkout_session_id === "string" ? data.checkout_session_id : "";
  if (!checkoutSessionId) return { ignored: true };

  const pending = await prisma.subscription.findFirst({
    where: { dodoCheckoutSessionId: checkoutSessionId, status: "PENDING" },
  });
  if (!pending) return { ignored: true };

  const eventType = typeof root.type === "string" ? root.type : "";
  const rawStatus = eventType === "payment.cancelled" || eventType === "payment.expired" ? "cancelled" : "failed";
  const mapped = subscriptionState(rawStatus);

  await prisma.subscription.update({
    where: { id: pending.id },
    data: { status: mapped.status, paymentStatus: mapped.paymentStatus },
  });

  return { ignored: false, subscriptionId: pending.id };
}

export async function syncDodoWebhook(payload: unknown) {
  const root = record(payload);
  if (record(root.data).payload_type === "Subscription") return syncDodoSubscription(payload);
  if (root.type === "payment.succeeded" && typeof record(root.data).subscription_id === "string") {
    return recordDodoSubscriptionPayment(payload);
  }
  if (root.type !== "payment.succeeded") {
    const failure = await handleFailedDodoCheckout(payload);
    if (!failure.ignored) return failure;
  }
  return fulfillDodoCreditPayment(payload);
}
