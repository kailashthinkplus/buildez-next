import { notFound } from "next/navigation";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";
import ThemeMarketplaceClient from "./ThemeMarketplaceClient";
import {
  createDefaultSiteThemeLayout,
  normalizeSiteThemeLayout,
} from "@/modules/builder-v2/theme/siteLayout";
import { getThemePreset } from "@/modules/builder-v2/theme/themePresets";

export default async function SiteThemesPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const auth = await getUser();

  if (!auth?.tenant?.id) {
    return notFound();
  }

  const site = await prisma.site.findFirst({
    where: {
      slug: siteSlug,
      tenantId: auth.tenant.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      designTokens: true,
      layout: {
        select: {
          header: true,
          footer: true,
        },
      },
    },
  });

  if (!site) {
    return notFound();
  }

  const designTokens =
    site.designTokens &&
    typeof site.designTokens === "object" &&
    !Array.isArray(site.designTokens)
      ? (site.designTokens as Record<string, unknown>)
      : null;
  const activePreset = getThemePreset(
    typeof designTokens?.themePresetId === "string"
      ? designTokens.themePresetId
      : null
  );
  const initialLayout = normalizeSiteThemeLayout(
    site.layout,
    createDefaultSiteThemeLayout({
      siteName: site.name,
      tokens: activePreset.tokens,
      presetId: activePreset.id,
    })
  );

  return (
    <ThemeMarketplaceClient
      siteId={site.id}
      siteName={site.name}
      initialDesignTokens={designTokens}
      initialLayout={initialLayout}
    />
  );
}
