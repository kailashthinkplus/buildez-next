import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@buildez/db";
import { ensureV12PublishedBundle, publishedAssetPath } from "@/modules/runtime/v12PublishedBundle";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".woff": "font/woff", ".woff2": "font/woff2",
};

export async function GET(_request: Request, context: { params: Promise<{ siteId: string; asset?: string[] }> }) {
  const { siteId, asset = [] } = await context.params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, status: "PUBLISHED", deletedAt: null },
    select: { tenantId: true },
  });
  if (!site) return new Response("Website not found", { status: 404 });
  try {
    const outputRoot = await ensureV12PublishedBundle(siteId, site.tenantId);
    let filePath = publishedAssetPath(outputRoot, asset);
    try {
      if (!(await stat(filePath)).isFile()) throw new Error("Not a file");
    } catch {
      // Client-side routes receive the built application shell.
      filePath = path.join(outputRoot, "index.html");
    }
    const body = await readFile(filePath);
    return new Response(body, {
      headers: {
        "content-type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "cache-control": path.basename(filePath) === "index.html" ? "no-cache" : "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Website could not be loaded", { status: 500 });
  }
}
