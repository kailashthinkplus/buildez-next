import { prisma } from "@buildez/db";
import { dodoClient, dodoAmountMinor } from "./dodo";

export type CouponType = "PERCENTAGE" | "FLAT";
export type BillingCycle = "monthly" | "yearly";

export type CouponInput = {
  code: string;
  description?: string | null;
  type: CouponType;
  /** PERCENTAGE: basis points (2000 = 20%). FLAT: major units of `currency`. */
  amount: number;
  currency?: string | null;
  planCodes: string[];
  billingCycles: BillingCycle[];
  /** Major units. */
  minAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  firstTimeOnly: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive: boolean;
};

/**
 * Mirrors a Coupon into a Dodo Payments Discount object so Dodo independently
 * enforces the same limits at charge time — a defense-in-depth backstop in
 * case our own validateCoupon() below is ever bypassed or has a bug.
 */
export async function createDodoDiscountForCoupon(input: CouponInput) {
  const client = dodoClient();
  const currency = (input.currency || "INR").toUpperCase();

  const currencyOptions = input.type === "FLAT"
    ? [{
        currency: currency as never,
        is_default: true,
        max_amount_possible: Math.max(1, dodoAmountMinor(input.amount, currency)),
        minimum_subtotal: input.minAmount ? dodoAmountMinor(input.minAmount, currency) : 0,
      }]
    : input.minAmount
      ? [{ currency: currency as never, is_default: true, minimum_subtotal: dodoAmountMinor(input.minAmount, currency) }]
      : undefined;

  const discount = await client.discounts.create({
    code: input.code,
    name: input.description || input.code,
    type: input.type === "FLAT" ? "flat" : "percentage",
    // Dodo's top-level `amount` is always basis points; for FLAT discounts the
    // real deduction lives in currency_options[].max_amount_possible above, so
    // this is only a formality (kept at 1bp minimum, the API's floor).
    amount: input.type === "FLAT" ? 1 : Math.round(input.amount),
    currency_options: currencyOptions,
    customer_eligibility: input.firstTimeOnly ? "first_time" : "any",
    usage_limit: input.usageLimit ?? undefined,
    per_customer_usage_limit: input.perUserLimit ?? undefined,
    expires_at: input.expiresAt ? input.expiresAt.toISOString() : undefined,
  });
  return discount.discount_id;
}

export async function updateDodoDiscountActive(dodoDiscountId: string, isActive: boolean) {
  const client = dodoClient();
  // Dodo has no direct enable/disable flag on a discount; the closest
  // equivalent is expiring it immediately when deactivating. Re-activating a
  // previously-deactivated coupon is not supported on the Dodo side — the
  // superadmin UI creates a fresh coupon (and Dodo discount) instead.
  if (!isActive) {
    await client.discounts.update(dodoDiscountId, { expires_at: new Date().toISOString() }).catch(() => undefined);
  }
}

export async function deleteDodoDiscount(dodoDiscountId: string) {
  const client = dodoClient();
  await client.discounts.delete(dodoDiscountId).catch(() => undefined);
}

export type CouponValidation =
  | { valid: true; code: string; type: CouponType; description: string | null; discountAmount: number; finalAmount: number }
  | { valid: false; error: string };

/**
 * Our own eligibility gate — checked before sending the user to Dodo
 * checkout, and re-checked server-side (never trust the client-echoed code)
 * right before creating the checkout session / plan change.
 */
export async function validateCoupon(input: {
  code: string;
  userId: string;
  planCode: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
}): Promise<CouponValidation> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { valid: false, error: "Enter a coupon code." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) return { valid: false, error: "This coupon code isn't valid." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { valid: false, error: "This coupon isn't active yet." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, error: "This coupon has expired." };

  if (coupon.planCodes.length && !coupon.planCodes.includes(input.planCode.toUpperCase())) {
    return { valid: false, error: "This coupon doesn't apply to the selected plan." };
  }
  if (coupon.billingCycles.length && !coupon.billingCycles.includes(input.billingCycle)) {
    return { valid: false, error: "This coupon doesn't apply to this billing cycle." };
  }
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }
  if (coupon.minAmount != null && input.amount < coupon.minAmount) {
    return { valid: false, error: `This coupon needs an order of at least ${coupon.minAmount} ${input.currency}.` };
  }
  if (coupon.perUserLimit != null) {
    const used = await prisma.couponRedemption.count({ where: { couponId: coupon.id, userId: input.userId } });
    if (used >= coupon.perUserLimit) return { valid: false, error: "You've already used this coupon." };
  }
  if (coupon.firstTimeOnly) {
    const priorPaid = await prisma.subscription.findFirst({ where: { userId: input.userId, paymentStatus: "PAID" }, select: { id: true } });
    if (priorPaid) return { valid: false, error: "This coupon is for first-time customers only." };
  }

  const discountAmount = Math.min(
    coupon.type === "PERCENTAGE" ? Math.round((input.amount * coupon.amount) / 10000) : coupon.amount,
    input.amount,
  );

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type as CouponType,
    description: coupon.description,
    discountAmount,
    finalAmount: Math.max(0, input.amount - discountAmount),
  };
}

/** Idempotent via CouponRedemption.subscriptionId being unique — safe against webhook redelivery. */
export async function recordCouponRedemption(input: {
  couponCode: string;
  userId: string;
  tenantId?: string | null;
  subscriptionId: string;
  amountDiscounted: number;
  currency: string;
}) {
  const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
  if (!coupon) return;

  const existing = await prisma.couponRedemption.findUnique({ where: { subscriptionId: input.subscriptionId } });
  if (existing) return;

  await prisma.$transaction([
    prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        userId: input.userId,
        tenantId: input.tenantId ?? null,
        subscriptionId: input.subscriptionId,
        amountDiscounted: input.amountDiscounted,
        currency: input.currency,
      },
    }),
    prisma.coupon.update({ where: { id: coupon.id }, data: { timesUsed: { increment: 1 } } }),
  ]);
}
