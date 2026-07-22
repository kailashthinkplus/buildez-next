import type {
  NormalizedStyle,
  ResidualEffect,
  ResponsiveStyles,
} from "../design-graph/schema";
import {
  fidelityDiagnostic,
  type FidelityDiagnostic,
  type FidelityLocation,
} from "../diagnostics/fidelity";

export type TailwindResult = Readonly<{
  layout: NormalizedStyle;
  style: NormalizedStyle;
  responsive: ResponsiveStyles;
  effects: readonly ResidualEffect[];
  diagnostics: readonly FidelityDiagnostic[];
}>;

const SPACING: Record<string, number> = {
  "0": 0,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "40": 160,
  "44": 176,
  "48": 192,
  "56": 224,
  "64": 256,
  "72": 288,
  "80": 320,
  "96": 384,
};

const COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  "stone-50": "#fafaf9",
  "stone-100": "#f5f5f4",
  "stone-200": "#e7e5e4",
  "stone-300": "#d6d3d1",
  "stone-600": "#57534e",
  "stone-900": "#1c1917",
  "stone-950": "#0c0a09",
  "slate-100": "#f1f5f9",
  "slate-300": "#cbd5e1",
  "slate-600": "#475569",
  "slate-900": "#0f172a",
  "slate-950": "#020617",
  "amber-300": "#fcd34d",
  "amber-700": "#b45309",
  "cyan-300": "#67e8f9",
};

const TEXT_SIZE: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
};

