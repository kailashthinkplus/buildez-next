import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { renderPage } from "@/lib/runtime/render-page";
import { AnalyticsTracker } from "@/modules/analytics/AnalyticsTracker";
import { SiteIntegrationsScripts } from "@/modules/integrations/SiteIntegrationsScripts";
import { SiteChatWidgets } from "@/modules/ai-channels/SiteChatWidgets";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { logBuilderDebug, summarizeSiteLayout } from "@/modules/builder-v2/debug/blueprintDebug";
import { defaultThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import { SiteThemeFrame } from "@/modules/builder-v2/theme/SiteThemeFrame";
import { createDefaultSiteThemeLayout, disableSiteThemeChrome, hasExplicitSiteThemeLayout, normalizeSiteThemeLayout } from "@/modules/builder-v2/theme/siteLayout";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";
import { PoweredByBuildez } from "@/modules/runtime/PoweredByBuildez";
import { shouldShowBuildezBranding } from "@/modules/runtime/publishedBranding";

export async function renderPublishedSitePage(siteSlug: string, pageSlug?: string, options?: { siteId?: string; preview?: boolean }) {
  const route = await resolvePublishedSiteRoute(siteSlug, pageSlug, options?.siteId);
  if (!route) notFound();
  if (route.maintenanceMode) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white"><div className="max-w-lg text-center"><p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-300">{route.siteName}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">We’ll be right back.</h1><p className="mt-4 leading-7 text-white/55">This website is being updated. Please check again shortly.</p></div></main>;
  }
  if (route.renderMode === "REACT" && route.hasV12Project) {
    const iframePath = `/api/runtime/v12/${encodeURIComponent(route.siteId)}/${route.pageSlug === "home" ? "" : route.pageSlug.split("/").map(encodeURIComponent).join("/")}`;
    const showBranding = await shouldShowBuildezBranding({ siteId: route.siteId, tenantId: route.tenantId });
    return <main className="relative h-screen w-full overflow-hidden bg-white"><AnalyticsTracker siteId={route.siteId}/><SiteIntegrationsScripts siteId={route.siteId}/><iframe title={`${route.siteName} website`} src={iframePath} className="h-full w-full border-0"/>{showBranding ? <PoweredByBuildez/> : null}</main>;
  }
  const result = await renderPage({ siteSlug, siteId: options?.siteId, pageSlug: route.pageSlug });
  if (!result) notFound();
  const showBranding = options?.preview
    ? false
    : await shouldShowBuildezBranding({ siteId: route.siteId, tenantId: route.tenantId });

  if (result.mode === "builder-v2") {
    const tokens = result.blueprint.theme?.tokens && typeof result.blueprint.theme.tokens === "object" && !Array.isArray(result.blueprint.theme.tokens)
      ? result.blueprint.theme.tokens as unknown as BuilderThemeTokens
      : defaultThemeTokens;
    const fallbackLayout = createDefaultSiteThemeLayout({ siteName: result.page.site.name, tokens, presetId: result.blueprint.theme?.preset ?? "buildez-default" });
    logBuilderDebug("runtime:builder-v2-layout-decision", { siteSlug, pageSlug, siteName: result.page.site.name, hasExplicitSiteLayout: hasExplicitSiteThemeLayout(result.siteLayout), rawSiteLayout: result.siteLayout, fallbackLayout: summarizeSiteLayout(fallbackLayout) });
    const hasExplicitLayout = hasExplicitSiteThemeLayout(result.siteLayout);
    const siteLayout = normalizeSiteThemeLayout(hasExplicitLayout ? result.siteLayout : null, hasExplicitLayout ? fallbackLayout : disableSiteThemeChrome(fallbackLayout));
    return <>{options?.preview ? null : <><AnalyticsTracker siteId={result.page.site.id}/><SiteIntegrationsScripts siteId={result.page.site.id}/></>}<PublishedPageRenderer blueprint={result.blueprint} siteLayout={siteLayout}/>{options?.preview ? null : <SiteChatWidgets siteId={result.page.site.id}/>} {showBranding ? <PoweredByBuildez/> : null}</>;
  }

  const legacyDesignTokens = result.designTokens && typeof result.designTokens === "object" && !Array.isArray(result.designTokens)
    ? result.designTokens as Record<string, unknown>
    : null;
  const legacyTokens = legacyDesignTokens ? legacyDesignTokens as unknown as BuilderThemeTokens : defaultThemeTokens;
  const legacyFallbackLayout = createDefaultSiteThemeLayout({
    siteName: result.page.site.name,
    tokens: legacyTokens,
    presetId: typeof legacyDesignTokens?.themePresetId === "string" ? legacyDesignTokens.themePresetId : "buildez-default",
  });
  logBuilderDebug("runtime:legacy-layout-decision", { siteSlug, pageSlug, siteName: result.page.site.name, hasExplicitSiteLayout: hasExplicitSiteThemeLayout(result.siteLayout), rawSiteLayout: result.siteLayout, fallbackLayout: summarizeSiteLayout(legacyFallbackLayout) });
  const hasExplicitLegacyLayout = hasExplicitSiteThemeLayout(result.siteLayout);
  const legacySiteLayout = normalizeSiteThemeLayout(hasExplicitLegacyLayout ? result.siteLayout : null, hasExplicitLegacyLayout ? legacyFallbackLayout : disableSiteThemeChrome(legacyFallbackLayout));
  return <>{options?.preview ? null : <><AnalyticsTracker siteId={result.page.site.id}/><SiteIntegrationsScripts siteId={result.page.site.id}/></>}<SiteThemeFrame layout={legacySiteLayout} tokens={legacyTokens}><style dangerouslySetInnerHTML={{ __html: result.css }} /><div id="buildez-preview-root" dangerouslySetInnerHTML={{ __html: result.html }} /></SiteThemeFrame>{options?.preview ? null : <SiteChatWidgets siteId={result.page.site.id}/>} {showBranding ? <PoweredByBuildez/> : null}</>;
}

