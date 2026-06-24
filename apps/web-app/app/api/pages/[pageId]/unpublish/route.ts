import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import { NextRequest } from "next/server";

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const { pageId } = await ctx.params;
  const tenantId = req.headers.get("x-tenant-id");

  await verifyPermission(req, "publishPage");

  const updated = await prisma.page.update({
    where: { id: pageId, tenantId },
    data: { published: false },
  });

  return { success: true, page: updated };
});
