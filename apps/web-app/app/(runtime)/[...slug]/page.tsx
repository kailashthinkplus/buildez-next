import { metadataForSite } from "@/lib/site-metadata";
import { renderPublishedSitePage, resolvePublishedSiteRoute } from "@/modules/runtime/renderPublishedSitePage";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const parts = (await props.params).slug || [];
  const siteSlug = parts[0] || "";
  const route = siteSlug ? await resolvePublishedSiteRoute(siteSlug, parts[1]) : null;
  return route ? metadataForSite(siteSlug, route.pageSlug) : {};
}

export default async function PublicRuntimePage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await props.params;
  const parts = resolvedParams.slug ?? [];

  const siteSlug = parts[0];
  const pageSlug = parts[1];

  // Never choose a tenant website for an incomplete public URL. Doing so used
  // to expose the oldest published site to unrelated and newly-created users.
  if (!siteSlug) return null;
  return renderPublishedSitePage(siteSlug, pageSlug);
}
