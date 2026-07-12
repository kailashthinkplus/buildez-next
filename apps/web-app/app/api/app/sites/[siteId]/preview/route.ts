import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { requireTenantEditor } from "@/lib/preview/auth";
import { generatePreviewToken } from "@/lib/preview/token";
import { prisma } from "@buildez/db";

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = params;
    const { tenantId } = await requireTenantEditor(siteId);

    const pages = await prisma.page.findMany({
      where: { siteId, deletedAt: null, deleted: false },
      include: { blueprint: { select: { data: true } } },
    });

    const latest = await prisma.siteSnapshot.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
    });

    const snapshot = await prisma.siteSnapshot.create({
      data: {
        siteId,
        tenantId,
        status: "UNPUBLISHED",
        version: (latest?.version || 0) + 1,
        pages: {
          create: pages.map((p) => ({
            pageId: p.id,
            title: p.title,
            slug: p.slug,
            content: p.blueprint?.data ?? {},
          })),
        },
      },
    });

    const previewId = generatePreviewToken();

    await prisma.tenantEvent.create({
      data: {
        tenantId,
        type: "SITE_PREVIEW_CREATED",
        payload: { siteId, snapshotId: snapshot.id },
      },
    });

    return NextResponse.json({
      previewUrl: `/preview/${previewId}`,
      snapshotId: snapshot.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
