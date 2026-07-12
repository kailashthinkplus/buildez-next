import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@buildez/db";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteFromR2Url, uploadToR2 } from "@/lib/storage/uploadToR2";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
    if (!TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image" }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Profile photo must be 5 MB or smaller" }, { status: 400 });

    const image = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate().resize(512, 512, { fit: "cover", position: "attention" })
      .webp({ quality: 85, effort: 5 }).toBuffer();
    const key = `users/${user.id}/profile/${Date.now()}-${randomUUID()}.webp`;
    const avatarUrl = await uploadToR2({ buffer: image, key, contentType: "image/webp" });
    const previousUrl = user.avatarUrl;
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });
    await deleteFromR2Url(previousUrl).catch(error => console.error("Could not remove previous avatar", error));
    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Profile avatar upload failed", error);
    return NextResponse.json({ error: "Unable to upload profile photo" }, { status: 500 });
  }
}
