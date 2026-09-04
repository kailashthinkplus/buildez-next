import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";
import { updateDodoDiscountActive, deleteDodoDiscount } from "@/lib/billing/coupons";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) return Response.json({ error: "Coupon not found." }, { status: 404 });

    if (typeof body.isActive === "boolean" && body.isActive !== coupon.isActive) {
      if (!body.isActive && coupon.dodoDiscountId) {
        await updateDodoDiscountActive(coupon.dodoDiscountId, false);
      }
      const updated = await prisma.coupon.update({ where: { id }, data: { isActive: body.isActive } });
      return Response.json({ coupon: updated });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        description: typeof body.description === "string" ? body.description : undefined,
        expiresAt: body.expiresAt ? new Date(String(body.expiresAt)) : undefined,
        usageLimit: body.usageLimit != null && body.usageLimit !== "" ? Math.floor(Number(body.usageLimit)) : undefined,
      },
    });
    return Response.json({ coupon: updated });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id }, include: { _count: { select: { redemptions: true } } } });
    if (!coupon) return Response.json({ error: "Coupon not found." }, { status: 404 });
    if (coupon._count.redemptions > 0) {
      return Response.json({ error: "This coupon has already been redeemed and can't be deleted — deactivate it instead." }, { status: 409 });
    }

    if (coupon.dodoDiscountId) await deleteDodoDiscount(coupon.dodoDiscountId);
    await prisma.coupon.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
