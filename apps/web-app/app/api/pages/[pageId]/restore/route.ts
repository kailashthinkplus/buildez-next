import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { apiHandler } from "@/lib/api/apiHandler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  return apiHandler(async ({ auth }) => {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
      select: {
        id: true,
        slug: true,
        siteId: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.page.update({
      where: { id: page.id },
      data: {
        deleted: false,
        deletedAt: null,
        deletedByUser: null,
      },
    });

    return {
      success: true,
    };
  })(request);
}