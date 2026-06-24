export async function resolveRuntimeRequest({
  host,
  pathname,
}: {
  host: string;
  pathname: string;
}) {
  // 1. Resolve domain → site
  const site = await resolveSiteByHost(host);

  if (!site) return { status: 404 };

  // 2. Get latest published snapshot
  const snapshot = await getActiveSnapshot(site.id);

  if (!snapshot) return { status: 404 };

  // 3. Resolve page
  const slug = pathname === "/" ? "index" : pathname.slice(1);

  const page = await getRenderedPage(snapshot.id, slug);

  if (!page) return { status: 404 };

  return {
    status: 200,
    html: page.html,
    headers: {
      "Content-Type": "text/html",
      "X-Site-Id": site.id,
      "X-Snapshot-Version": snapshot.version,
    },
  };
}
