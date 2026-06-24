// /app/api/pages/[pageId]/settings/route.ts
import { NextRequest } from "next/server";
import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";

export const PUT = apiHandler(async (req: NextRequest, { params }) => {
  const { pageId } = await ctx.params;
  const body = await req.json();

  await verifyPermission(req, "editPage");

  const tenantId = req.headers.get("x-tenant-id");

  const page = await prisma.page.findFirst({
    where: { id: pageId, tenantId },
  });

  if (!page) throw new ApiError("NOT_FOUND");

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: {
      title: body.title,
      slug: body.slug,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
    },
  });

  return { success: true, page: updated };
});
