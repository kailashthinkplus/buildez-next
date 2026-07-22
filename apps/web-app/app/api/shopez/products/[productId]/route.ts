import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop, money, shopHandle } from "@/lib/shopez";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  const { productId } = await params;
  if (!access) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const product = await prisma.shopProduct.findFirst({ where: { id: productId, shopId: access.shop.id }, include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } }, options: { orderBy: { position: "asc" } } } });
  return product ? NextResponse.json({ product }) : NextResponse.json({ error: "Product not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const body = await req.json().catch(() => null); const { productId } = await params;
  const access = body && await authorizedShop(req, body.siteId || "");
  const existing = access && await prisma.shopProduct.findFirst({ where: { id: productId, shopId: access.shop.id } });
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const product = await prisma.$transaction(async tx => {
    await tx.shopProductImage.deleteMany({ where: { productId } }); await tx.shopProductOption.deleteMany({ where: { productId } }); await tx.shopProductVariant.deleteMany({ where: { productId } });
    return tx.shopProduct.update({ where: { id: productId }, data: { title: String(body.title || existing.title), handle: shopHandle(body.handle || existing.handle), description: body.description || "", vendor: body.vendor || null, productType: body.productType || null, status: body.status || existing.status, tags: body.tags || [], seoTitle: body.seoTitle || null, seoDescription: body.seoDescription || null, trackQuantity: body.trackQuantity !== false, continueSelling: Boolean(body.continueSelling), images: { create: (body.images || []).map((url: string, position: number) => ({ url, position })) }, options: { create: (body.options || []).map((o: { name: string; values: string[] }, position: number) => ({ name: o.name, values: o.values, position })) }, variants: { create: (body.variants || []).map((v: Record<string, unknown>, position: number) => ({ title: String(v.title || "Default"), sku: v.sku ? String(v.sku) : null, barcode: v.barcode ? String(v.barcode) : null, price: money(v.price), compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null, cost: v.cost ? money(v.cost) : null, inventory: Math.max(0, Number(v.inventory) || 0), weightGrams: v.weightGrams ? Number(v.weightGrams) : null, optionValues: (v.optionValues || undefined) as object | undefined, position })) } }, include: { images: true, options: true, variants: true } });
  });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params; const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  const product = access && await prisma.shopProduct.findFirst({ where: { id: productId, shopId: access.shop.id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  await prisma.shopProduct.delete({ where: { id: product.id } }); return NextResponse.json({ success: true });
}
