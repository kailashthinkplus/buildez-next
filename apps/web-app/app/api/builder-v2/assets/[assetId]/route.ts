import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { deleteFromR2Url } from "@/lib/storage/uploadToR2";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ assetId: string }> }
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await verifyTenantAccess(req);
    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized tenant access" },
        { status: 403 }
      );
    }

    const { assetId } = await context.params;

    const asset = await prisma.mediaAsset.findFirst({
      where: {
        id: assetId,
        site: {
          tenantId: tenant.id,
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    await prisma.mediaAsset.delete({ where: { id: assetId } });

    await Promise.allSettled([
      deleteFromR2Url(asset.url),
      deleteFromR2Url(asset.thumbnailUrl),
    ]);

    return NextResponse.json({
      ok: true,
      deleted: true,
    });
  } catch (err: any) {
    console.error("[builder-v2/assets/:assetId] delete error", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Delete failed",
      },
      { status: 500 }
    );
  }
}
