import { headers } from "next/headers";
import { prisma } from "@buildez/db";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { isBuilderV2Blueprint } from "@/modules/builder-v2/runtime/isBuilderV2Blueprint";
import { defaultThemeTokens } from "@/modules/builder-v2/theme/defaultTheme";
import {
  createDefaultSiteThemeLayout,
  normalizeSiteThemeLayout,
} from "@/modules/builder-v2/theme/siteLayout";
import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";

/* ============================================================
   PREVIEW PAGE — APP ROUTER SAFE
   ------------------------------------------------------------
   • NO <html>, <head>, <body>
   • Renders INSIDE PreviewLayout
   • Prevents zero-height flex collapse
============================================================ */

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlugWithId: string }>;
}) {
  const { siteSlug, pageSlugWithId } = await params;

  const sitePages = await prisma.page.findMany({
    where: {
      site: { slug: siteSlug },
    },
    select: {
      id: true,
      slug: true,
      blueprint: true,
      site: {
        select: {
          name: true,
          designTokens: true,
          layout: {
            select: {
              header: true,
              footer: true,
            },
          },
        },
      },
    },
    take: 500,
  });

  const matchedPage = sitePages.find((page) => {
    const fullSlug = `${page.slug}-${page.id}`;
    const shortSlug = `${page.slug}-${page.id.slice(0, 6)}`;
    return (
      pageSlugWithId === page.id ||
      pageSlugWithId === page.slug ||
      pageSlugWithId === fullSlug ||
      pageSlugWithId === shortSlug
    );
  });

  if (!matchedPage?.id) return null;

  const blueprintData = matchedPage.blueprint?.data;
  if (isBuilderV2Blueprint(blueprintData)) {
    const designTokens =
      matchedPage.site.designTokens &&
      typeof matchedPage.site.designTokens === "object" &&
      !Array.isArray(matchedPage.site.designTokens)
        ? (matchedPage.site.designTokens as Record<string, unknown>)
        : null;
    const blueprint = designTokens
      ? {
          ...blueprintData,
          theme: {
            ...blueprintData.theme,
            id:
              typeof designTokens.themePresetId === "string"
                ? designTokens.themePresetId
                : blueprintData.theme?.id,
            name:
              typeof designTokens.themeName === "string"
                ? designTokens.themeName
                : blueprintData.theme?.name,
            preset:
              typeof designTokens.themePresetId === "string"
                ? designTokens.themePresetId
                : blueprintData.theme?.preset,
            tokens: designTokens,
          },
        }
      : blueprintData;
    const tokens =
      blueprint.theme?.tokens &&
      typeof blueprint.theme.tokens === "object" &&
      !Array.isArray(blueprint.theme.tokens)
        ? (blueprint.theme.tokens as unknown as BuilderThemeTokens)
        : defaultThemeTokens;

    const siteLayout = normalizeSiteThemeLayout(
      matchedPage.site.layout,
      createDefaultSiteThemeLayout({
        siteName: matchedPage.site.name,
        tokens,
        presetId: blueprint.theme?.preset ?? "buildez-default",
      })
    );

    return <PublishedPageRenderer blueprint={blueprint} siteLayout={siteLayout} />;
  }

  const h = await headers();
  const host = h.get("host");
  if (!host) return null;

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/preview/${matchedPage.id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data: {
    html?: string;
    css?: string;
  } = await res.json();

  if (!data?.html) return null;
  const legacyDesignTokens =
    matchedPage.site.designTokens &&
    typeof matchedPage.site.designTokens === "object" &&
    !Array.isArray(matchedPage.site.designTokens)
      ? (matchedPage.site.designTokens as Record<string, unknown>)
      : null;
  const legacyTokens =
    legacyDesignTokens
      ? (legacyDesignTokens as unknown as BuilderThemeTokens)
      : defaultThemeTokens;
  const legacySiteLayout = normalizeSiteThemeLayout(
    matchedPage.site.layout,
    createDefaultSiteThemeLayout({
      siteName: matchedPage.site.name,
      tokens: legacyTokens,
      presetId:
        typeof legacyDesignTokens?.themePresetId === "string"
          ? legacyDesignTokens.themePresetId
          : "buildez-default",
    })
  );

  return (
    <SiteThemeFrame layout={legacySiteLayout} tokens={legacyTokens}>
      <div
        id="buildez-preview-root"
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#ffffff",
          color: "#000000",
          position: "relative",
          isolation: "isolate",
        }}
      >
      {/* --------------------------------------------
          BASE RESET (REQUIRED)
      -------------------------------------------- */}
        <style>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .be-section,
        .be-container,
        .be-column {
          width: 100%;
        }

        /* 🔥 CRITICAL: prevent zero-height columns */
        .be-column {
          min-height: 1px;
        }
      `}</style>

      {/* --------------------------------------------
          GENERATED RUNTIME CSS
      -------------------------------------------- */}
      {data.css && (
        <style
          dangerouslySetInnerHTML={{
            __html: data.css,
          }}
        />
      )}

      {/* --------------------------------------------
          GENERATED RUNTIME HTML
      -------------------------------------------- */}
      <div
          dangerouslySetInnerHTML={{
            __html: data.html,
          }}
        />
      </div>
    </SiteThemeFrame>
  );
}
