import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { createHash } from "node:crypto";

/* ============================================================
   GET MEDIA LIBRARY
============================================================ */

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");
    const query = searchParams.get("q")?.trim() ?? "";

    if (!siteId) {
      return NextResponse.json(
        { ok: false, error: "siteId required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        tenantId: tenant.id,
      },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json(
        { ok: false, error: "Site not found for this tenant" },
        { status: 404 }
      );
    }

    const assets = await prisma.mediaAsset.findMany({
      where: {
        siteId,
        ...(query
          ? {
              OR: [
                { filename: { contains: query, mode: "insensitive" } },
                { alt: { contains: query, mode: "insensitive" } },
                { title: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      ok: true,
      assets,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* ============================================================
   CREATE MEDIA ASSET
============================================================ */

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const {
      siteId,
      url,
      filename,
      fileHash,
      fileSize,
      mimeType,
      mediaType,
      width,
      height,
      source,
      provider,
      prompt,
      aspectRatio,
      thumbnailUrl,
      dominantColor,
      blurhash,
      tags = [],
    } = body;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        tenantId: tenant.id,
      },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json(
        { ok: false, error: "Site not found for this tenant" },
        { status: 404 }
      );
    }

    const scopedFileHash = createHash("sha256")
      .update(siteId)
      .update(":")
      .update(String(fileHash || url || filename))
      .digest("hex");

    const existing = await prisma.mediaAsset.findUnique({
      where: {
        fileHash: scopedFileHash,
      },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        asset: existing,
        duplicate: true,
      });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        siteId,
        uploadedById: user.id,
        url,
        filename,
        fileHash: scopedFileHash,
        fileSize,
        mimeType,
        mediaType,
        width,
        height,
        thumbnailUrl,
        source,
        provider,
        prompt,
        aspectRatio,
        dominantColor,
        blurhash,
        tags,
      },
    });

    return NextResponse.json({
      ok: true,
      asset,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        ok: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}
