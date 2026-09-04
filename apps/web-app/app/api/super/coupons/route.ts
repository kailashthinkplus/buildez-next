import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";
import { createDodoDiscountForCoupon, type CouponInput } from "@/lib/billing/coupons";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ coupons });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

function parseInput(body: Record<string, unknown>): CouponInput | { error: string } {
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code || code.length < 3) return { error: "Code must be at least 3 characters." };

  const type = body.type === "FLAT" ? "FLAT" : body.type === "PERCENTAGE" ? "PERCENTAGE" : null;
  if (!type) return { error: "Choose a discount type." };

  const rawAmount = Number(body.amount);
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) return { error: "Enter a discount amount." };
  if (type === "PERCENTAGE" && rawAmount > 100) return { error: "Percentage discount can't exceed 100." };

  const planCodes = Array.isArray(body.planCodes) ? body.planCodes.filter((v): v is string => typeof v === "string").map((v) => v.toUpperCase()) : [];
  const billingCycles = Array.isArray(body.billingCycles) ? body.billingCycles.filter((v): v is string => v === "monthly" || v === "yearly") as ("monthly" | "yearly")[] : [];

  return {
    code,
    description: typeof body.description === "string" ? body.description.trim() || null : null,
    type,
    amount: type === "PERCENTAGE" ? Math.round(rawAmount * 100) : rawAmount,
    currency: typeof body.currency === "string" && body.currency.trim() ? body.currency.trim().toUpperCase() : "INR",
    planCodes,
    billingCycles,
    minAmount: body.minAmount != null && body.minAmount !== "" ? Number(body.minAmount) : null,
    usageLimit: body.usageLimit != null && body.usageLimit !== "" ? Math.floor(Number(body.usageLimit)) : null,
    perUserLimit: body.perUserLimit != null && body.perUserLimit !== "" ? Math.floor(Number(body.perUserLimit)) : 1,
    firstTimeOnly: Boolean(body.firstTimeOnly),
    startsAt: body.startsAt ? new Date(String(body.startsAt)) : null,
    expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : null,
    isActive: body.isActive !== false,
  };
}

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin(req);
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const input = parseInput(body);
    if ("error" in input) return Response.json({ error: input.error }, { status: 400 });

    const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
    if (existing) return Response.json({ error: "A coupon with this code already exists." }, { status: 409 });

    let dodoDiscountId: string | undefined;
    try {
      dodoDiscountId = await createDodoDiscountForCoupon(input);
    } catch (error) {
      console.error("[coupons] Dodo discount creation failed:", error);
      return Response.json({ error: "Could not create the matching discount in Dodo Payments. The coupon was not saved." }, { status: 502 });
    }

    const coupon = await prisma.coupon.create({
      data: { ...input, dodoDiscountId, createdByUserId: admin.id },
    });
    return Response.json({ coupon }, { status: 201 });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
