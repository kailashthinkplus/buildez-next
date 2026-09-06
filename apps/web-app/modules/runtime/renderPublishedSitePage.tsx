import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { renderPage } from "@/lib/runtime/render-page";
import { cachedOrStale } from "@/lib/runtime/routeCache";

const ROUTE_CACHE_TTL_MS = 30_000;
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
import { PublishedV12Frame } from "@/modules/runtime/PublishedV12Frame";
import { shouldShowBuildezBranding } from "@/modules/runtime/publishedBranding";
import { CookieConsentBanner } from "@/modules/legal/CookieConsentBanner";

export async function renderPublishedSitePage(siteSlug: string, pageSlug?: string, options?: { siteId?: string; preview?: boolean }) {
  const route = await resolvePublishedSiteRoute(siteSlug, pageSlug, options?.siteId);
  if (!route) notFound();
  const cookieBannerEnabled = route.settings.cookieBannerEnabled !== false;
  const cookieMessage = typeof route.settings.cookieMessage === "string" && route.settings.cookieMessage.trim()
    ? route.settings.cookieMessage
    : "We use cookies to improve your experience.";
  const siteCookieBanner = options?.preview || !cookieBannerEnabled
    ? null
    : <CookieConsentBanner storageKey={`buildez_cookie_consent_site_${route.siteId}`} brandName={route.siteName} message={cookieMessage} />;
  if (route.maintenanceMode) {
    return <SiteTemporarilyDown siteName={route.siteName} />;
  }
  if (route.renderMode === "REACT" && route.hasV12Project) {
    const iframeBase = `/api/runtime/v12/${encodeURIComponent(route.siteId)}`;
    const iframePath = route.pageSlug === "home"
      ? iframeBase
      : `${iframeBase}/${route.pageSlug.split("/").map(encodeURIComponent).join("/")}`;
    const showBranding = await shouldShowBuildezBranding({ siteId: route.siteId, tenantId: route.tenantId });
    return <main className="relative h-screen w-full overflow-hidden bg-white">{options?.preview ? null : <StructuredData siteName={route.siteName} settings={route.settings}/>}<AnalyticsTracker siteId={route.siteId}/><SiteIntegrationsScripts siteId={route.siteId}/><PublishedV12Frame title={`${route.siteName} website`} iframePath={iframePath} currentPageSlug={route.pageSlug}/>{showBranding ? <PoweredByBuildez/> : null}{siteCookieBanner}</main>;
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
    return <>{options?.preview ? null : <><StructuredData siteName={route.siteName} settings={route.settings}/><AnalyticsTracker siteId={result.page.site.id}/><SiteIntegrationsScripts siteId={result.page.site.id}/></>}<PublishedPageRenderer blueprint={result.blueprint} siteLayout={siteLayout} showBranding={showBranding}/><PageCustomCode css={result.page.customCss} js={result.page.customJs}/>{options?.preview ? null : <SiteChatWidgets siteId={result.page.site.id}/>}{siteCookieBanner}</>;
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
  return <>{options?.preview ? null : <><StructuredData siteName={route.siteName} settings={route.settings}/><AnalyticsTracker siteId={result.page.site.id}/><SiteIntegrationsScripts siteId={result.page.site.id}/></>}<SiteThemeFrame layout={legacySiteLayout} tokens={legacyTokens} showBranding={showBranding}><style dangerouslySetInnerHTML={{ __html: result.css }} /><div id="buildez-preview-root" dangerouslySetInnerHTML={{ __html: result.html }} /></SiteThemeFrame><PageCustomCode css={result.page.customCss} js={result.page.customJs}/>{options?.preview ? null : <SiteChatWidgets siteId={result.page.site.id}/>}{siteCookieBanner}</>;
}

/**
 * Organization/WebSite JSON-LD for the published site — feeds the site name,
 * canonical URL, social share image, and social profile links (settings the
 * Social/SEO tabs already save but that otherwise go unused) to search and
 * AI answer engines as machine-readable facts about the site.
 */
function StructuredData({ siteName, settings }: { siteName: string; settings: Record<string, unknown> }) {
  const url = typeof settings.canonicalUrl === "string" ? settings.canonicalUrl : "";
  const description = typeof settings.seoDescription === "string" ? settings.seoDescription : "";
  const logo = typeof settings.socialImageUrl === "string" ? settings.socialImageUrl : "";
  const sameAs = [settings.facebookUrl, settings.instagramUrl, settings.linkedinUrl]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteName,
        ...(url ? { url } : {}),
        ...(logo ? { logo } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        name: siteName,
        ...(url ? { url } : {}),
        ...(description ? { description } : {}),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

/**
 * Renders a page's saved custom CSS/JS (Builder3Canvas's Custom Code modal,
 * persisted via PATCH /api/pages/[pageId]/custom-code). Only the V12/REACT
 * render path had its own injection mechanism before this; BLUEPRINT-mode
 * pages saved custom code that was never actually applied on the live site.
 */
function PageCustomCode({ css, js }: { css: string | null; js: string | null }) {
  if (!css && !js) return null;
  return <>{css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}{js ? <script dangerouslySetInnerHTML={{ __html: js }} /> : null}</>;
}

export async function resolvePublishedSiteRoute(siteSlug: string, requestedPageSlug?: string, siteId?: string) {
  // Deliberately not filtered by status: "PUBLISHED" here — an
  // unpublished (DRAFT) site must still resolve so it can show the
  // "temporarily down" page below, the same as an explicit
  // maintenanceMode toggle. A site that truly doesn't exist (wrong
  // slug/domain, or soft-deleted) is the only case that falls through
  // to null and a real 404.
  const candidates = await cachedOrStale(`route:${siteSlug}:${siteId ?? ""}`, ROUTE_CACHE_TTL_MS, () => prisma.site.findMany({
    where: { slug: siteSlug, ...(siteId ? { id: siteId } : {}), deletedAt: null },
    select: {
      id: true,
      tenantId: true,
      name: true,
      status: true,
      settings: true,
      v12Project: { select: { id: true } },
      pages: { where: { deletedAt: null, deleted: false, status: "PUBLISHED" }, orderBy: { createdAt: "asc" }, select: { id: true, slug: true, status: true, renderMode: true } },
    },
    take: siteId ? 1 : 2,
  }));
  const site = candidates.length === 1 ? candidates[0] : candidates.find((candidate) => candidate.status === "PUBLISHED") ?? null;
  if (!site) return null;
  const settings = site.settings && typeof site.settings === "object" && !Array.isArray(site.settings) ? site.settings as Record<string, unknown> : {};
  const down = site.status !== "PUBLISHED" || settings.maintenanceMode === true;

  if (down) {
    return {
      siteId: site.id,
      tenantId: site.tenantId,
      siteName: site.name,
      pageSlug: requestedPageSlug || "home",
      renderMode: "REACT" as const,
      hasV12Project: Boolean(site.v12Project),
      maintenanceMode: true,
      settings,
    };
  }

  const frontPageId = typeof settings.frontPageId === "string" ? settings.frontPageId : "";
  const frontPage = site.pages.find((page) => page.id === frontPageId)
    || site.pages.find((page) => page.slug === "home")
    || site.pages.find((page) => page.status === "PUBLISHED")
    || site.pages[0];

  const requestedPage = requestedPageSlug
    ? site.pages.find((page) => page.slug === requestedPageSlug)
    : undefined;

  // V12 websites are client-routed applications. Their internal routes can
  // exist in the published React project without separate Page records, so a
  // direct visit or shared URL must still reach the SPA shell. Legacy/native
  // sites retain the stricter page-record check.
  if (requestedPageSlug && !requestedPage && !site.v12Project) return null;

  // Never fall back to a stale/deleted "home" page when a legacy/native site
  // has no active published pages. A published V12 bundle owns its own root.
  if (!requestedPageSlug && !frontPage && !site.v12Project) return null;

  const resolvedPage = requestedPage || frontPage;

  return {
    siteId: site.id,
    tenantId: site.tenantId,
    siteName: site.name,
    pageSlug: requestedPageSlug || resolvedPage?.slug || "home",
    renderMode: resolvedPage?.renderMode || "REACT",
    hasV12Project: Boolean(site.v12Project),
    maintenanceMode: false,
    settings,
  };
}

/**
 * Shown for a site that's unpublished (the dashboard's publish switch)
 * or explicitly in maintenance mode (the settings toggle) — visitors get
 * this instead of a blank page or a bare 404, since from a visitor's
 * perspective both mean the same thing: come back later.
 */
function SiteTemporarilyDown({ siteName }: { siteName: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <div className="max-w-lg text-center">
        <svg viewBox="0 0 200 160" className="mx-auto h-40 w-48 text-blue-400" fill="none" aria-hidden="true">
          <rect x="20" y="16" width="160" height="108" rx="10" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" />
          <rect x="20" y="16" width="160" height="24" rx="10" fill="currentColor" fillOpacity="0.12" />
          <circle cx="34" cy="28" r="3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="44" cy="28" r="3" fill="currentColor" fillOpacity="0.5" />
          <circle cx="54" cy="28" r="3" fill="currentColor" fillOpacity="0.5" />
          <path d="M70 78 L92 100 L130 62" stroke="currentColor" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="82" r="34" stroke="currentColor" strokeWidth="3" strokeDasharray="4 7" strokeOpacity="0.55" />
          <path d="M85 82 h30 M100 67 v30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.85" transform="rotate(45 100 82)" />
          <rect x="60" y="134" width="80" height="8" rx="4" fill="currentColor" fillOpacity="0.15" />
        </svg>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[.18em] text-blue-300">{siteName}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">We’ll be right back.</h1>
        <p className="mt-4 leading-7 text-white/55">This website is temporarily down. It will be back online soon — please check again shortly.</p>
      </div>
    </main>
  );
}
