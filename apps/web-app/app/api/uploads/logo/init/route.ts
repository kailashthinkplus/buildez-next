import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

/* ============================================================
   LOGO UPLOAD INIT — PRESIGNED PUT (R2)
============================================================ */

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // ✅ FIXED
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,       // ✅ FIXED
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!, // ✅ FIXED
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const siteId = body?.siteId as string | undefined;
    const fileName = body?.fileName as string | undefined;
    const fileType = body?.fileType as string | undefined;

    if (!siteId || !fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing siteId, fileName or fileType" },
        { status: 400 }
      );
    }

    // AUTHORIZATION — the logo object key is deterministic (logos/{siteId}.{ext}),
    // so without this check any authenticated user could overwrite another
    // tenant's live site logo by passing that tenant's siteId.
    const tenant = await verifyTenantAccess(req);
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId: tenant.id, deletedAt: null },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const ext = fileName.split(".").pop() || "webp";
    const key = `logos/${siteId}.${ext}`;

    // 🔍 HARD SAFETY LOG
    console.log("[R2 ENV CHECK]", {
      bucket: process.env.R2_BUCKET,
      endpoint: process.env.R2_ENDPOINT,
    });

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!, // ✅ FIXED (THIS WAS THE CRASH)
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    console.log("[LOGO UPLOAD INIT OK]", {
      siteId,
      key,
      publicUrl,
    });

    return NextResponse.json({
      uploadUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("[LOGO UPLOAD INIT ERROR]", err);
    return NextResponse.json(
      { error: "Upload init failed" },
      { status: 500 }
    );
  }
}
