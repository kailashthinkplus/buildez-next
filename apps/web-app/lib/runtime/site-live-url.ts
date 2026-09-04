/**
 * If a verified custom domain is available, returns the live URL on that
 * domain instead of the given platform-origin URL. `pageSlug` should be the
 * SAME page slug/undefined that was used to build `platformUrl`, so the
 * path on the custom domain matches (custom domains serve pages at their
 * own root, e.g. https://www.example.com/about — no site-slug segment).
 */
export function withVerifiedDomainOverride(
  platformUrl: string,
  verifiedDomain: string | null | undefined,
  pageSlug?: string | null,
): string {
  if (!verifiedDomain) return platformUrl;
  const normalized = pageSlug?.trim().replace(/^\/+|\/+$/g, "");
  const path = !normalized || normalized === "home" ? "" : `/${normalized.split("/").map(encodeURIComponent).join("/")}`;
  return `https://${verifiedDomain}${path}`;
}
