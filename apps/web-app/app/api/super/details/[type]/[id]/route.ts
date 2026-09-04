import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function GET(req: Request, context: { params: Promise<{ type: string; id: string }> }) {
  try {
    await requireSuperAdmin(req);
    const { type, id } = await context.params;
    let record: unknown = null;
    let title = "Record details";
    let subtitle = id;

    if (type === "users") {
      record = await prisma.user.findUnique({ where: { id }, include: { onboarding: true, ownedTenants: { select: { id: true, name: true, isActive: true } }, tenantUsers: { select: { id: true, name: true, isActive: true } }, teamMemberships: { include: { team: { select: { id: true, name: true } } } }, sessions: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, provider: true, expiresAt: true, revoked: true, createdAt: true } }, authLogs: { orderBy: { createdAt: "desc" }, take: 10 } } });
      const item = record as { name?: string | null; email?: string | null } | null; title = item?.name || item?.email || "User"; subtitle = item?.email || id;
    } else if (type === "tenants") {
      record = await prisma.tenant.findUnique({ where: { id }, include: { owner: { select: { id: true, name: true, email: true } }, users: { select: { id: true, name: true, email: true, role: true, isActive: true } }, sites: { where: { deletedAt: null }, select: { id: true, name: true, slug: true, status: true } }, subscriptions: { orderBy: { createdAt: "desc" }, take: 10 }, events: { orderBy: { createdAt: "desc" }, take: 15 } } });
      const item = record as { name?: string } | null; title = item?.name || "Tenant"; subtitle = `Tenant · ${id}`;
    } else if (type === "websites") {
      record = await prisma.site.findUnique({ where: { id }, include: { tenant: { select: { id: true, name: true, isActive: true } }, pages: { select: { id: true, title: true, slug: true, status: true, updatedAt: true } }, domains: true, crmLeads: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, name: true, email: true, status: true, source: true } }, shop: { select: { id: true, name: true, currency: true, isPublished: true } }, _count: { select: { mediaAssets: true, snapshots: true, blueprints: true } } } });
      const item = record as { name?: string; slug?: string } | null; title = item?.name || "Website"; subtitle = item?.slug ? `/${item.slug}` : id;
    } else if (type === "plans") {
      record = await prisma.plan.findUnique({ where: { code: id }, include: { pricing: true, features: true, subscriptions: { orderBy: { createdAt: "desc" }, take: 15, select: { id: true, status: true, userId: true, createdAt: true } }, _count: { select: { subscriptions: true, siteSubscriptions: true } } } });
      const item = record as { name?: string; code?: string } | null; title = item?.name || "Plan"; subtitle = item?.code || id;
    } else if (type === "support" || type === "crm") {
      record = await prisma.crmLead.findUnique({ where: { id }, include: { site: { include: { tenant: { select: { id: true, name: true } } } }, communications: { orderBy: { createdAt: "desc" } } } });
      const item = record as { name?: string; email?: string | null; customData?: unknown } | null; title = item?.name || (type === "support" ? "Support ticket" : "CRM lead"); subtitle = item?.email || id;
    } else if (type === "transactions") {
      // Separated with "--" rather than ":" — a raw colon in this path
      // segment was getting double URL-encoded somewhere in the Link/route-
      // param pipeline (observed as %253A server-side), so the id Prisma
      // received was never a real record id and every lookup 404'd.
      const separator = id.indexOf("--");
      const kind = separator > 0 ? id.slice(0, separator) : "subscription";
      const recordId = separator > 0 ? id.slice(separator + 2) : id;
      if (kind === "order") {
        record = await prisma.shopOrder.findUnique({ where: { id: recordId }, include: { shop: { include: { site: { include: { tenant: true } } } }, customer: true, items: true, discountCode: true } });
        const item = record as { orderNumber?: number; email?: string } | null; title = `Order #${item?.orderNumber || "—"}`; subtitle = item?.email || recordId;
      } else {
        record = await prisma.subscription.findUnique({ where: { id: recordId }, include: { user: { select: { id: true, name: true, email: true } }, tenantActive: true, tenantHistory: true, Plan: { include: { pricing: true, features: true } } } });
        const item = record as { planCode?: string | null; status?: string } | null; title = `${item?.planCode || "Subscription"} subscription`; subtitle = item?.status || recordId;
      }
    }

    if (!record) return Response.json({ error: "Record not found" }, { status: 404 });
    return Response.json({ title, subtitle, type, record });
  } catch (error) { return superAdminErrorResponse(error); }
}
