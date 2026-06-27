import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { renderPage } from "@/lib/runtime/render-page";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { defaultThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import { SiteThemeFrame } from "@/modules/builder-v2/theme/SiteThemeFrame";
import {
  createDefaultSiteThemeLayout,
  normalizeSiteThemeLayout,
} from "@/modules/builder-v2/theme/siteLayout";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";

export const dynamic = "force-dynamic";

export default async function PublicRuntimePage(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await props.params;
  const parts = resolvedParams.slug ?? [];

  const siteSlug = parts[0] ?? (await resolveDefaultSiteSlug());
  const pageSlug = parts[1] ?? "home";

  const result = await renderPage({ siteSlug, pageSlug });

  if (!result) {
    notFound();
  }

  if (result.mode === "builder-v2") {
    const tokens =
      result.blueprint.theme?.tokens &&
      typeof result.blueprint.theme.tokens === "object" &&
      !Array.isArray(result.blueprint.theme.tokens)
        ? (result.blueprint.theme.tokens as unknown as BuilderThemeTokens)
        : defaultThemeTokens;
    const siteLayout = normalizeSiteThemeLayout(
      result.siteLayout,
      createDefaultSiteThemeLayout({
        siteName: result.page.site.name,
        tokens,
        presetId: result.blueprint.theme?.preset ?? "buildez-default",
      })
    );

    return (
      <PublishedPageRenderer
        blueprint={result.blueprint}
        siteLayout={siteLayout}
      />
    );
  }

  const legacyDesignTokens =
    result.designTokens &&
    typeof result.designTokens === "object" &&
    !Array.isArray(result.designTokens)
      ? (result.designTokens as Record<string, unknown>)
      : null;
  const legacyTokens =
    legacyDesignTokens
      ? (legacyDesignTokens as unknown as BuilderThemeTokens)
      : defaultThemeTokens;
  const legacySiteLayout = normalizeSiteThemeLayout(
    result.siteLayout,
    createDefaultSiteThemeLayout({
      siteName: result.page.site.name,
      tokens: legacyTokens,
      presetId:
        typeof legacyDesignTokens?.themePresetId === "string"
          ? legacyDesignTokens.themePresetId
          : "buildez-default",
    })
  );

  return (
    <SiteThemeFrame layout={legacySiteLayout} tokens={legacyTokens}>
      <style dangerouslySetInnerHTML={{ __html: result.css }} />
      <div
        id="buildez-preview-root"
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    </SiteThemeFrame>
  );
}

async function resolveDefaultSiteSlug(): Promise<string> {
  const site = await prisma.site.findFirst({
    where: {
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });

  if (!site) {
    notFound();
  }

  return site.slug;
}