export async function resolvePublishedSiteRoute(siteSlug: string, requestedPageSlug?: string, siteId?: string) {
  const candidates = await prisma.site.findMany({
    where: { slug: siteSlug, ...(siteId ? { id: siteId } : {}), status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      settings: true,
      v12Project: { select: { id: true } },
      pages: { where: { deletedAt: null, deleted: false, status: "PUBLISHED" }, orderBy: { createdAt: "asc" }, select: { id: true, slug: true, status: true, renderMode: true } },
    },
    take: siteId ? 1 : 2,
  });
  const site = candidates.length === 1 ? candidates[0] : null;
  if (!site) return null;
  const settings = site.settings && typeof site.settings === "object" && !Array.isArray(site.settings) ? site.settings as Record<string, unknown> : {};
  const frontPageId = typeof settings.frontPageId === "string" ? settings.frontPageId : "";
  const frontPage = site.pages.find((page) => page.id === frontPageId)
    || site.pages.find((page) => page.slug === "home")
    || site.pages.find((page) => page.status === "PUBLISHED")
    || site.pages[0];

  // Never fall back to a stale/deleted "home" page when the site
  // currently has no active published pages.
  if (!requestedPageSlug && !frontPage) return null;

  // An explicitly requested slug must also belong to an active
  // published page for this site.
  if (requestedPageSlug && !site.pages.some((page) => page.slug === requestedPageSlug)) {
    return null;
  }

  return {
    siteId: site.id,
    tenantId: site.tenantId,
    siteName: site.name,
    pageSlug: requestedPageSlug || frontPage!.slug,
    renderMode: (requestedPageSlug ? site.pages.find((page) => page.slug === requestedPageSlug) : frontPage)!.renderMode,
    hasV12Project: Boolean(site.v12Project),
    maintenanceMode: settings.maintenanceMode === true,
  };
}
