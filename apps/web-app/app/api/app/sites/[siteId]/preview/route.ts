import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { requireTenantEditor } from "@/lib/preview/auth";
import { generatePreviewToken } from "@/lib/preview/token";

export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = params;
    const { tenantId } = await requireTenantEditor(siteId);

    const pages = await db.page.findMany({
      where: { siteId, deletedAt: null },
    });

    const latest = await db.siteSnapshot.findFirst({
      where: { siteId },
      orderBy: { version: "desc" },
    });

    const snapshot = await db.siteSnapshot.create({
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
            content: {}, // editor JSON here
          })),
        },
      },
    });

    const previewId = generatePreviewToken();

    await db.tenantEvent.create({
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
