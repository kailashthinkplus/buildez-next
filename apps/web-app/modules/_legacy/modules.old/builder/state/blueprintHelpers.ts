// ------------------------------------------------------------
// Blueprint Helpers for Nested + Responsive Mutation Engine
// Pattern A — (Webflow / Elementor Model)
// ------------------------------------------------------------

export type DeviceType = "desktop" | "tablet" | "mobile";

/* ------------------------------------------------------------
   1. Deep Merge (pure, safe, recursive, TRBL-friendly)
------------------------------------------------------------ */
export function deepMergeSafe(target: any = {}, source: any = {}) {
  const out: any = Array.isArray(target) ? [...target] : { ...target };

  for (const key in source) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      typeof srcVal === "object" &&
      srcVal !== null &&
      !Array.isArray(srcVal)
    ) {
      out[key] = deepMergeSafe(tgtVal || {}, srcVal);
    } else {
      out[key] = srcVal;
    }
  }

  return out;
}

/* ------------------------------------------------------------
   2. Ensure responsive object structure exists
------------------------------------------------------------ */
export function ensureResponsivePaths(node: any) {
  if (!node.responsive) node.responsive = {};
  if (!node.responsive.tablet) node.responsive.tablet = {};
  if (!node.responsive.mobile) node.responsive.mobile = {};

  if (!node.responsive.tablet.props) node.responsive.tablet.props = {};
  if (!node.responsive.tablet.style) node.responsive.tablet.style = {};
  if (!node.responsive.tablet.layout) node.responsive.tablet.layout = {};
  if (!node.responsive.tablet.effects) node.responsive.tablet.effects = {};

  if (!node.responsive.mobile.props) node.responsive.mobile.props = {};
  if (!node.responsive.mobile.style) node.responsive.mobile.style = {};
  if (!node.responsive.mobile.layout) node.responsive.mobile.layout = {};
  if (!node.responsive.mobile.effects) node.responsive.mobile.effects = {};

  return node;
}

/* ------------------------------------------------------------
   3. Apply mutation to correct device slice
------------------------------------------------------------ */
export function applyResponsiveOverride(
  node: any,
  partial: any,
  device: DeviceType
) {
  // Desktop → write to base props/style/layout/effects
  if (device === "desktop") {
    return {
      ...node,
      ...deepMergeSafe(node, partial),
    };
  }

  // Tablet/Mobile → write inside responsive
  ensureResponsivePaths(node);

  const slice = device === "tablet"
    ? node.responsive.tablet
    : node.responsive.mobile;

  const updatedSlice = deepMergeSafe(slice, partial);

  if (device === "tablet") node.responsive.tablet = updatedSlice;
  else node.responsive.mobile = updatedSlice;

  return node;
}

/* ------------------------------------------------------------
   4. Merge base + responsive for Canvas render
------------------------------------------------------------ */
export function mergeForDevice(node: any, device: DeviceType) {
  if (!node) {
    return {
      props: {},
      style: {},
      layout: {},
      effects: {},
    };
  }

  const baseProps = node.props || {};
  const baseStyle = node.style || {};
  const baseLayout = node.layout || {};
  const baseEffects = node.effects || {};

  // Ensure responsive object is ready
  ensureResponsivePaths(node);

  let responsiveProps = {};
  let responsiveStyle = {};
  let responsiveLayout = {};
  let responsiveEffects = {};

  if (device === "tablet") {
    responsiveProps = node.responsive.tablet.props || {};
    responsiveStyle = node.responsive.tablet.style || {};
    responsiveLayout = node.responsive.tablet.layout || {};
    responsiveEffects = node.responsive.tablet.effects || {};
  }

  if (device === "mobile") {
    responsiveProps = node.responsive.mobile.props || {};
    responsiveStyle = node.responsive.mobile.style || {};
    responsiveLayout = node.responsive.mobile.layout || {};
    responsiveEffects = node.responsive.mobile.effects || {};
  }

  return {
    props: deepMergeSafe(baseProps, responsiveProps),
    style: deepMergeSafe(baseStyle, responsiveStyle),
    layout: deepMergeSafe(baseLayout, responsiveLayout),
    effects: deepMergeSafe(baseEffects, responsiveEffects),
  };
}
