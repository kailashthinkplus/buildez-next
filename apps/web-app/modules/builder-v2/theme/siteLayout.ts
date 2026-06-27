import type { BuilderThemeTokens } from "./theme.types";

export type SiteNavItem = {
  label: string;
  href: string;
};

export type SiteHeaderLayout = {
  enabled: boolean;
  variant: "solid" | "soft" | "minimal";
  brandLabel: string;
  ctaLabel: string;
  ctaHref: string;
  navItems: SiteNavItem[];
};

export type SiteFooterLayout = {
  enabled: boolean;
  variant: "solid" | "soft" | "minimal";
  brandLabel: string;
  body: string;
  copyright: string;
  navItems: SiteNavItem[];
};

export type SiteThemeLayout = {
  header: SiteHeaderLayout;
  footer: SiteFooterLayout;
};

export function createDefaultSiteThemeLayout({
  siteName,
}: {
  siteName: string;
  tokens: BuilderThemeTokens;
  presetId: string;
}): SiteThemeLayout {
  const brandLabel = siteName?.trim() || "BuildEZ Site";

  return {
    header: {
      enabled: true,
      variant: "solid",
      brandLabel,
      ctaLabel: "Contact",
      ctaHref: "#contact",
      navItems: [
        { label: "Home", href: "/" },
        { label: "Services", href: "#services" },
        { label: "Work", href: "#work" },
        { label: "Contact", href: "#contact" },
      ],
    },
    footer: {
      enabled: true,
      variant: "solid",
      brandLabel,
      body: "A polished website built with a consistent site-wide theme.",
      copyright: `© ${new Date().getFullYear()} ${brandLabel}. All rights reserved.`,
      navItems: [
        { label: "Home", href: "/" },
        { label: "Services", href: "#services" },
        { label: "Contact", href: "#contact" },
        { label: "Privacy", href: "#privacy" },
      ],
    },
  };
}

export function normalizeSiteThemeLayout(
  value: unknown,
  fallback: SiteThemeLayout
): SiteThemeLayout {
  const objectValue =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const header =
    objectValue.header && typeof objectValue.header === "object"
      ? (objectValue.header as Partial<SiteHeaderLayout>)
      : {};
  const footer =
    objectValue.footer && typeof objectValue.footer === "object"
      ? (objectValue.footer as Partial<SiteFooterLayout>)
      : {};

  return {
    header: {
      ...fallback.header,
      ...header,
      enabled:
        typeof header.enabled === "boolean"
          ? header.enabled
          : fallback.header.enabled,
      navItems: Array.isArray(header.navItems)
        ? header.navItems.filter(isNavItem)
        : fallback.header.navItems,
    },
    footer: {
      ...fallback.footer,
      ...footer,
      enabled:
        typeof footer.enabled === "boolean"
          ? footer.enabled
          : fallback.footer.enabled,
      navItems: Array.isArray(footer.navItems)
        ? footer.navItems.filter(isNavItem)
        : fallback.footer.navItems,
    },
  };
}

function isNavItem(value: unknown): value is SiteNavItem {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as SiteNavItem).label === "string" &&
    typeof (value as SiteNavItem).href === "string"
  );
}