const SHADOWS: Record<string, string> = {
  sm: "0 1px 2px rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

function arbitrary(value: string): string | undefined {
  const match = value.match(/^\[(.+)\]$/);
  return match?.[1]?.replace(/_/g, " ");
}

function color(value: string): string | undefined {
  const opacityMatch = value.match(/^(.+)\/(?:\[(0(?:\.\d+)?|1(?:\.0+)?)\]|(\d{1,3}))$/);
  const opaqueColor = opacityMatch
    ? (COLORS[opacityMatch[1]] ?? arbitrary(opacityMatch[1]))
    : undefined;
  if (opacityMatch && opaqueColor?.match(/^#[0-9a-f]{6}$/i)) {
    const hex = opaqueColor;
    const alpha = opacityMatch[2] !== undefined
      ? Math.max(0, Math.min(1, Number(opacityMatch[2])))
      : Math.max(0, Math.min(100, Number(opacityMatch[3]))) / 100;
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }
  return COLORS[value] ?? arbitrary(value);
}

function spacing(value: string): number | string | undefined {
  return SPACING[value] ?? arbitrary(value);
}

function setBox(
  target: NormalizedStyle,
  prefix: string,
  value: number | string,
) {
  if (prefix === "p" || prefix === "m")
    target[prefix === "p" ? "padding" : "margin"] = value;
  else if (prefix === "px" || prefix === "mx") {
    target[prefix[0] === "p" ? "paddingLeft" : "marginLeft"] = value;
    target[prefix[0] === "p" ? "paddingRight" : "marginRight"] = value;
  } else if (prefix === "py" || prefix === "my") {
    target[prefix[0] === "p" ? "paddingTop" : "marginTop"] = value;
    target[prefix[0] === "p" ? "paddingBottom" : "marginBottom"] = value;
  } else {
    const side = { t: "Top", r: "Right", b: "Bottom", l: "Left" }[
      prefix[1] as "t"
    ];
    target[`${prefix[0] === "p" ? "padding" : "margin"}${side}`] = value;
  }
}

function interpretToken(token: string, target: NormalizedStyle): boolean {
  const negative = token.startsWith("-");
  const raw = negative ? token.slice(1) : token;
  if (["flex", "inline-flex", "grid", "block", "inline-block", "hidden"].includes(raw)) {
    target.display =
      raw === "hidden" ? "none" : raw === "inline-flex" ? "flex" : raw;
    return true;
  }
  if (raw === "flex-col") {
    target.flexDirection = "column";
    return true;
  }
  if (raw === "flex-row") {
    target.flexDirection = "row";
    return true;
  }
  if (raw === "flex-wrap") {
    target.flexWrap = "wrap";
    return true;
  }
  if (raw === "flex-1") {
    Object.assign(target, {
      flex: "1 1 0%",
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
    });
    return true;
  }
  if (raw === "flex-auto") {
    Object.assign(target, {
      flex: "1 1 auto",
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
    });
    return true;
  }
  if (raw === "flex-none") {
    Object.assign(target, {
      flex: "none",
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: "auto",
    });
    return true;
  }
  if (raw === "grow" || raw === "grow-0") {
    target.flexGrow = raw === "grow" ? 1 : 0;
    return true;
  }
  if (raw === "shrink" || raw === "shrink-0") {
    target.flexShrink = raw === "shrink" ? 1 : 0;
    return true;
  }
  if (raw === "min-w-0") {
    target.minWidth = 0;
    return true;
  }
  if (raw === "ml-auto") {
    target.marginLeft = "auto";
    return true;
  }
  if (raw === "items-start") {
    target.alignItems = "flex-start";
    return true;
  }
  if (raw === "items-center") {
    target.alignItems = "center";
    return true;
  }
  if (raw === "items-end") {
    target.alignItems = "flex-end";
    return true;
  }
  if (raw === "justify-between") {
    target.justifyContent = "space-between";
    return true;
  }
  if (raw === "justify-center") {
    target.justifyContent = "center";
    return true;
  }
  if (raw === "justify-end") {
    target.justifyContent = "flex-end";
    return true;
  }
  if (["relative", "absolute", "fixed", "sticky"].includes(raw)) {
    target.position = raw;
    return true;
  }
  if (raw === "inset-0") {
    Object.assign(target, { top: 0, right: 0, bottom: 0, left: 0 });
    return true;
  }
  if (raw === "inset-x-0") {
    Object.assign(target, { right: 0, left: 0 });
    return true;
  }
  if (raw === "overflow-hidden") {
    target.overflow = "hidden";
    return true;
  }
  if (raw === "overflow-visible") {
    target.overflow = "visible";
    return true;
  }
  if (raw === "group") return true;
  if (raw === "w-full") {
    target.width = "100%";
    return true;
  }
  if (raw === "h-full") {
    target.height = "100%";
    return true;
  }
  if (raw === "min-h-screen") {
    target.minHeight = "100vh";
    return true;
  }
  if (raw === "mx-auto") {
    target.marginLeft = "auto";
    target.marginRight = "auto";
    return true;
  }
  if (raw === "object-cover") {
    target.objectFit = "cover";
    return true;
  }
  if (raw === "object-contain") {
    target.objectFit = "contain";
    return true;
  }
  if (raw === "pointer-events-none") {
    target.pointerEvents = "none";
    return true;
  }
  if (raw === "object-center") {
    target.objectPosition = "center";
    return true;
  }
  if (raw === "aspect-square" || raw === "aspect-video") {
    target.aspectRatio = raw === "aspect-square" ? "1 / 1" : "16 / 9";
    return true;
  }
  if (raw === "transition") {
    target.transition = "all 180ms ease";
    return true;
  }
  if (raw === "text-center") {
    target.textAlign = "center";
    return true;
  }
  if (raw === "text-left") {
    target.textAlign = "left";
    return true;
  }
  if (raw === "uppercase") {
    target.textTransform = "uppercase";
    return true;
  }
  if (raw === "font-serif") {
    target.fontFamily = "Georgia, 'Times New Roman', serif";
    return true;
  }
  if (raw === "font-sans") {
    target.fontFamily = "Inter, system-ui, sans-serif";
    return true;
  }
  if (raw === "font-light") {
    target.fontWeight = 300;
    return true;
  }
  if (raw === "font-medium") {
    target.fontWeight = 500;
    return true;
  }
  if (raw === "font-semibold") {
    target.fontWeight = 600;
    return true;
  }
  if (raw === "font-bold") {
    target.fontWeight = 700;
    return true;
  }
  if (raw === "tracking-tight") {
    target.letterSpacing = "-0.025em";
    return true;
  }
  if (raw === "tracking-tighter") {
    target.letterSpacing = "-0.05em";
    return true;
  }
  if (raw === "tracking-wide") {
    target.letterSpacing = "0.025em";
    return true;
  }
  if (raw === "tracking-widest") {
    target.letterSpacing = "0.1em";
    return true;
  }
  if (raw.startsWith("tracking-")) {
    const value = arbitrary(raw.slice(9));
    if (value) {
      target.letterSpacing = value;
      return true;
    }
  }
  if (raw === "leading-tight") {
    target.lineHeight = 1.25;
    return true;
  }
  if (raw === "leading-8") {
    target.lineHeight = "32px";
    return true;
  }
  if (raw === "leading-7") {
    target.lineHeight = "28px";
    return true;
  }
  if (raw === "italic") {
    target.fontStyle = "italic";
    return true;
  }
  if (raw === "font-black") {
    target.fontWeight = 900;
    return true;
  }
  if (raw.startsWith("leading-")) {
    const value = arbitrary(raw.slice(8));
    if (value) {
      target.lineHeight = value;
      return true;
    }
  }
  const textSize = raw.match(/^text-(.+)$/)?.[1];
  if (textSize && TEXT_SIZE[textSize]) {
    target.fontSize = TEXT_SIZE[textSize];
    return true;
  }
  const arbitraryTextSize = textSize && arbitrary(textSize);
  if (
    arbitraryTextSize &&
    /^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|vw|vh|svh|dvh)$/.test(arbitraryTextSize)
  ) {
    target.fontSize = arbitraryTextSize;
    return true;
  }
  if (textSize && color(textSize)) {
    target.color = color(textSize)!;
    return true;
  }
  const bg = raw.match(/^bg-(.+)$/)?.[1];
  if (bg?.startsWith("gradient-to-")) {
    const direction = { r: "to right", t: "to top", br: "to bottom right" }[
      bg.slice(12)
    ];
    if (direction) {
      target.backgroundImage = `linear-gradient(${direction}, var(--tw-gradient-stops))`;
      return true;
    }
  }
  if (bg && color(bg)) {
    target.backgroundColor = color(bg)!;
    return true;
  }
  const from = raw.match(/^from-(.+)$/)?.[1];
  if (from && color(from)) {
    target.gradientFrom = color(from)!;
    return true;
  }
  const via = raw.match(/^via-(.+)$/)?.[1];
  if (via && color(via)) {
    target.gradientVia = color(via)!;
    return true;
  }
  const to = raw.match(/^to-(.+)$/)?.[1];
  if (to && color(to)) {
    target.gradientTo = color(to)!;
    return true;
  }
  const gap = raw.match(/^gap-(.+)$/)?.[1];
  if (gap && spacing(gap) !== undefined) {
    target.gap = spacing(gap)!;
    return true;
  }
  const box = raw.match(/^(p[trblxy]?|m[trblxy]?)-(.+)$/);
  if (box && spacing(box[2]) !== undefined) {
    const value = spacing(box[2])!;
    setBox(
      target,
      box[1],
      negative && typeof value === "number" ? -value : value,
    );
    return true;
  }
  const dimension = raw.match(/^(w|h|min-w|min-h|max-w|max-h)-(.+)$/);
  if (dimension) {
    const presets: Record<string, string | number> = {
      md: 448,
      xl: 576,
      "2xl": 672,
      "4xl": 896,
      "5xl": 1024,
      "6xl": 1152,
      "7xl": 1280,
      "72": 288,
      "80": 320,
      "96": 384,
    };
    const fraction = dimension[2].match(/^(\d+)\/(\d+)$/);
    const value = fraction
      ? `${(Number(fraction[1]) / Number(fraction[2])) * 100}%`
      : (presets[dimension[2]] ?? spacing(dimension[2]));
    const key = (
      {
        w: "width",
        h: "height",
        "min-w": "minWidth",
        "min-h": "minHeight",
        "max-w": "maxWidth",
        "max-h": "maxHeight",
      } as const
    )[dimension[1] as "w"];
    if (value !== undefined) {
      target[key] = value;
      return true;
    }
  }
  const position = raw.match(/^(top|right|bottom|left)-(.+)$/);
  if (position && spacing(position[2]) !== undefined) {
    const value = spacing(position[2])!;
    target[position[1]] =
      negative && typeof value === "number" ? -value : value;
    return true;
  }
  const z = raw.match(/^z-(\d+)$/);
  if (z) {
    target.zIndex = Number(z[1]);
    return true;
  }
  const opacity = raw.match(/^opacity-(\d+)$/);
  if (opacity) {
    target.opacity = Number(opacity[1]) / 100;
    return true;
  }
  const columns = raw.match(/^grid-cols-(\d+)$/);
  if (columns) {
    target.gridTemplateColumns = `repeat(${columns[1]}, minmax(0, 1fr))`;
    return true;
  }
  if (raw === "grid-flow-row" || raw === "grid-flow-col") {
    target.gridAutoFlow = raw === "grid-flow-row" ? "row" : "column";
    return true;
  }
  const span = raw.match(/^col-span-(\d+)$/);
  if (span) {
    target.gridColumn = `span ${span[1]} / span ${span[1]}`;
    return true;
  }
  const start = raw.match(/^col-start-(\d+)$/);
  if (start) {
    target.gridColumnStart = Number(start[1]);
    return true;
  }
  const basis = raw.match(/^basis-(.+)$/)?.[1];
  if (basis) {
    const fraction = basis.match(/^(\d+)\/(\d+)$/);
    const value = fraction
      ? `${(Number(fraction[1]) / Number(fraction[2])) * 100}%`
      : spacing(basis);
    if (value !== undefined) {
      target.flexBasis = value;
      return true;
    }
  }
  const order = raw.match(/^order-(\d+)$/);
  if (order) {
    target.order = Number(order[1]);
    return true;
  }
  if (raw === "rounded-full") {
    target.borderRadius = "9999px";
    return true;
  }
  if (raw === "rounded-t-full") {
    target.borderTopLeftRadius = "9999px";
    target.borderTopRightRadius = "9999px";
    return true;
  }
  const rounded = raw.match(/^rounded(?:-(t))?-(xl|2xl|3xl)$/);
  if (rounded) {
    const value = { xl: 12, "2xl": 16, "3xl": 24 }[rounded[2]];
    if (rounded[1]) {
      target.borderTopLeftRadius = value;
      target.borderTopRightRadius = value;
    } else target.borderRadius = value;
    return true;
  }
  if (raw === "border") {
    target.border = "1px solid currentColor";
    return true;
  }
  if (raw === "border-dotted" || raw === "border-dashed" || raw === "border-solid") {
    target.borderTopStyle = raw.replace("border-", "");
    target.borderRightStyle = raw.replace("border-", "");
    target.borderBottomStyle = raw.replace("border-", "");
    target.borderLeftStyle = raw.replace("border-", "");
    return true;
  }
  const arbitraryBorderWidth = raw.match(/^border-\[(\d+(?:\.\d+)?)px\]$/);
  if (arbitraryBorderWidth) {
    const width = Number(arbitraryBorderWidth[1]);
    target.borderTopWidth = width;
    target.borderRightWidth = width;
    target.borderBottomWidth = width;
    target.borderLeftWidth = width;
    return true;
  }
  if (raw === "border-t") {
    target.borderTopWidth = 1;
    target.borderTopStyle = "solid";
    return true;
  }
  if (raw === "border-b") {
    target.borderBottomWidth = 1;
    target.borderBottomStyle = "solid";
    return true;
  }
  const borderColor = raw.match(/^border-(.+)$/)?.[1];
  if (borderColor && color(borderColor)) {
    target.borderColor = color(borderColor)!;
    return true;
  }
  const shadow = raw.match(/^shadow(?:-(xl|2xl))?$/);
  if (shadow) {
    target.boxShadow = SHADOWS[shadow[1] ?? "DEFAULT"];
    return true;
  }
  const blur = raw.match(/^backdrop-blur-(xl|lg|md)$/);
  if (blur) {
    target.backdropFilter = `blur(${{ md: 12, lg: 16, xl: 24 }[blur[1]]}px)`;
    return true;
  }
  return false;
}

function finalizeGradient(style: NormalizedStyle) {
  if (
    !style.backgroundImage ||
    !String(style.backgroundImage).includes("--tw-gradient-stops")
  )
    return;
  const from = style.gradientFrom ?? "transparent";
  const via = style.gradientVia;
  const to = style.gradientTo ?? "transparent";
  const direction =
    String(style.backgroundImage).match(/^linear-gradient\(([^,]+),/)?.[1] ??
    "to right";
  style.backgroundImage = `linear-gradient(${direction}, ${from}${via ? `, ${via}` : ""}, ${to})`;
  delete style.gradientFrom;
  delete style.gradientVia;
  delete style.gradientTo;
}

export function interpretTailwind(
  className: string,
  location: FidelityLocation,
  nodeId?: string,
  customClasses: ReadonlySet<string> = new Set(),
): TailwindResult {
  const base: NormalizedStyle = {};
  const responsive: ResponsiveStyles = {};
  const effectMap = new Map<
    ResidualEffect["selector"],
    Record<string, string>
  >();
  const diagnostics: FidelityDiagnostic[] = [];
  for (const original of className.split(/\s+/).filter(Boolean)) {
    const stateVariant = original.match(
      /^(before|after|hover|focus-visible):(.+)$/,
    );
    if (stateVariant) {
      const selector = (
        {
          before: "::before",
          after: "::after",
          hover: ":hover",
          "focus-visible": ":focus-visible",
        } as const
      )[stateVariant[1] as "before"];
      const declarations = effectMap.get(selector) ?? {};
      if (!interpretResidualToken(stateVariant[2], declarations, selector))
        diagnostics.push(
          fidelityDiagnostic({
            code: "UNSUPPORTED_RESIDUAL_CLASS",
            severity: "warning",
            feature: original,
            message: `Residual class '${original}' is outside the CSS policy.`,
            affectedNode: nodeId,
            location,
            recommendedLowering:
              "Use an allowlisted pseudo state and residual property.",
          }),
        );
      effectMap.set(selector, declarations);
      continue;
    }
    const variant = original.match(/^(md|lg|xl):(.+)$/);
    const device = variant
      ? variant[1] === "md"
        ? "tablet"
        : "desktop"
      : undefined;
    const token = variant?.[2] ?? original;
    if (token.startsWith("backdrop-blur-")) {
      const declarations = effectMap.get("self") ?? {};
      const level = token.slice(14);
      declarations["backdrop-filter"] =
        `blur(${{ md: 12, lg: 16, xl: 24 }[level] ?? 12}px)`;
      effectMap.set("self", declarations);
      continue;
    }
    if (token === "rounded-t-full") {
      const declarations = effectMap.get("self") ?? {};
      declarations["border-top-left-radius"] = "9999px";
      declarations["border-top-right-radius"] = "9999px";
      effectMap.set("self", declarations);
      continue;
    }
    const target = device ? (responsive[device] ??= {}) : base;
    if (!interpretToken(token, target) && !customClasses.has(token))
      diagnostics.push(
        fidelityDiagnostic({
          code: "UNSUPPORTED_TAILWIND_CLASS",
          severity: "warning",
          feature: original,
          message: `Tailwind class '${original}' is outside the Milestone 1 subset.`,
          affectedNode: nodeId,
          location,
          recommendedLowering:
            "Add an explicit normalized native-style mapping or remove the class from the supported source profile.",
        }),
      );
  }
  finalizeGradient(base);
  Object.values(responsive).forEach(
    (value) => value && finalizeGradient(value),
  );
  const layoutKeys = new Set([
    "display",
    "flexDirection",
    "flexWrap",
    "flex",
    "flexGrow",
    "flexShrink",
    "flexBasis",
    "order",
    "alignItems",
    "justifyContent",
    "gap",
    "gridTemplateColumns",
    "gridColumn",
    "gridColumnStart",
    "gridAutoFlow",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "overflow",
    "zIndex",
  ]);
  const layout = Object.fromEntries(
    Object.entries(base).filter(([key]) => layoutKeys.has(key)),
  );
  const style = Object.fromEntries(
    Object.entries(base).filter(([key]) => !layoutKeys.has(key)),
  );
  const effects = [...effectMap.entries()]
    .filter(([, declarations]) => Object.keys(declarations).length)
    .map(([selector, declarations]) => {
      if (
        (selector === "::before" || selector === "::after") &&
        declarations.content === undefined
      )
        declarations.content = "''";
      return Object.freeze({
        selector,
        declarations: Object.freeze(declarations),
        reason:
          "Property or pseudo-state is not representable by the existing BuilderStyle resolver.",
      });
    });
  return Object.freeze({
    layout,
    style,
    responsive,
    effects: Object.freeze(effects),
    diagnostics: Object.freeze(diagnostics),
  });
}

function interpretResidualToken(
  token: string,
  declarations: Record<string, string>,
  selector: ResidualEffect["selector"],
): boolean {
  if (
    (selector === "::before" || selector === "::after") &&
    token === "absolute"
  ) {
    declarations.position = "absolute";
    return true;
  }
  if (
    (selector === "::before" || selector === "::after") &&
    token === "inset-0"
  ) {
    Object.assign(declarations, {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    });
    return true;
  }
  if (token === "-translate-y-1" || token === "-translate-y-2") {
    declarations.transform = `translateY(-${token.endsWith("2") ? 8 : 4}px)`;
    declarations.transition = "transform 180ms ease";
    return true;
  }
  if (token === "ring-2") {
    declarations.outline = "2px solid currentColor";
    declarations["outline-offset"] = "2px";
    return true;
  }
  if (token === "bg-gradient-to-br") {
    declarations.background =
      "linear-gradient(to bottom right, rgb(255 255 255 / 0.2), transparent)";
    return true;
  }
  if (token === "from-white/20" || token === "to-transparent") return true;
  return false;
}
