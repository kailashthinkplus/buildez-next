// /app/api/pages/[pageId]/unpublish/route.ts
import { NextRequest } from "next/server";
import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import { revalidatePage } from "@/lib/snapshots/revalidatePage";

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const { pageId } = await ctx.params;
  await verifyPermission(req, "publishPage");

  const tenantId = req.headers.get("x-tenant-id");

  const page = await prisma.page.findFirst({
    where: { id: pageId, tenantId },
  });

  if (!page) throw new ApiError("NOT_FOUND");

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { published: false },
  });

  // Revalidate so public runtime serves “unpublished” page
  await revalidatePage(pageId);

  return { success: true, page: updated };
});
