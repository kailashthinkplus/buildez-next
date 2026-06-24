import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function DELETE(
  req: Request,
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

    const { assetId } = await context.params;

    const asset = await prisma.mediaAsset.findUnique({
      where: {
        id: assetId,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    await prisma.mediaAsset.delete({
      where: {
        id: assetId,
      },
    });

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
