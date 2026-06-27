import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";
import { nanoid } from "nanoid";

export const POST = apiHandler(async ({ req, auth }) => {
  const body = await req.json();
  const { pageId } = body;

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      site: {
        tenantId: auth.tenant.id,
      },
    },
  });
  if (!page) throw new Error("Page not found");

  const blueprint = await prisma.blueprint.findFirst({
    where: {
      pageId,
      tenantId: auth.tenant.id,
    },
  });

  const baseSlug = `${page.slug}-copy`;
  let slug = `${baseSlug}-${nanoid(4)}`;

  while (
    await prisma.page.findFirst({
      where: {
        siteId: page.siteId,
        slug,
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${nanoid(4)}`;
  }

  const newPage = await prisma.page.create({
    data: {
      title: page.title + " Copy",
      slug,
      siteId: page.siteId,
      status: "DRAFT",
    },
  });

  await prisma.blueprint.create({
    data: {
      pageId: newPage.id,
      tenantId: auth.tenant.id,
      siteId: page.siteId,
      data: blueprint?.data ?? {},
    },
  });

  return { success: true, page: newPage };
});
