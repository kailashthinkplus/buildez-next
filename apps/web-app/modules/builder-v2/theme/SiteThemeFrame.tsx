import type React from "react";

import { normalizeThemeTokens } from "./defaultTheme";
import type { BuilderThemeTokens } from "./theme.types";
import type { SiteFooterLayout, SiteHeaderLayout, SiteThemeLayout } from "./siteLayout";

type SiteThemeFrameProps = {
  layout?: SiteThemeLayout | null;
  tokens?: Partial<BuilderThemeTokens> | Record<string, unknown> | null;
  children: React.ReactNode;
  mode?: "canvas" | "published";
  /** Whether the "Powered by BuildEZ" credit renders in the footer copyright line. Defaults to true. */
  showBranding?: boolean;
};

export function SiteThemeFrame({
  layout,
  tokens,
  children,
  mode = "published",
  showBranding = true,
}: SiteThemeFrameProps) {
  const safeTokens = normalizeThemeTokens(tokens);

  return (
    <div
      style={{
        background: safeTokens.colors.background,
        color: safeTokens.colors.textPrimary,
        fontFamily: fontStack(safeTokens.typography.bodyFont),
        minHeight: "100vh",
      }}
    >
      {layout?.header?.enabled && (
        <ThemeHeader header={layout.header} tokens={safeTokens} mode={mode} />
      )}
      {children}
      {layout?.footer?.enabled && (
        <ThemeFooter footer={layout.footer} tokens={safeTokens} mode={mode} showBranding={showBranding} />
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
  const safeTokens = normalizeThemeTokens(tokens);
  const styles = getShellStyles(header.variant, safeTokens, "header");

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
            color: safeTokens.colors.textPrimary,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: fontStack(safeTokens.typography.headingFont),
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {header.logoUrl ? (
            <img
              src={header.logoUrl}
              alt=""
              style={{
                display: "block",
                height: 34,
                maxWidth: 120,
                objectFit: "contain",
                width: "auto",
              }}
            />
          ) : (
            <span
              aria-hidden="true"
              style={{
                background: safeTokens.colors.primary,
                borderRadius: Math.max(6, safeTokens.radius.button),
                color: safeTokens.colors.primaryContrast,
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
          )}
          {!header.logoUrl ? header.brandLabel : null}
        </a>

        <nav
          aria-label="Site navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            color: safeTokens.colors.textSecondary,
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
            background: safeTokens.buttons.primary.backgroundColor,
            borderRadius: safeTokens.buttons.primary.borderRadius,
            color: safeTokens.buttons.primary.color,
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
  showBranding = true,
}: {
  footer: SiteFooterLayout;
  tokens: BuilderThemeTokens;
  mode?: "canvas" | "published";
  showBranding?: boolean;
}) {
  const safeTokens = normalizeThemeTokens(tokens);
  const styles = getShellStyles(footer.variant, safeTokens, "footer");

  return (
    <footer data-buildez-site-footer="true" style={styles.shell}>
      <div
        style={{
          ...styles.inner,
          alignItems: "flex-start",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: safeTokens.spacing.contentGap,
        }}
      >
        <div>
          <div
            style={{
              color: safeTokens.colors.textPrimary,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: fontStack(safeTokens.typography.headingFont),
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {footer.logoUrl ? (
              <img
                src={footer.logoUrl}
                alt=""
                style={{
                  display: "block",
                  height: 30,
                  maxWidth: 110,
                  objectFit: "contain",
                  width: "auto",
                }}
              />
            ) : (
              footer.brandLabel
            )}
          </div>
          <p
            style={{
              color: safeTokens.colors.textSecondary,
              fontSize: safeTokens.typography.scale.small,
              lineHeight: 1.7,
              margin: "10px 0 0",
              maxWidth: 460,
            }}
          >
            {footer.body}
          </p>
          <p
            style={{
              color: safeTokens.colors.textSecondary,
              fontSize: 12,
              margin: "22px 0 0",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{footer.copyright}</span>
            {showBranding ? (
              <a
                href="https://getbuildezy.com?utm_source=powered-by&utm_medium=footer"
                target="_blank"
                rel="noopener noreferrer nofollow"
                style={{ color: "inherit", opacity: 0.75, textDecoration: "none", borderLeft: `1px solid currentColor`, paddingLeft: 8 }}
              >
                Powered by BuildEZ
              </a>
            ) : null}
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
                color: safeTokens.colors.textSecondary,
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
