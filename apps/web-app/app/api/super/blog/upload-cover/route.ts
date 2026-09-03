import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";
import { uploadToR2 } from "@/lib/storage/uploadToR2";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
    if (!TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Cover image must be 5 MB or smaller" }, { status: 400 });

    const image = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1600, 900, { fit: "cover", position: "attention" })
      .webp({ quality: 85, effort: 5 })
      .toBuffer();
    const key = `blog/covers/${Date.now()}-${randomUUID()}.webp`;
    const url = await uploadToR2({ buffer: image, key, contentType: "image/webp" });

    return NextResponse.json({ url });
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
