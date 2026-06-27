// /app/api/pages/[pageId]/settings/route.ts
import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/apiHandler";
import { prisma } from "@buildez/db";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ pageId: string }> }
) => {
  return apiHandler(async ({ auth }) => {
    const { pageId } = await context.params;
    const body = await req.json();

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          tenantId: auth.tenant.id,
        },
      },
    });

    if (!page) throw new Error("Page not found");

    const metadata = asRecord(page.metadata);

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        title: body.title,
        slug: body.slug,
        metadata: {
          ...metadata,
          seoTitle: body.seoTitle || "",
          seoDescription: body.seoDescription || "",
        },
      },
    });

    return { success: true, page: updated };
  })(req, context);
};
