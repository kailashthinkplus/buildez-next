import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";

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

  void templateId;
  throw new Error("Page templates are not available in the current database schema");
});
