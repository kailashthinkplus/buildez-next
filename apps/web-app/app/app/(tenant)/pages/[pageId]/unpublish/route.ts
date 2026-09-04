// /app/api/pages/[pageId]/unpublish/route.ts
import { apiHandler } from "@/lib/api/apiHandler";
import { NotFoundError } from "@/lib/api/errors";
import { prisma } from "@buildez/db";
import { requirePermission } from "@/lib/auth/permissions";
import { revalidatePage } from "@/lib/snapshots/revalidatePage";

export const POST = apiHandler(async ({ auth, params }) => {
  const pageId = params?.pageId;
  if (!pageId) throw new NotFoundError();
  requirePermission();

  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { tenantId: auth.tenant.id } },
  });

  if (!page) throw new NotFoundError();

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { status: "DRAFT", publishedAt: null },
  });

  // Revalidate so public runtime serves “unpublished” page
  await revalidatePage(pageId);

  return { success: true, page: updated };
});
