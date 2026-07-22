import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedShop, money, shopHandle } from "@/lib/shopez";

export async function GET(req: NextRequest) {
  const access = await authorizedShop(req, req.nextUrl.searchParams.get("siteId") || "");
  if (!access) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const q = req.nextUrl.searchParams.get("q") || "";
  const products = await prisma.shopProduct.findMany({
    where: { shopId: access.shop.id, OR: q ? [{ title: { contains: q, mode: "insensitive" } }, { vendor: { contains: q, mode: "insensitive" } }] : undefined },
    include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } }, collections: { include: { collection: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ shop: access.shop, products });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const access = body && await authorizedShop(req, body.siteId || "");
  if (!access || !body.title?.trim()) return NextResponse.json({ error: "A product title is required" }, { status: 400 });
  const base = shopHandle(body.handle || body.title) || `product-${Date.now()}`;
  let handle = base, suffix = 1;
  while (await prisma.shopProduct.findUnique({ where: { shopId_handle: { shopId: access.shop.id, handle } } })) handle = `${base}-${++suffix}`;
  const product = await prisma.shopProduct.create({
    data: {
      shopId: access.shop.id, title: body.title.trim(), handle, description: body.description || "", vendor: body.vendor || null,
      productType: body.productType || null, status: body.status || "DRAFT", tags: Array.isArray(body.tags) ? body.tags : [],
      images: { create: (body.images || []).filter((x: string) => /^https?:\/\//.test(x)).map((url: string, position: number) => ({ url, position })) },
      options: { create: (body.options || []).map((o: { name: string; values: string[] }, position: number) => ({ name: o.name, values: o.values, position })) },
      variants: { create: (body.variants?.length ? body.variants : [{ title: "Default", price: body.price || 0, inventory: body.inventory || 0 }]).map((v: Record<string, unknown>, position: number) => ({ title: String(v.title || "Default"), sku: v.sku ? String(v.sku) : null, price: money(v.price), compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null, inventory: Math.max(0, Number(v.inventory) || 0), optionValues: (v.optionValues || undefined) as object | undefined, position })) },
    }, include: { images: true, variants: true, options: true },
  });
  return NextResponse.json({ product }, { status: 201 });
}
