// /packages/runtime/src/resolveRuntimeRequest.ts

import { prisma } from "@buildez/db";
import { resolveDomain } from "./resolver/resolveDomain";
import { getActiveSnapshot } from "./resolver/getActiveSnapshot";
import { getRenderedPage } from "./resolver/getRenderedPage";

/* ======================================================================
   RUNTIME REQUEST RESOLVER
   This handles ALL public website requests via custom domains,
   buildEZ subdomains, and preview domains.
====================================================================== */
export async function resolveRuntimeRequest({
  host,
  pathname,
}: {
  host: string;
  pathname: string;
}) {
  console.log("🌐 Runtime request:", host, pathname);

  /* ------------------------------------------------------------
     1. RESOLVE DOMAIN
  ------------------------------------------------------------ */
  const ctx = await resolveDomain(host);

  if (!ctx) {
    return {
      status: 404,
      html: "<h1>404 — Site Not Found</h1>",
      headers: { "Content-Type": "text/html" },
    };
  }

  // Preview domain → delegate to preview runtime
  if (ctx.isPreviewDomain) {
    return {
      status: 302,
      redirect: `/api/runtime/preview/resolve?host=${host}&path=${pathname}`,
    };
  }

  const { siteId } = ctx;

  /* ------------------------------------------------------------
     2. GET ACTIVE SNAPSHOT
  ------------------------------------------------------------ */
  const snapshot = await getActiveSnapshot(siteId);

  if (!snapshot) {
    return {
      status: 404,
      html: "<h1>No Published Version</h1>",
      headers: { "Content-Type": "text/html" },
    };
  }

  // BLOCKED SITE (compliance module)
  if (snapshot.status === "BLOCKED") {
    return {
      status: 451,
      html: "<h1>Site Blocked for Policy Violations</h1>",
      headers: { "Content-Type": "text/html" },
    };
  }

  // UNPUBLISHED → treat like 404
  if (snapshot.status !== "PUBLISHED") {
    return {
      status: 404,
      html: "<h1>404 — Not Published</h1>",
      headers: { "Content-Type": "text/html" },
    };
  }

  /* ------------------------------------------------------------
     3. RESOLVE RENDERED PAGE
  ------------------------------------------------------------ */
  const slug =
    pathname === "/" || pathname === "" ? "index" : pathname.replace(/^\//, "");

  const page = await getRenderedPage(snapshot.id, slug);

  if (!page) {
    return {
      status: 404,
      html: "<h1>404 — Page Not Found</h1>",
      headers: { "Content-Type": "text/html" },
    };
  }

  /* ------------------------------------------------------------
     4. RETURN RUNTIME RESULT
  ------------------------------------------------------------ */
  return {
    status: 200,
    html: page.html,
    headers: {
      "Content-Type": "text/html",
      "X-Site-Id": siteId,
      "X-Snapshot-Version": String(snapshot.version),
      "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=300",
      ETag: `"${page.contentHash}"`,
    },
  };
}
