// /packages/runtime/resolver/resolveRuntimeRequest.ts

import { resolveSiteByHost } from "./resolveSiteByHost";
import { getActiveSnapshot } from "../snapshots/getActiveSnapshot";
import { getRenderedPage } from "../render/getRenderedPage";

export async function resolveRuntimeRequest({
  host,
  pathname,
}: {
  host: string;
  pathname: string;
}) {
  // ----------------------------------
  // 1. Resolve site
  // ----------------------------------
  const site = await resolveSiteByHost(host);

  if (!site) {
    return { status: 404 };
  }

  // ----------------------------------
  // 2. Get active snapshot
  // ----------------------------------
  const snapshot = await getActiveSnapshot(site.id);

  if (!snapshot) {
    return { status: 404 };
  }

  // ----------------------------------
  // 3. Resolve page slug
  // ----------------------------------
  const slug =
    pathname === "/" || pathname === ""
      ? "index"
      : pathname.replace(/^\/+/, "");

  const page = await getRenderedPage(snapshot.id, slug);

  if (!page) {
    return { status: 404 };
  }

  // ----------------------------------
  // 4. Return HTML
  // ----------------------------------
  return {
    status: 200,
    html: page.html,
    headers: {
      "Content-Type": "text/html",
      "X-Site-Id": site.id,
      "X-Snapshot-Version": String(snapshot.version),
    },
  };
}
