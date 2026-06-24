import { apiHandler, ApiError } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";

export const POST = apiHandler(async (req: NextRequest) => {
  const tenantId = req.headers.get("x-tenant-id");
  await verifyPermission(req, "createPage");

  const body = await req.json();
  const { pageId } = body;

  const page = await prisma.page.findFirst({
    where: { id: pageId, tenantId },
  });
  if (!page) throw new ApiError("NOT_FOUND");

  const blueprint = await prisma.blueprint.findFirst({
    where: { pageId, tenantId },
  });

  const slug = `${page.slug}-copy-${nanoid(4)}`;

  const newPage = await prisma.page.create({
    data: {
      title: page.title + " Copy",
      slug,
      tenantId,
      siteId: page.siteId,
    },
  });

  await prisma.blueprint.create({
    data: {
      pageId: newPage.id,
      tenantId,
      siteId: page.siteId,
      data: blueprint?.data ?? {},
    },
  });

  return { success: true, page: newPage };
});
