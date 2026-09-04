import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const query = (new URL(req.url).searchParams.get("q") || "").trim().toLowerCase();
    const [subscriptions, orders] = await Promise.all([
      prisma.subscription.findMany({
        orderBy: { createdAt: "desc" }, take: 150,
        include: {
          user: { select: { id: true, name: true, email: true } },
          tenantActive: { select: { id: true, name: true } },
          tenantHistory: { select: { id: true, name: true } },
          Plan: { select: { code: true, name: true } },
        },
      }),
      prisma.shopOrder.findMany({
        orderBy: { createdAt: "desc" }, take: 150,
        include: { shop: { select: { name: true, site: { select: { id: true, name: true, tenant: { select: { id: true, name: true } } } } } } },
      }),
    ]);
    const rows = [
      ...subscriptions.map(item => ({ id: item.id, type: "subscription", reference: item.dodoSubscriptionId || item.razorpayPaymentId || item.id, description: item.Plan?.name || item.planCode || "Subscription", party: item.user?.email || "—", tenant: item.tenantActive || item.tenantHistory, amount: item.amountPaid || 0, currency: item.currency || "INR", status: item.paymentStatus || item.status, createdAt: item.createdAt })),
      ...orders.map(item => ({ id: item.id, type: "order", reference: `${item.shop.name} #${item.orderNumber}`, description: "ShopEZ order", party: item.email, tenant: item.shop.site.tenant, amount: Number(item.total), currency: item.currency, status: item.paymentStatus, createdAt: item.createdAt })),
    ].filter(item => !query || `${item.reference} ${item.party} ${item.tenant?.name || ""} ${item.status}`.toLowerCase().includes(query)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 200);
    return Response.json({ transactions: rows });
  } catch (error) { return superAdminErrorResponse(error); }
}
