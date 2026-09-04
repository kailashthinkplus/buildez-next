import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

/* ============================================================
   R2 CLIENT — USE EXISTING ENV VARS
============================================================ */

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT, // ✅ EXACT MATCH
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/* ============================================================
   POST /api/uploads/image/init
============================================================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fileName, fileType, siteId } = body;

    /* ----------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------- */

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId required" },
        { status: 400 }
      );
    }

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType required" },
        { status: 400 }
      );
    }

    /* ----------------------------------------------------------
       AUTHORIZATION — the presigned URL below grants write access to
       this exact object key, so siteId must be verified to belong to
       the caller's own tenant before it's ever signed.
    ---------------------------------------------------------- */

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

    /* ----------------------------------------------------------
       OBJECT KEY (PER-SITE ISOLATION)
    ---------------------------------------------------------- */

    const key = `sites/${siteId}/images/${Date.now()}-${nanoid()}-${fileName}`;
    console.log("[R2:init] key:", key);

    /* ----------------------------------------------------------
       PRESIGNED PUT COMMAND
    ---------------------------------------------------------- */

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!, // ✅ EXACT MATCH
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 60, // seconds
    });

    console.log("[R2:init] uploadUrl:", uploadUrl);

    /* ----------------------------------------------------------
       PUBLIC URL (CUSTOM DOMAIN)
    ---------------------------------------------------------- */

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    console.log("[R2:init] publicUrl:", publicUrl);

    return NextResponse.json({
      uploadUrl,   // 👉 PUT here (r2.cloudflarestorage.com)
      publicUrl,   // 👉 <img src> uses this
    });
  } catch (err) {
    console.error("[R2:init] ❌ fatal error:", err);
    return NextResponse.json(
      { error: "Upload init failed" },
      { status: 500 }
    );
  }
}
