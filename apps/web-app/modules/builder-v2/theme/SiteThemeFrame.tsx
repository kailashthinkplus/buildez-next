import type React from "react";

import type { BuilderThemeTokens } from "./theme.types";
import type { SiteFooterLayout, SiteHeaderLayout, SiteThemeLayout } from "./siteLayout";

type SiteThemeFrameProps = {
  layout?: SiteThemeLayout | null;
  tokens: BuilderThemeTokens;
  children: React.ReactNode;
  mode?: "canvas" | "published";
};

export function SiteThemeFrame({
  layout,
  tokens,
  children,
  mode = "published",
}: SiteThemeFrameProps) {
  return (
    <div
      style={{
        background: tokens.colors.background,
        color: tokens.colors.textPrimary,
        fontFamily: fontStack(tokens.typography.bodyFont),
        minHeight: "100vh",
      }}
    >
      {layout?.header?.enabled && (
        <ThemeHeader header={layout.header} tokens={tokens} mode={mode} />
      )}
      {children}
      {layout?.footer?.enabled && (
        <ThemeFooter footer={layout.footer} tokens={tokens} mode={mode} />
      )}
    </div>
  );
}

export function ThemeHeader({
  header,
  tokens,
  mode = "published",
}: {
  header: SiteHeaderLayout;
  tokens: BuilderThemeTokens;
  mode?: "canvas" | "published";
}) {
  const styles = getShellStyles(header.variant, tokens, "header");

  return (
    <header
      data-buildez-site-header="true"
      style={{
        ...styles.shell,
        position: mode === "canvas" ? "relative" : "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={styles.inner}>
        <a
          href="/"
          style={{
            color: tokens.colors.textPrimary,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: fontStack(tokens.typography.headingFont),
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              background: tokens.colors.primary,
              borderRadius: Math.max(6, tokens.radius.button),
              color: tokens.colors.primaryContrast,
              display: "inline-flex",
              height: 34,
              width: 34,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {getInitials(header.brandLabel)}
          </span>
          {header.brandLabel}
        </a>

        <nav
          aria-label="Site navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            color: tokens.colors.textSecondary,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {header.navItems.slice(0, 5).map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={header.ctaHref}
          style={{
            background: tokens.buttons.primary.backgroundColor,
            borderRadius: tokens.buttons.primary.borderRadius,
            color: tokens.buttons.primary.color,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {header.ctaLabel}
        </a>
      </div>
    </header>
  );
}

export function ThemeFooter({
  footer,
  tokens,
}: {
  footer: SiteFooterLayout;
  tokens: BuilderThemeTokens;
  mode?: "canvas" | "published";
}) {
  const styles = getShellStyles(footer.variant, tokens, "footer");

  return (
    <footer data-buildez-site-footer="true" style={styles.shell}>
      <div
        style={{
          ...styles.inner,
          alignItems: "flex-start",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: tokens.spacing.contentGap,
        }}
      >
        <div>
          <div
            style={{
              color: tokens.colors.textPrimary,
              fontFamily: fontStack(tokens.typography.headingFont),
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {footer.brandLabel}
          </div>
          <p
            style={{
              color: tokens.colors.textSecondary,
              fontSize: tokens.typography.scale.small,
              lineHeight: 1.7,
              margin: "10px 0 0",
              maxWidth: 460,
            }}
          >
            {footer.body}
          </p>
          <p
            style={{
              color: tokens.colors.textSecondary,
              fontSize: 12,
              margin: "22px 0 0",
            }}
          >
            {footer.copyright}
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 20px",
            justifyContent: "flex-end",
          }}
        >
          {footer.navItems.slice(0, 8).map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              style={{
                color: tokens.colors.textSecondary,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function getShellStyles(
  variant: "solid" | "soft" | "minimal",
  tokens: BuilderThemeTokens,
  placement: "header" | "footer"
) {
  const borderColor = tokens.colors.border;
  const background =
    variant === "minimal"
      ? tokens.colors.background
      : variant === "soft"
        ? tokens.colors.surfaceAlt
        : tokens.colors.surface;

  return {
    shell: {
      background,
      borderBottom: placement === "header" ? `1px solid ${borderColor}` : undefined,
      borderTop: placement === "footer" ? `1px solid ${borderColor}` : undefined,
      boxShadow:
        placement === "header" && variant === "solid"
          ? "0 8px 28px rgba(15, 23, 42, 0.06)"
          : undefined,
      width: "100%",
    } satisfies React.CSSProperties,
    inner: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      margin: "0 auto",
      maxWidth: 1200,
      padding: `${placement === "header" ? 16 : 36}px ${tokens.spacing.containerX}px`,
      width: "100%",
    } satisfies React.CSSProperties,
  };
}

function fontStack(font: string) {
  return font.includes(" ") ? `"${font}", sans-serif` : `${font}, sans-serif`;
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("");
  return (initials || "BZ").toUpperCase();
}
