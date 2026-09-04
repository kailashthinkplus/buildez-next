import { metadataForSite } from "@/lib/site-metadata";
import { renderPublishedSitePage, resolvePublishedSiteRoute } from "@/modules/runtime/renderPublishedSitePage";
import Storefront from "@/app/store/Storefront";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const parts = (await props.params).slug || [];
  const siteSlug = parts[0] || "";
  const route = siteSlug ? await resolvePublishedSiteRoute(siteSlug, parts.slice(1).join("/") || undefined) : null;
  return route ? metadataForSite(siteSlug, route.pageSlug) : {};
}

export default async function PublicRuntimePage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await props.params;
  const parts = resolvedParams.slug ?? [];

  const siteSlug = parts[0];
  const rest = parts.slice(1);

  // Never choose a tenant website for an incomplete public URL. Doing so used
  // to expose the oldest published site to unrelated and newly-created users.
  if (!siteSlug) return null;

  // Commerce is one channel on the same site, not the owner of it.
  if (rest[0] === "shop") {
    return (
      <Storefront
        lookup={{ siteSlug, path: rest.slice(1) }}
        basePath={`/${siteSlug}/shop`}
        siteHomeHref={`/${siteSlug}`}
      />
    );
  }

  const pageSlug = rest.join("/") || undefined;
  return renderPublishedSitePage(siteSlug, pageSlug);
}
