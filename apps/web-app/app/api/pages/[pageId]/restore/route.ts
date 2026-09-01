import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";
import { restoreDesignTokens } from "@/modules/pages/designTokenRegistration";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  return apiHandler(async ({ auth }) => {
    const result = await prisma.$transaction(async (tx) => {
      const page = await tx.page.findFirst({
        where: {
          id: pageId,
          deleted: true,
          deletedAt: { not: null },
          site: {
            tenantId: auth.tenant.id,
          },
        },
        select: {
          id: true,
          slug: true,
          siteId: true,
          site: {
            select: {
              designTokens: true,
              settings: true,
            },
          },
        },
      });

      if (!page) return null;

      await tx.page.update({
        where: { id: page.id },
        data: {
          deleted: false,
          deletedAt: null,
          deletedByUser: null,
        },
      });

      const dormant = restoreDesignTokens(page.site.settings);
      const shouldRestoreDesignTokens =
        page.site.designTokens == null && dormant.designTokens != null;

      if (shouldRestoreDesignTokens) {
        await tx.site.update({
          where: { id: page.siteId },
          data: {
            designTokens: dormant.designTokens as Prisma.InputJsonValue,
            settings:
              dormant.settings == null
                ? Prisma.DbNull
                : (dormant.settings as Prisma.InputJsonValue),
          },
        });
      }

      return {
        designTokensEnabled: shouldRestoreDesignTokens,
      };
    });

    if (!result) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return {
      success: true,
      designTokensEnabled: result.designTokensEnabled,
    };
  })(request);
}
