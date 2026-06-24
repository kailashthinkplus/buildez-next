import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { apiHandler } from "@/lib/api/apiHandler";

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const tenant = await verifyTenantAccess(req);
  const { pageId } = await ctx.params;

  await prisma.page.update({
    where: { id: pageId },
    data: {
      deleted: false,
      deletedAt: null,
      deletedByUser: null,
    },
  });

  return { success: true };
});
