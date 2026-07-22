import type { BuilderThemeTokens } from "./theme.types";

export type SiteNavItem = {
  label: string;
  href: string;
};

export type SiteHeaderLayout = {
  enabled: boolean;
  variant: "solid" | "soft" | "minimal";
  brandLabel: string;
  logoUrl?: string;
  ctaLabel: string;
  ctaHref: string;
  navItems: SiteNavItem[];
};

export type SiteFooterLayout = {
  enabled: boolean;
  variant: "solid" | "soft" | "minimal";
  brandLabel: string;
  logoUrl?: string;
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

export function hasExplicitSiteThemeLayout(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const layout = value as Record<string, unknown>;
  const header =
    layout.header && typeof layout.header === "object"
      ? (layout.header as Partial<SiteHeaderLayout>)
      : null;
  const footer =
    layout.footer && typeof layout.footer === "object"
      ? (layout.footer as Partial<SiteFooterLayout>)
      : null;

  return Boolean(
    (header && !isDefaultHeaderLayout(header)) ||
      (footer && !isDefaultFooterLayout(footer))
  );
}

export function disableSiteThemeChrome(layout: SiteThemeLayout): SiteThemeLayout {
  return {
    header: {
      ...layout.header,
      enabled: false,
    },
    footer: {
      ...layout.footer,
      enabled: false,
    },
  };
}

function labels(items: unknown) {
  return Array.isArray(items)
    ? items
        .map((item) =>
          item && typeof item === "object"
            ? String((item as SiteNavItem).label || "").toLowerCase()
            : ""
        )
        .filter(Boolean)
        .join("|")
    : "";
}

function isDefaultHeaderLayout(header: Partial<SiteHeaderLayout>) {
  const nav = labels(header.navItems);
  return (
    (header.enabled === undefined || header.enabled === true) &&
    (header.variant === undefined || header.variant === "solid") &&
    (header.ctaLabel === undefined || header.ctaLabel === "Contact") &&
    (header.ctaHref === undefined || header.ctaHref === "#contact") &&
    (!nav || nav === "home|services|work|contact")
  );
}

function isDefaultFooterLayout(footer: Partial<SiteFooterLayout>) {
  const nav = labels(footer.navItems);
  return (
    (footer.enabled === undefined || footer.enabled === true) &&
    (footer.variant === undefined || footer.variant === "solid") &&
    (footer.body === undefined ||
      footer.body === "A polished website built with a consistent site-wide theme.") &&
    (!nav || nav === "home|services|contact|privacy") &&
    (!footer.copyright || /all rights reserved/i.test(footer.copyright))
  );
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
