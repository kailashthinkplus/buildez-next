export function publishedSitePath(siteSlug: string, pageSlug?: string | null) {
  const base = `/${encodeURIComponent(siteSlug)}`;
  const normalized = pageSlug?.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized === "home") return base;
  return `${base}/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
