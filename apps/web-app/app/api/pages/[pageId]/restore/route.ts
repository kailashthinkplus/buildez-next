import { NextRequest } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ pageId: string }> }
) {
  return apiHandler(async ({ auth }) => {
    const { pageId } = await context.params;

    await prisma.page.updateMany({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      data: {
        deleted: false,
        deletedAt: null,
        deletedByUser: null,
      },
    });

    return { success: true };
  })(req, context);
}
