import type React from "react";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { BuilderResponsiveDevice } from "../responsive";
import { resolveRenderResponsiveValue } from "./renderResponsiveResolver";
import { resolveRenderColor, resolveRenderThemeToken } from "./renderThemeResolver";
import {
  getThemeContainerMaxWidth,
  getThemeContainerPaddingX,
} from "../../theme/containerDefaults";

export type RenderStyleOptions = Readonly<{
  device: BuilderResponsiveDevice;
  scale?: number;
  canvasWidth?: number;
  textFallback?: string;
}>;

export function resolveRenderStyle(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  options: RenderStyleOptions
): React.CSSProperties {
  const style = node.style ?? {};
  const scale = options.scale ?? 1;

  const toCss = (value: unknown, cssOptions?: { scale?: boolean }) =>
    toRenderCssUnit(resolveRenderStyleValue(value, blueprint, options.device), {
      scale: cssOptions?.scale === false ? 1 : scale,
    });
  const backgroundImage = stringOrUndefined(
    resolveRenderStyleValue(style.backgroundImage, blueprint, options.device)
  );
  const hasBackgroundImage = Boolean(backgroundImage && backgroundImage !== "none");

  return cleanRenderStyle({
   color: resolveRenderColor(
  resolveRenderStyleValue(style.color, blueprint, options.device),
  options.textFallback ?? "#0f172a",
  blueprint
),
    display: pick(style.display, options.device) as React.CSSProperties["display"],
    backgroundColor:
  style.backgroundColor !== undefined
    ? resolveRenderColor(
        resolveRenderStyleValue(style.backgroundColor, blueprint, options.device),
        "transparent",
        blueprint
      )
    : undefined,
    backgroundImage,
    backgroundSize:
      (resolveRenderStyleValue(style.backgroundSize, blueprint, options.device) ??
        (hasBackgroundImage ? "cover" : undefined)) as React.CSSProperties["backgroundSize"],
    backgroundPosition:
      (resolveRenderStyleValue(style.backgroundPosition, blueprint, options.device) ??
        (hasBackgroundImage ? "center center" : undefined)) as React.CSSProperties["backgroundPosition"],
    backgroundRepeat:
      (resolveRenderStyleValue(style.backgroundRepeat, blueprint, options.device) ??
        (hasBackgroundImage ? "no-repeat" : undefined)) as React.CSSProperties["backgroundRepeat"],
    backgroundAttachment: resolveRenderStyleValue(style.backgroundAttachment, blueprint, options.device) as React.CSSProperties["backgroundAttachment"],
    opacity: typeof style.opacity === "number" ? style.opacity : undefined,
    fontFamily: stringOrUndefined(resolveRenderStyleValue(style.fontFamily, blueprint, options.device)),
    fontSize: toCss(style.fontSize),
    fontWeight: pick(style.fontWeight, options.device) as React.CSSProperties["fontWeight"],
    fontStyle: pick(style.fontStyle, options.device) as React.CSSProperties["fontStyle"],
lineHeight: pick(style.lineHeight, options.device) as React.CSSProperties["lineHeight"],
    letterSpacing: toCss(style.letterSpacing),
    textAlign: pick(style.textAlign, options.device) as React.CSSProperties["textAlign"],
textTransform: pick(style.textTransform, options.device) as React.CSSProperties["textTransform"],
textDecoration: pick(style.textDecoration, options.device) as React.CSSProperties["textDecoration"],
    whiteSpace: pick(style.whiteSpace, options.device) as React.CSSProperties["whiteSpace"],
    pointerEvents: pick(style.pointerEvents, options.device) as React.CSSProperties["pointerEvents"],
    padding: toCss(style.padding),
    paddingTop: toCss(style.paddingTop),
    paddingRight: toCss(style.paddingRight),
    paddingBottom: toCss(style.paddingBottom),
    paddingLeft: toCss(style.paddingLeft),
    margin: toCss(style.margin),
    marginTop: toCss(style.marginTop),
    marginRight: toCss(style.marginRight),
    marginBottom: toCss(style.marginBottom),
    marginLeft: toCss(style.marginLeft),
    borderRadius: toCss(style.borderRadius),
    border: stringOrUndefined(resolveRenderStyleValue(style.border, blueprint, options.device)),
    borderTopWidth: toCss(style.borderTopWidth),
    borderRightWidth: toCss(style.borderRightWidth),
    borderBottomWidth: toCss(style.borderBottomWidth),
    borderLeftWidth: toCss(style.borderLeftWidth),
    borderTopStyle: pick(style.borderTopStyle, options.device) as React.CSSProperties["borderTopStyle"],
    borderRightStyle: pick(style.borderRightStyle, options.device) as React.CSSProperties["borderRightStyle"],
    borderBottomStyle: pick(style.borderBottomStyle, options.device) as React.CSSProperties["borderBottomStyle"],
    borderLeftStyle: pick(style.borderLeftStyle, options.device) as React.CSSProperties["borderLeftStyle"],
    borderTopColor: style.borderTopColor ? resolveRenderColor(resolveRenderStyleValue(style.borderTopColor, blueprint, options.device), "transparent", blueprint) : undefined,
    borderRightColor: style.borderRightColor ? resolveRenderColor(resolveRenderStyleValue(style.borderRightColor, blueprint, options.device), "transparent", blueprint) : undefined,
    borderBottomColor: style.borderBottomColor ? resolveRenderColor(resolveRenderStyleValue(style.borderBottomColor, blueprint, options.device), "transparent", blueprint) : undefined,
    borderLeftColor: style.borderLeftColor ? resolveRenderColor(resolveRenderStyleValue(style.borderLeftColor, blueprint, options.device), "transparent", blueprint) : undefined,
    boxShadow: stringOrUndefined(resolveRenderStyleValue(style.boxShadow, blueprint, options.device)),
    width: toCss(style.width, { scale: false }),
    height: toCss(style.height),
    minWidth: toCss(style.minWidth, { scale: false }),
    minHeight: toCss(style.minHeight),
    // Let CSS constrain max-width naturally. Canvas dimensions must not rewrite
    // semantic values (for example 72rem, 90vw, or a site token) into 100%.
    maxWidth: toCss(style.maxWidth, { scale: false }),
    maxHeight: toCss(style.maxHeight),
    gap: toCss(style.gap),
    rowGap: toCss(style.rowGap),
    columnGap: toCss(style.columnGap),
    flex: pick(style.flex, options.device) as React.CSSProperties["flex"],
    flexGrow: pick(style.flexGrow, options.device) as React.CSSProperties["flexGrow"],
    flexShrink: pick(style.flexShrink, options.device) as React.CSSProperties["flexShrink"],
    flexBasis: toCss(style.flexBasis),
    order: pick(style.order, options.device) as React.CSSProperties["order"],
    flexWrap: pick(style.flexWrap, options.device) as React.CSSProperties["flexWrap"],
    flexDirection: pick(style.flexDirection, options.device) as React.CSSProperties["flexDirection"],
    justifyContent: pick(style.justifyContent, options.device) as React.CSSProperties["justifyContent"],
    alignItems: pick(style.alignItems, options.device) as React.CSSProperties["alignItems"],
    gridTemplateColumns: stringOrUndefined(resolveRenderStyleValue(style.gridTemplateColumns, blueprint, options.device)),
    gridTemplateRows: stringOrUndefined(resolveRenderStyleValue(style.gridTemplateRows, blueprint, options.device)),
    gridColumn: stringOrUndefined(resolveRenderStyleValue(style.gridColumn, blueprint, options.device)),
    gridRow: stringOrUndefined(resolveRenderStyleValue(style.gridRow, blueprint, options.device)),
    position: style.position,
    top: toCss(style.top),
    right: toCss(style.right),
    bottom: toCss(style.bottom),
    left: toCss(style.left),
    overflow: pick(style.overflow, options.device) as React.CSSProperties["overflow"],
    overflowX: pick(style.overflowX, options.device) as React.CSSProperties["overflowX"],
    overflowY: pick(style.overflowY, options.device) as React.CSSProperties["overflowY"],
    objectFit: pick(style.objectFit, options.device) as React.CSSProperties["objectFit"],
    objectPosition: pick(style.objectPosition, options.device) as React.CSSProperties["objectPosition"],
    aspectRatio: pick(style.aspectRatio, options.device) as React.CSSProperties["aspectRatio"],
    zIndex: style.zIndex,
    transform: pick(style.transform, options.device) as string | undefined,
    transition: stringOrUndefined(style.transition),
  });
}

