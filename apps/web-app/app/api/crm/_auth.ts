import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

export async function authorizedSite(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant || !siteId) return null;
  return prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null } });
}
export const notFound = () => NextResponse.json({ error: "Unauthorized or site not found" }, { status: 404 });
