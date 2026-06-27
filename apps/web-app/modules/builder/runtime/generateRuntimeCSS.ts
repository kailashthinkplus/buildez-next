// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/generateRuntimeCSS.ts

import { resolveNodeStyle } from "../renderer/resolveNodeStyle";

type RuntimeDevice = "desktop" | "tablet" | "mobile";

interface RuntimeNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: RuntimeNode[];
}

const UNITLESS = new Set([
  "opacity",
  "zIndex",
  "fontWeight",
  "lineHeight",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
]);

const LENGTH_PROPS = new Set([
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "top",
  "right",
  "bottom",
  "left",
  "gap",
  "rowGap",
  "columnGap",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "borderRadius",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontSize",
  "letterSpacing",
]);

function toCssKey(key: string) {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toCssValue(key: string, value: unknown) {
  if (typeof value === "number" && !UNITLESS.has(key)) {
    return `${value}px`;
  }

  if (
    LENGTH_PROPS.has(key) &&
    typeof value === "string" &&
    /^-?\d+(\.\d+)?$/.test(value)
  ) {
    return `${value}px`;
  }

  return String(value);
}

function styleToImportantCss(style: Record<string, unknown>) {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${toCssKey(key)}:${toCssValue(key, value)} !important;`)
    .join("");
}

function walkNodes(node: RuntimeNode | undefined, callback: (node: RuntimeNode) => void) {
  if (!node) return;
  callback(node);
  (node.children ?? []).forEach((child) => walkNodes(child, callback));
}

function responsiveVisibilityRule(node: RuntimeNode, device: RuntimeDevice) {
  const visibility = node.props?.__responsiveVisibility;
  if (!visibility || typeof visibility !== "object") return "";
  return visibility[device] === false ? "display:none !important;" : "";
}

function generateDeviceCss(page: RuntimeNode | undefined, device: RuntimeDevice) {
  const rules: string[] = [];

  walkNodes(page, (node) => {
    const style = resolveNodeStyle(node as any, device);
    const declarations = `${styleToImportantCss(style as Record<string, unknown>)}${responsiveVisibilityRule(node, device)}`;

    if (declarations) {
      rules.push(`[data-id="${node.id}"]{${declarations}}`);
    }
  });

  return rules.join("\n");
}

function generateResponsiveCss(page?: RuntimeNode) {
  if (!page) return "";

  const desktopVisibility = generateDeviceCss(page, "desktop")
    .split("\n")
    .filter((rule) => rule.includes("display:none"))
    .join("\n");
  const tabletCss = generateDeviceCss(page, "tablet");
  const mobileCss = generateDeviceCss(page, "mobile");

  return `
/* ============================================================
   BUILDEZ RESPONSIVE NODE STYLES
============================================================ */
${desktopVisibility}

@media (max-width: 1024px) {
${tabletCss}
}

@media (max-width: 768px) {
${mobileCss}
}
`.trim();
}

/**
 * BUILDEZ RUNTIME CSS (BASE STYLES)
 * 
 * This CSS provides base styles for all BuildEZ components.
 * It uses CSS custom properties that are injected at runtime.
 * 
 * BACKWARD COMPATIBILITY:
 * - Supports both old (--be-*) and new (--color-*, --spacing-*) variable names
 * - Falls back to hardcoded values if variables are missing
 * 
 * @returns CSS string for injection into <style> tag or .css file
 */
export function generateRuntimeCSS(page?: RuntimeNode): string {
  const baseCss = `
/* ============================================================
   BUILDEZ RUNTIME CSS — TOKEN DRIVEN
   Version: 7.0 (Backward Compatible)
============================================================ */

/* ============================================================
   CSS VARIABLES (Injected at runtime)
   
   New format (v7+):
   --color-background, --color-primary, etc.
   --spacing-4, --spacing-24, etc.
   --font-size-base, --font-size-5xl, etc.
   
   Old format (v1-v6, deprecated):
   --be-bg, --be-primary, etc.
   --be-section-y, --be-container-x, etc.
============================================================ */

/* ============================================================
   RESET (SCOPED TO BUILDEZ)
============================================================ */

#buildez-preview-root *,
#buildez-preview-root *::before,
#buildez-preview-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ============================================================
   ROOT CONTAINER
============================================================ */

#buildez-preview-root {
  /* Background & Text */
  background: var(--color-background, var(--be-bg, #ffffff));
  color: var(--color-text-primary, var(--be-text-primary, #0f172a));
  
  /* Typography */
  font-family: var(--font-family, var(--be-font-family, system-ui, sans-serif));
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-normal, var(--be-body-line-height, 1.7));
  
  /* Layout */
  min-height: 100vh;
  width: 100%;
}

/* ============================================================
   HARD RESET FOR INTERACTIVE ELEMENTS
============================================================ */

#buildez-preview-root a,
#buildez-preview-root button {
  all: unset;
  box-sizing: border-box;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  cursor: pointer;
}

#buildez-preview-root a {
  text-decoration: none;
}

#buildez-preview-root button {
  background: none;
  border: none;
}

/* ============================================================
   PAGE
============================================================ */

.buildez-page,
.be-page {
  width: 100%;
  min-height: 100vh;
}

/* ============================================================
   SECTION
============================================================ */

.be-section {
  width: 100%;
  box-sizing: border-box;
  
  /* Padding: New (spacing-24) → Old (be-section-y) → Fallback (96px) */
  padding-top: var(--spacing-24, var(--be-section-y, 96px));
  padding-bottom: var(--spacing-24, var(--be-section-y, 96px));
  padding-left: var(--spacing-6, var(--be-container-x, 24px));
  padding-right: var(--spacing-6, var(--be-container-x, 24px));
}

/* Section role variants */
.be-section[data-role="header"] {
  padding-top: var(--spacing-4, 16px);
  padding-bottom: var(--spacing-4, 16px);
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-background, var(--be-bg, #ffffff));
}

.be-section[data-role="footer"] {
  padding-top: var(--spacing-12, 48px);
  padding-bottom: var(--spacing-12, 48px);
  background: var(--color-surface, var(--be-surface, #f8fafc));
  border-top: 1px solid var(--color-border, var(--be-border, #e2e8f0));
}

/* ============================================================
   CONTAINER
============================================================ */

.be-container {
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

/* Block layout (default) */
.be-container {
  display: flex;
  flex-direction: column;
}

/* Columns layout */
.be-container[data-layout="columns"] {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
  gap: var(--spacing-8, 32px);
}

/* Grid layout */
.be-container[data-layout="grid"] {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-8, 32px);
}

/* Visual variants */
.be-container[data-visual="card"] {
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-8, 32px);
  box-shadow: var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05));
}

.be-container[data-visual="glass"] {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg, 20px);
  padding: var(--spacing-8, 32px);
  box-shadow: var(--shadow-md, 0 8px 32px rgba(0,0,0,0.1));
}

.be-container[data-visual="elevated"] {
  background: var(--color-background, #ffffff);
  border-radius: var(--radius-md, 12px);
  padding: var(--spacing-6, 24px);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

/* ============================================================
   COLUMN
============================================================ */

.be-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 0%;
  gap: var(--spacing-4, var(--be-block-gap, 16px));
}

/* ============================================================
   HEADING
============================================================ */

.be-heading {
  font-weight: var(--font-weight-bold, var(--be-heading-font-weight, 700));
  color: var(--color-text-primary, var(--be-text-primary, #0f172a));
  line-height: var(--line-height-tight, 1.2);
  letter-spacing: var(--letter-spacing-tight, -0.02em);
  margin: 0;
  margin-bottom: var(--spacing-4, 16px);
}

/* Heading emphasis variants */
.be-heading[data-emphasis="gradient"] {
  background: linear-gradient(
    135deg,
    var(--color-primary, #2563eb),
    var(--color-accent, #6366f1)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.be-heading[data-emphasis="bold"] {
  font-weight: var(--font-weight-extrabold, 800);
  letter-spacing: -0.03em;
}

/* ============================================================
   TEXT
============================================================ */

.be-text {
  color: var(--color-text-secondary, var(--be-text-secondary, #475569));
  line-height: var(--line-height-relaxed, 1.7);
  margin: 0;
  margin-bottom: var(--spacing-3, 12px);
}

.be-text[data-role="lead"] {
  font-size: var(--font-size-lg, 20px);
  line-height: 1.6;
  opacity: 0.9;
}

.be-text[data-role="caption"] {
  font-size: var(--font-size-sm, 14px);
  line-height: 1.5;
  opacity: 0.7;
}

/* ============================================================
   IMAGE
============================================================ */

.be-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg, var(--be-radius, 16px));
}

.be-image[data-effect="shadow"] {
  box-shadow: var(--shadow-lg, 0 25px 50px rgba(0,0,0,0.25));
}

.be-image[data-effect="border"] {
  border: 4px solid var(--color-background, #ffffff);
  box-shadow: var(--shadow-md, 0 10px 40px rgba(0,0,0,0.15));
}

/* ============================================================
   BUTTON
============================================================ */

.be-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* Colors */
  background: var(--color-primary, var(--be-primary, #2563eb));
  color: var(--color-on-primary, var(--be-on-primary, #ffffff));
  
  /* Spacing */
  padding-top: var(--button-padding-y, var(--be-button-padding-y, 14px));
  padding-bottom: var(--button-padding-y, var(--be-button-padding-y, 14px));
  padding-left: var(--button-padding-x, var(--be-button-padding-x, 28px));
  padding-right: var(--button-padding-x, var(--be-button-padding-x, 28px));
  
  /* Shape */
  border-radius: var(--radius-md, var(--be-button-radius, 12px));
  border: none;
  
  /* Typography */
  font-size: var(--font-size-base, 16px);
  font-weight: var(--font-weight-semibold, 600);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  
  /* Effects */
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
  transition: all 200ms ease;
  cursor: pointer;
}

.be-button:hover {
  background: var(--color-primary-hover, var(--be-primary-hover, #1d4ed8));
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.be-button:active {
  transform: translateY(0);
}

/* Button variants */
.be-button[data-variant="secondary"] {
  background: transparent;
  color: var(--color-primary, #2563eb);
  border: 2px solid var(--color-primary, #2563eb);
}

.be-button[data-variant="ghost"] {
  background: transparent;
  color: var(--color-text-primary, #0f172a);
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: none;
}

.be-button[data-variant="gradient"] {
  background: linear-gradient(
    135deg,
    var(--color-primary, #2563eb),
    var(--color-accent, #6366f1)
  );
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

/* ============================================================
   ICON
============================================================ */

.be-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: var(--color-primary, #2563eb);
}

.be-icon[data-variant="filled"] {
  background: var(--color-primary, #2563eb);
  color: var(--color-on-primary, #ffffff);
  padding: 12px;
  border-radius: var(--radius-md, 12px);
}

.be-icon[data-variant="soft"] {
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-primary, #2563eb);
  padding: 12px;
  border-radius: var(--radius-md, 12px);
}

/* ============================================================
   DIVIDER
============================================================ */

.be-divider {
  width: 100%;
  height: 1px;
  background: var(--color-border, var(--be-border, #e2e8f0));
  border: none;
  opacity: 0.5;
  margin: var(--spacing-6, 24px) 0;
}

/* ============================================================
   SPACER
============================================================ */

.be-spacer {
  width: 100%;
  flex-shrink: 0;
}

/* ============================================================
   RESPONSIVE — TABLET
============================================================ */

@media (max-width: 1024px) {
  .be-section {
    padding-top: var(--spacing-16, 64px);
    padding-bottom: var(--spacing-16, 64px);
  }
  
  .be-container {
    max-width: 100%;
  }
}

/* ============================================================
   RESPONSIVE — MOBILE
============================================================ */

@media (max-width: 768px) {
  .be-section {
    padding-top: var(--spacing-12, 48px);
    padding-bottom: var(--spacing-12, 48px);
  }
  
  .be-container {
    max-width: 100%;
  }
  
  /* Force columns to stack */
  .be-container[data-layout="columns"],
  .be-container[data-direction="row"] {
    flex-direction: column !important;
  }
  
  .be-column {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 auto !important;
  }
  
  /* Mobile button sizing */
  .be-button {
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 14px;
  }
}

/* ============================================================
   UTILITY CLASSES (OPTIONAL)
============================================================ */

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.w-full {
  width: 100%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* ============================================================
   GLOBAL RESET (OUTSIDE BUILDEZ)
============================================================ */

html,
body {
  margin: 0;
  padding: 0;
}
`.trim();

  const responsiveCss = generateResponsiveCss(page);

  return responsiveCss ? `${baseCss}\n\n${responsiveCss}` : baseCss;
}

/**
 * Generate minimal CSS (critical styles only)
 * For performance optimization / above-the-fold rendering
 */
export function generateRuntimeCSSMinimal(): string {
  return `
#buildez-preview-root * { box-sizing: border-box; }
#buildez-preview-root { background: var(--color-background, #ffffff); color: var(--color-text-primary, #0f172a); font-family: var(--font-family, system-ui, sans-serif); }
.be-section { width: 100%; padding: var(--spacing-24, 96px) var(--spacing-6, 24px); }
.be-container { width: 100%; max-width: 1280px; margin: 0 auto; }
.be-button { display: inline-flex; background: var(--color-primary, #2563eb); color: var(--color-on-primary, #fff); padding: 14px 28px; border-radius: var(--radius-md, 12px); }
`.trim();
}