export function resolveRenderStyleValue(
  value: unknown,
  blueprint: BuilderBlueprint,
  device: BuilderResponsiveDevice
): unknown {
  return resolveRenderThemeToken(pick(value, device), blueprint);
}

export function toRenderCssUnit(
  value: unknown,
  options: { scale?: number } = {}
): string | number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const scale = options.scale ?? 1;

  if (typeof value === "number") {
    return `${Math.round(value * scale * 100) / 100}px`;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      return `${Math.round(Number(trimmed) * scale * 100) / 100}px`;
    }

    const px = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/i);
    if (px) {
      return `${Math.round(Number(px[1]) * scale * 100) / 100}px`;
    }

    return trimmed;
  }

  return String(value);
}

export function getRenderContainerWidthStyle(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  options: RenderStyleOptions
): React.CSSProperties {
  /*
   * Page and section are always full-bleed canvas elements.
   *
   * Direct child containers fill their section wrapper. Nested containers
   * can still apply their own width mode and max-width constraints.
   */
  if (node.type === "page" || node.type === "section") {
    return {
      width: "100%",
      maxWidth: "none",
      marginLeft: 0,
      marginRight: 0,
    };
  }

  if (node.type !== "container") {
    return {};
  }

  const parent = node.parentId
    ? blueprint.nodes[node.parentId]
    : undefined;

  if (parent?.type === "section") {
    return {
      width: "100%",
      maxWidth: "none",
      marginLeft: 0,
      marginRight: 0,
    };
  }

  const widthMode = String(node.props?.container ?? node.props?.widthMode ?? "boxed");

  if (widthMode === "full") {
    return {
      width: "100%",
      maxWidth: "none",
      marginLeft: 0,
      marginRight: 0,
    };
  }

  const maxWidth =
    node.props?.maxWidth ?? node.style?.maxWidth ?? getThemeContainerMaxWidth(blueprint);

  return {
    width: "100%",
    maxWidth:
      maxWidth === undefined
        ? undefined
        : toRenderCssUnit(
            resolveRenderStyleValue(
              maxWidth,
              blueprint,
              options.device
            ),
            { scale: 1 }
          ),
    marginLeft: "auto",
    marginRight: "auto",
  };
}

