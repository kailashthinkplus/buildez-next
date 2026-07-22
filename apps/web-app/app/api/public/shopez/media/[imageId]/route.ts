import { prisma } from "@buildez/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, props: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await props.params;
  const image = await prisma.shopProductImage.findFirst({
    where: { id: imageId, product: { status: "ACTIVE", shop: { isPublished: true } } },
    select: { url: true },
  });
  if (!image?.url || !/^https?:\/\//i.test(image.url)) return NextResponse.json({ error: "Product image not found" }, { status: 404 });
  return NextResponse.redirect(image.url, { status: 307, headers: { "Cache-Control": "public, max-age=3600" } });
}
