import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

export const POST = apiHandler(async (req: NextRequest) => {
  const tenantId = req.headers.get("x-tenant-id");
  if (!tenantId) throw new ApiError("UNAUTHORIZED");

  await verifyPermission(req, "createPage");

  const body = await req.json();
  const { templateId, siteId } = body;

  const template = await prisma.pageTemplate.findFirst({
    where: { id: templateId, tenantId },
  });

  if (!template) throw new ApiError("NOT_FOUND");

  const page = await prisma.page.create({
    data: {
      tenantId,
      siteId,
      title: template.title + " Copy",
      slug: template.slug + "-" + nanoid(4),
    },
  });

  await prisma.blueprint.create({
    data: {
      pageId: page.id,
      tenantId,
      siteId,
      data: template.data,
    },
  });

  return { success: true, page };
});