export function getRenderSectionContentWidthStyle(
  node: BuilderNode,
  blueprint: BuilderBlueprint,
  options: RenderStyleOptions
): React.CSSProperties {
  if (node.type !== "section") {
    return {};
  }

  const widthMode = String(node.props?.container ?? node.props?.widthMode ?? "boxed");

  if (widthMode === "full") {
    return {
      width: "100%",
      maxWidth: "none",
      marginLeft: 0,
      marginRight: 0,
    };
  }

  const configuredMaxWidth =
    node.props?.maxWidth ?? node.style?.maxWidth ?? getThemeContainerMaxWidth(blueprint);
  const paddingX = toRenderCssUnit(getThemeContainerPaddingX(blueprint, options.device));

  return {
    width: "100%",
    maxWidth:
      configuredMaxWidth === undefined
        ? undefined
        : toRenderCssUnit(
            resolveRenderStyleValue(
              configuredMaxWidth,
              blueprint,
              options.device
            ),
            { scale: 1 }
          ),
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: paddingX,
    paddingRight: paddingX,
  };
}

export function cleanRenderStyle(style: React.CSSProperties): React.CSSProperties {
  const normalizedStyle = normalizeRenderStyleConflicts(style);

  return Object.fromEntries(
    Object.entries(normalizedStyle).flatMap(([key, value]) => {
      const cleanValue = cleanStyleValue(value);
      return cleanValue === undefined ? [] : [[key, cleanValue]];
    })
  ) as React.CSSProperties;
}

export function normalizeRenderStyleConflicts(style: React.CSSProperties): React.CSSProperties {
  const next = { ...style };
  normalizeBoxStyle(next, "padding");
  normalizeBoxStyle(next, "margin");
  return next;
}

function pick(value: unknown, device: BuilderResponsiveDevice): unknown {
  return resolveRenderResponsiveValue(value, device, value);
}

const BOX_STYLE_SIDES = {
  padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
} as const;

function isPresentStyleValue(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function expandBoxValue(value: unknown) {
  if (!isPresentStyleValue(value)) return null;
  if (typeof value === "number") return [value, value, value, value];

  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > 4) return null;

  const [top, right = top, bottom = top, left = right] = parts;
  return [top, right, bottom, left];
}

function normalizeBoxStyle(
  style: React.CSSProperties,
  base: keyof typeof BOX_STYLE_SIDES
) {
  const record = style as Record<string, unknown>;
  const sides = BOX_STYLE_SIDES[base];

  if (!isPresentStyleValue(record[base])) return;

  const expanded = expandBoxValue(record[base]);
  if (expanded) {
    sides.forEach((side, index) => {
      if (!isPresentStyleValue(record[side])) {
        record[side] = expanded[index];
      }
    });
  }

  delete record[base];
}

function cleanStyleValue(value: unknown): string | number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") return value;
  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/i) ?? value.match(/^(-?\d+(?:\.\d+)?)$/);
  return match ? Number(match[1]) : null;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
