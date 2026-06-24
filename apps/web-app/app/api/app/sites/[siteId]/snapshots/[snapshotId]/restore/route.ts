import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function POST(
  req: Request,
  { params }: { params: { snapshotId: string } }
) {
  try {
    const snapshot = await db.siteSnapshot.findUnique({
      where: { id: params.snapshotId },
      include: { pages: true },
    });

    if (!snapshot) throw new Error("Snapshot not found");

    for (const page of snapshot.pages) {
      await db.page.update({
        where: { id: page.pageId },
        data: {
          title: page.title,
          slug: page.slug,
          // content restore happens in editor store
        },
      });
    }

    await db.tenantEvent.create({
      data: {
        tenantId: snapshot.tenantId,
        type: "SITE_SNAPSHOT_RESTORED",
        payload: { snapshotId: snapshot.id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
