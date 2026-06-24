import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { renderPage } from "@buildez/publish-runtime";

export async function GET(
  req: Request,
  { params }: { params: { previewId: string; slug?: string[] } }
) {
  const slug = "/" + (params.slug?.join("/") || "");

  const snapshot = await db.siteSnapshot.findFirst({
    where: { status: "UNPUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { pages: true },
  });

  if (!snapshot) {
    return new NextResponse("Preview expired", { status: 404 });
  }

  const page = snapshot.pages.find((p) => p.slug === slug);
  if (!page) {
    return new NextResponse("Page not found", { status: 404 });
  }

  const html = await renderPage({
    page,
    siteSnapshot: snapshot,
  });

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html",
      "cache-control": "no-store",
      "x-preview-mode": "true",
    },
  });
}
