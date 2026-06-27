import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { nanoid } from "nanoid";

export const POST = apiHandler(async ({ req, auth }) => {
  const body = await req.json();
  const { templateId, siteId } = body;

  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      tenantId: auth.tenant.id,
    },
    select: { id: true },
  });

  if (!site) throw new Error("Site not found");

  const template = await prisma.pageTemplate.findFirst({
    where: { id: templateId, tenantId: auth.tenant.id },
  });

  if (!template) throw new Error("Template not found");

  const page = await prisma.page.create({
    data: {
      siteId,
      title: template.title + " Copy",
      slug: template.slug + "-" + nanoid(4),
    },
  });

  await prisma.blueprint.create({
    data: {
      pageId: page.id,
      tenantId: auth.tenant.id,
      siteId,
      data: template.data,
    },
  });

  return { success: true, page };
});
