export function publishedSitePath(siteId: string, pageSlug?: string | null) {
  const base = `/site/${encodeURIComponent(siteId)}`;
  const normalized = pageSlug?.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized === "home") return base;
  return `${base}/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
