"use client";

import { useEffect, useMemo } from "react";
import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import { useSelectionStore } from "../store/useSelectionStore";
import { useCanvasStore, type Device } from "../store/useCanvasStore";
import { useHoverStore } from "../store/useHoverStore";
import { commandBus } from "../core/commands/CommandBus";
import { UpdateNodeCommand } from "../core/commands/MoveNodeCommand";
import { isSystemFont, normalizeGoogleFontFamily } from "@/lib/googleFonts";
import PremiumWidgetPreview from "../widgets/premium/PremiumWidgetPreview";
import {
  ArrowRight,
  Check,
  Heart,
  Mail,
  MapPin,
  Phone,
  Play,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";

const FONT_WEIGHTS = ["400", "500", "600", "700"];
const PREMIUM_NODE_TYPES = new Set([
  "smartHeader",
  "hero",
  "leadForm",
  "cardGrid",
  "galleryLightbox",
  "faq",
  "testimonials",
  "pricing",
  "offerGrid",
  "floatingWhatsApp",
  "locationMap",
  "smartFooter",
]);

function loadGoogleFont(family: string) {
  const normalized = normalizeGoogleFontFamily(family);
  if (!normalized || isSystemFont(normalized)) return;

  const id = `builder-google-font-${normalized.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${normalized.replace(/\s+/g, "+")}:wght@${FONT_WEIGHTS.join(";")}&display=swap`;
  document.head.appendChild(link);
}

function collectFontFamilies(blueprint: BuilderBlueprint) {
  const fonts = new Set<string>();
  const tokens = blueprint.theme?.tokens as Record<string, unknown> | undefined;
  const typography =
    tokens?.typography && typeof tokens.typography === "object"
      ? (tokens.typography as Record<string, unknown>)
      : {};

  [typography.headingFont, typography.bodyFont].forEach((family) => {
    if (typeof family === "string") {
      const normalized = normalizeGoogleFontFamily(family);
      if (normalized) fonts.add(normalized);
    }
  });

  Object.values(blueprint.nodes).forEach((node) => {
    const family = node.style?.fontFamily;
    if (typeof family === "string") {
      const normalized = normalizeGoogleFontFamily(family);
      if (normalized) fonts.add(normalized);
    }
  });

  return [...fonts];
}

function collectCustomKeyframes(blueprint: BuilderBlueprint) {
  const keyframes = new Set<string>();

  Object.values(blueprint.nodes).forEach((node) => {
    const advanced =
      node.props?.advanced && typeof node.props.advanced === "object"
        ? (node.props.advanced as Record<string, unknown>)
        : {};
    const motion =
      advanced.motion && typeof advanced.motion === "object"
        ? (advanced.motion as Record<string, unknown>)
        : {};
    const css = typeof motion.keyframes === "string" ? motion.keyframes.trim() : "";
    if (css) keyframes.add(css);
  });

  return [...keyframes].join("\n");
}

function collectMotionCss(blueprint: BuilderBlueprint) {
  return Object.values(blueprint.nodes)
    .map((node) => {
      const advanced =
        node.props?.advanced && typeof node.props.advanced === "object"
          ? (node.props.advanced as Record<string, unknown>)
          : {};
      const motion =
        advanced.motion && typeof advanced.motion === "object"
          ? (advanced.motion as Record<string, unknown>)
          : {};

      if (motion.preset !== "stagger-children") {
        return "";
      }

      const selector = `[data-node-id="${cssEscape(node.id)}"] > *`;
      const stagger = Number(motion.stagger ?? 0.08);
      const duration = Number(motion.duration ?? 0.6);
      const delay = Number(motion.delay ?? 0);
      const ease = normalizeEase(String(motion.ease ?? "ease"));
      const childDelays = Array.from({ length: 16 }, (_, index) => {
        const nth = index + 1;
        return `${selector}:nth-child(${nth}) { animation-delay: ${delay + index * stagger}s; }`;
      }).join("\n");

      return `
${selector} {
  animation-name: builder-fade-in;
  animation-duration: ${duration}s;
  animation-timing-function: ${ease};
  animation-fill-mode: both;
}
${childDelays}
`;
    })
    .filter(Boolean)
    .join("\n");
}

function isVisibleOnDevice(node: BuilderNode, device: Device): boolean {
  const visibility = node.props?.__responsiveVisibility as
    | Partial<Record<Device, boolean>>
    | undefined;
  const advanced =
    node.props?.advanced && typeof node.props.advanced === "object"
      ? (node.props.advanced as Record<string, unknown>)
      : {};
  const responsive =
    advanced.responsive && typeof advanced.responsive === "object"
      ? (advanced.responsive as Record<string, unknown>)
      : {};

  if (responsive[`${device}Mode`] === "hidden") {
    return false;
  }

  return visibility?.[device] !== false;
}

interface NodeRendererProps {
  nodes: BuilderNode[];
  blueprint: BuilderBlueprint;
}

export default function NodeRenderer({ nodes, blueprint }: NodeRendererProps) {
  const fontFamilies = useMemo(() => collectFontFamilies(blueprint), [blueprint]);
  const customKeyframes = useMemo(() => collectCustomKeyframes(blueprint), [blueprint]);
  const motionCss = useMemo(() => collectMotionCss(blueprint), [blueprint]);

  useEffect(() => {
    fontFamilies.forEach(loadGoogleFont);
  }, [fontFamilies]);

  return (
    <div className="w-full h-full">
      {customKeyframes && <style dangerouslySetInnerHTML={{ __html: customKeyframes }} />}
      {motionCss && <style dangerouslySetInnerHTML={{ __html: motionCss }} />}
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} blueprint={blueprint} />
      ))}
    </div>
  );
}

function cssEscape(value: string) {
  return value.replace(/["\\]/g, "\\$&");
}

interface RenderNodeProps {
  node: BuilderNode;
  blueprint: BuilderBlueprint;
}

type DropIntent = "before" | "after" | "inside";

function getTransparentDragImage(): HTMLImageElement {
  const key = "__builder_drag_image__";
  const existing = (window as any)[key] as HTMLImageElement | undefined;
  if (existing) {
    return existing;
  }

  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  (window as any)[key] = img;
  return img;
}

function parseInlineCss(value: string): React.CSSProperties {
  if (!value.trim()) return {};

  return value
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce<React.CSSProperties>((style, declaration) => {
      const separator = declaration.indexOf(":");
      if (separator <= 0) return style;

      const rawKey = declaration.slice(0, separator).trim();
      const rawValue = declaration.slice(separator + 1).trim();
      if (!rawKey || !rawValue) return style;

      const key = rawKey.replace(/-([a-z])/g, (_, char: string) =>
        char.toUpperCase()
      ) as keyof React.CSSProperties;
      (style as Record<string, string>)[key as string] = rawValue;
      return style;
    }, {});
}

function getMotionStyle(motion: Record<string, unknown>): React.CSSProperties {
  const preset = String(motion.preset ?? "none");
  if (preset === "none" || preset === "stagger-children") {
    return {};
  }

  if (preset === "custom-keyframes") {
    const keyframesName = getKeyframesName(String(motion.keyframes ?? ""));
    if (!keyframesName) return {};

    return {
      animationName: keyframesName,
      animationDuration: `${Number(motion.duration ?? 0.6)}s`,
      animationDelay: `${Number(motion.delay ?? 0)}s`,
      animationTimingFunction: normalizeEase(String(motion.ease ?? "ease")),
      animationFillMode: "both",
    };
  }

  const animationMap: Record<string, string> = {
    "fade-in": "builder-fade-in",
    "slide-up": "builder-slide-up",
    "scale-in": "builder-scale-in",
  };
  const animationName = animationMap[preset];
  if (!animationName) return {};

  return {
    animationName,
    animationDuration: `${Number(motion.duration ?? 0.6)}s`,
    animationDelay: `${Number(motion.delay ?? 0)}s`,
    animationTimingFunction: normalizeEase(String(motion.ease ?? "ease")),
    animationFillMode: "both",
  };
}

function getKeyframesName(css: string) {
  return css.match(/@keyframes\s+([a-zA-Z0-9_-]+)/)?.[1];
}

function getStylePresetStyle(preset: unknown): React.CSSProperties {
  switch (preset) {
    case "brand-primary":
      return { backgroundColor: "#2563eb", color: "#ffffff" };
    case "brand-secondary":
      return { backgroundColor: "#0f172a", color: "#ffffff" };
    case "muted":
      return { backgroundColor: "#f1f5f9", color: "#334155" };
    case "card":
      return {
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
      };
    default:
      return {};
  }
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

  if (!isPresentStyleValue(record[base])) {
    return;
  }

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

function normalizeStyleConflicts(style: React.CSSProperties): React.CSSProperties {
  const next = { ...style };
  normalizeBoxStyle(next, "padding");
  normalizeBoxStyle(next, "margin");
  return next;
}

const ICONS: Record<string, LucideIcon> = {
  star: Star,
  heart: Heart,
  check: Check,
  "arrow-right": ArrowRight,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  user: User,
  search: Search,
  "shopping-cart": ShoppingCart,
  play: Play,
  sparkles: Sparkles,
};

function IconGlyph({
  name,
  size,
}: {
  name: unknown;
  size?: string | number;
}) {
  const Icon = ICONS[String(name ?? "star")] ?? Star;
  return <Icon size={typeof size === "number" ? size : undefined} strokeWidth={2} />;
}

function normalizeEase(value: string) {
  const map: Record<string, string> = {
    "power2.out": "cubic-bezier(0.16, 1, 0.3, 1)",
    "power3.inOut": "cubic-bezier(0.65, 0, 0.35, 1)",
    "back.out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "elastic.out": "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return map[value] ?? value;
}

function RenderNode({ node, blueprint }: RenderNodeProps) {
  const { type, props } = node;
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);
  const device = useCanvasStore((s) => s.device);
  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const setHoveredNodeId = useHoverStore((s) => s.setHoveredNodeId);
  const isSelected = selectedId === node.id;
  const isLocked = !!node.locked;
  const isHidden = !!node.hidden;
  const isDragEnabled = node.id !== blueprint.root && !isLocked;
  const responsiveVisible = isVisibleOnDevice(node, device);
  const canvasWidth =
    device === "mobile" ? 390 : device === "tablet" ? 768 : 1200;
  const sizeScale = device === "mobile" ? 0.82 : device === "tablet" ? 0.92 : 1;

  if (node.parentId !== null && (isHidden || !responsiveVisible)) {
    return null;
  }

  const handleMouseEnter = () => {
    if (document.body.classList.contains("builder-dragging")) {
      return;
    }
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = () => {
    if (document.body.classList.contains("builder-dragging")) {
      return;
    }
    setHoveredNodeId(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDragEnabled) {
      e.preventDefault();
      return;
    }

    (window as any).__builderDragId = node.id;
    (window as any).__builderDragType = node.type;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(getTransparentDragImage(), 0, 0);
    e.dataTransfer.setData("application/json", JSON.stringify({
      nodeId: node.id,
      type: node.type,
    }));
    e.dataTransfer.setData("text/plain", node.id);

    window.dispatchEvent(
      new CustomEvent("builder:start-drag", {
        detail: {
          id: node.id,
          type: node.type,
          source: "canvas",
          x: e.clientX,
          y: e.clientY,
        },
      })
    );

    e.stopPropagation();
  };

  const handleDragEnd = () => {
    (window as any).__builderDragId = null;
    (window as any).__builderDragType = null;
    window.dispatchEvent(new CustomEvent("builder:drop-clear"));
    window.dispatchEvent(new CustomEvent("builder:end-drag"));
  };

  // Look up child nodes by their IDs
  const childIds = node.children || [];
  const children = childIds
    .map((id) => blueprint.nodes[id])
    .filter((child): child is BuilderNode => !!child);
  const advanced =
    node.props?.advanced && typeof node.props.advanced === "object"
      ? (node.props.advanced as Record<string, unknown>)
      : {};
  const motion =
    advanced.motion && typeof advanced.motion === "object"
      ? (advanced.motion as Record<string, unknown>)
      : {};
  const accessibility =
    advanced.accessibility && typeof advanced.accessibility === "object"
      ? (advanced.accessibility as Record<string, unknown>)
      : {};
  const customClass = String(advanced.className ?? node.props?.className ?? "").trim();
  const cssId = String(advanced.cssId ?? "").trim() || undefined;

  function pickResponsive(value: unknown): unknown {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const obj = value as Record<string, unknown>;
    return obj[device] ?? obj.desktop ?? obj.laptop ?? obj.tablet ?? obj.mobile ?? value;
  }

  function getThemeValue(path: string): unknown {
    const tokens = blueprint.theme?.tokens;
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
      return undefined;
    }

    return path.split(".").reduce<unknown>((current, key) => {
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        return undefined;
      }
      return (current as Record<string, unknown>)[key];
    }, tokens);
  }

  function resolveStyleValue(value: unknown): unknown {
    const picked = pickResponsive(value);
    if (typeof picked !== "string" || !picked) return picked;

    const exactThemeMatch = picked.match(/^theme\.(.+)$/);
    if (exactThemeMatch) {
      return getThemeValue(exactThemeMatch[1]) ?? picked;
    }

    const map: Record<string, string> = {
      "text.primary": "#0f172a",
      "text.secondary": "#334155",
      "primary.500": "#2563eb",
      surface: "#ffffff",
      "surface.muted": "#f1f5f9",
      border: "#e2e8f0",
      transparent: "transparent",
      white: "#ffffff",
      black: "#000000",
    };

    if (map[picked]) {
      return map[picked];
    }

    return picked.replace(/theme\.([a-zA-Z0-9_.]+)/g, (match, path) => {
      const resolved = getThemeValue(path);
      return resolved === undefined || resolved === null ? match : String(resolved);
    });
  }

  function resolveTokenColor(value: unknown, fallback: string): string {
    const resolved = resolveStyleValue(value);
    if (resolved === undefined || resolved === null || resolved === "") return fallback;
    return String(resolved);
  }

  function toCssUnit(
    value: unknown,
    options?: { scale?: boolean }
  ): string | number | undefined {
    const v = resolveStyleValue(value);
    if (v === undefined || v === null || v === "") return undefined;
    const shouldScale = options?.scale ?? true;

    if (typeof v === "number") {
      const computed = shouldScale ? v * sizeScale : v;
      return `${Math.round(computed * 100) / 100}px`;
    }

    if (typeof v === "string") {
      const numeric = v.trim().match(/^-?\d+(?:\.\d+)?$/);
      if (numeric) {
        const n = Number(v.trim());
        const computed = shouldScale ? n * sizeScale : n;
        return `${Math.round(computed * 100) / 100}px`;
      }

      const px = v.match(/^(-?\d+(?:\.\d+)?)px$/i);
      if (px) {
        const n = Number(px[1]);
        const computed = shouldScale ? n * sizeScale : n;
        return `${Math.round(computed * 100) / 100}px`;
      }
    }

    return String(v);
  }

  function toPx(value: string | number | undefined): number | null {
    if (value === undefined) return null;
    if (typeof value === "number") return value;
    if (/^-?\d+(?:\.\d+)?$/.test(value.trim())) return Number(value.trim());
    const m = value.match(/^(-?\d+(?:\.\d+)?)px$/i);
    return m ? Number(m[1]) : null;
  }

  function clampWidth(value: unknown): string | number | undefined {
    const computed = toCssUnit(value, { scale: false });
    const px = toPx(computed);
    if (px !== null && px > canvasWidth) {
      return "100%";
    }
    return computed;
  }

  const nodeStyle: React.CSSProperties = {
    color: resolveTokenColor(node.style?.color, isDarkMode ? "#e5e7eb" : "#0f172a"),
    display: pickResponsive(node.style?.display) as React.CSSProperties["display"],
    backgroundColor:
      node.style?.backgroundColor !== undefined
        ? resolveTokenColor(node.style?.backgroundColor, "transparent")
        : undefined,
    backgroundImage: node.style?.backgroundImage as string | undefined,
    backgroundSize: pickResponsive(node.style?.backgroundSize) as React.CSSProperties["backgroundSize"],
    backgroundPosition: pickResponsive(node.style?.backgroundPosition) as React.CSSProperties["backgroundPosition"],
    backgroundRepeat: pickResponsive(node.style?.backgroundRepeat) as React.CSSProperties["backgroundRepeat"],
    backgroundAttachment:
      (motion.engine === "parallax" || Number(motion.parallaxSpeed ?? 0) !== 0
        ? "fixed"
        : pickResponsive(node.style?.backgroundAttachment)) as React.CSSProperties["backgroundAttachment"],
    opacity: node.style?.opacity,
    fontFamily: resolveStyleValue(node.style?.fontFamily) as string | undefined,
    fontSize: toCssUnit(node.style?.fontSize),
    fontWeight: (node.style?.fontWeight as number | undefined) ?? undefined,
    lineHeight: (node.style?.lineHeight as number | undefined) ?? undefined,
    letterSpacing: toCssUnit(node.style?.letterSpacing),
    textAlign: (node.style?.textAlign as React.CSSProperties["textAlign"]) ?? undefined,
    textTransform: node.style?.textTransform,
    textDecoration: node.style?.textDecoration,
    padding: toCssUnit(node.style?.padding),
    paddingTop: toCssUnit(node.style?.paddingTop),
    paddingRight: toCssUnit(node.style?.paddingRight),
    paddingBottom: toCssUnit(node.style?.paddingBottom),
    paddingLeft: toCssUnit(node.style?.paddingLeft),
    margin: toCssUnit(node.style?.margin),
    marginTop: toCssUnit(node.style?.marginTop),
    marginRight: toCssUnit(node.style?.marginRight),
    marginBottom: toCssUnit(node.style?.marginBottom),
    marginLeft: toCssUnit(node.style?.marginLeft),
    borderRadius: toCssUnit(node.style?.borderRadius),
    border: resolveStyleValue(node.style?.border) as string | undefined,
    boxShadow: resolveStyleValue(node.style?.boxShadow) as string | undefined,
    width: clampWidth(node.style?.width),
    height: toCssUnit(node.style?.height),
    minWidth: clampWidth(node.style?.minWidth),
    minHeight: toCssUnit(node.style?.minHeight),
    maxWidth: clampWidth(node.style?.maxWidth),
    maxHeight: toCssUnit(node.style?.maxHeight),
    gap: toCssUnit(node.style?.gap) as string | number | undefined,
    flexWrap: pickResponsive(node.style?.flexWrap) as React.CSSProperties["flexWrap"],
    flexDirection: pickResponsive(node.style?.flexDirection) as React.CSSProperties["flexDirection"],
    justifyContent: pickResponsive(node.style?.justifyContent) as React.CSSProperties["justifyContent"],
    alignItems: pickResponsive(node.style?.alignItems) as React.CSSProperties["alignItems"],
    gridTemplateColumns: resolveStyleValue(node.style?.gridTemplateColumns) as string | undefined,
    position: node.style?.position,
    top: toCssUnit(node.style?.top),
    right: toCssUnit(node.style?.right),
    bottom: toCssUnit(node.style?.bottom),
    left: toCssUnit(node.style?.left),
    overflow: pickResponsive(node.style?.overflow) as React.CSSProperties["overflow"],
    objectFit: pickResponsive(node.style?.objectFit) as React.CSSProperties["objectFit"],
    objectPosition: pickResponsive(node.style?.objectPosition) as React.CSSProperties["objectPosition"],
    aspectRatio: pickResponsive(node.style?.aspectRatio) as React.CSSProperties["aspectRatio"],
    zIndex: node.style?.zIndex,
    transform: pickResponsive(node.style?.transform) as string | undefined,
    transition: node.style?.transition,
  };
  const motionStyle = getMotionStyle(motion);
  const customCssStyle = parseInlineCss(String(advanced.customCss ?? ""));
  const renderStyle: React.CSSProperties = {
    ...nodeStyle,
    ...getStylePresetStyle(props?.stylePreset),
    ...customCssStyle,
    ...motionStyle,
  };
  const isParentContainer =
    type === "page" || type === "section" || type === "container";
  const widthMode = String(
    props?.container ?? props?.widthMode ?? (type === "page" ? "full" : "boxed")
  );
  const maxWidthProp = props?.maxWidth ?? node.style?.maxWidth ?? "1280px";
  const containerWidthStyle: React.CSSProperties =
    isParentContainer && widthMode === "boxed"
      ? {
          width: "100%",
          maxWidth: clampWidth(maxWidthProp),
          marginLeft: "auto",
          marginRight: "auto",
        }
      : isParentContainer && widthMode === "full"
        ? {
            width: "100%",
            maxWidth: "none",
            marginLeft: undefined,
            marginRight: undefined,
          }
        : {};

  const hoverClass = !isLocked
    ? "hover:bg-blue-50 hover:outline hover:outline-2 hover:outline-blue-400"
    : "";

  // Base styling: border + cursor + hover effect
  const baseClass = `
    relative 
    box-border 
    select-none 
    ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
    pointer-events-auto
    ${hoverClass}
    transition-all
    ${customClass}
  `;

  const emptyState =
    children.length === 0 &&
    (type === "section" || type === "container" || type === "column");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select(node.id);
  };

  const commonDragProps = {
    id: cssId,
    draggable: isDragEnabled,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    role: typeof accessibility.role === "string" && accessibility.role ? accessibility.role : undefined,
    "aria-label":
      typeof accessibility.ariaLabel === "string" && accessibility.ariaLabel
        ? accessibility.ariaLabel
        : typeof props?.ariaLabel === "string" && props.ariaLabel
          ? props.ariaLabel
          : undefined,
    tabIndex:
      accessibility.tabIndex !== undefined && accessibility.tabIndex !== ""
        ? Number(accessibility.tabIndex)
        : undefined,
  };

  const updateInlineText = (value: string) => {
    if (isLocked) {
      return;
    }

    if (type === "button") {
      commandBus.execute(
        new UpdateNodeCommand(node.id, {
          props: {
            ...node.props,
            text: value,
            label: value,
          },
        })
      );
      return;
    }

    commandBus.execute(
      new UpdateNodeCommand(node.id, {
        props: {
          ...node.props,
          text: value,
        },
      })
    );
  };

  switch (type) {
    case "page":
      return (
        <div 
          className={`w-full min-h-screen p-6 space-y-4 ${customClass} ${
            isDarkMode ? "bg-[#0f1118] text-slate-100" : "bg-white text-slate-900"
          }`}
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...commonDragProps}
          style={normalizeStyleConflicts({
            ...renderStyle,
            ...containerWidthStyle,
          })}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
        </div>
      );

    case "section":
      return (
        <section
          className={`w-full py-12 px-4 ${baseClass}`}
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...commonDragProps}
          style={normalizeStyleConflicts({
            ...renderStyle,
            ...containerWidthStyle,
          })}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
          {emptyState && (
            <div className="border border-dashed border-slate-300 rounded-md px-3 py-4 text-xs text-slate-500 bg-slate-50/70">
              Empty section. Use Add from toolbar or sidebar to insert widgets.
            </div>
          )}
        </section>
      );

   case "container": {
  const layout = props?.layout ?? "flex";
  const direction = props?.direction ?? "row";
  const gap = props?.gap ?? 24;
  const effectiveDirection =
    direction === "row" && (device === "mobile" || device === "tablet")
      ? "column"
      : direction;

  return (
    <div
      className={`
        ${baseClass}
        ${layout === "grid" ? "grid" : "flex"}
        ${layout !== "grid"
          ? effectiveDirection === "row"
            ? "flex-row"
            : "flex-col"
          : ""}
      `}
      style={normalizeStyleConflicts({
        ...renderStyle,
        ...containerWidthStyle,
        gap: renderStyle.gap ?? toCssUnit(gap),
      })}
      data-drop-target="true"
      data-node-id={node.id}
      onClick={handleClick}
      {...commonDragProps}
    >
      {children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          blueprint={blueprint}
        />
      ))}

      {emptyState && (
        <div className="w-full rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-3 py-4 text-xs text-slate-500">
          Empty container. Insert columns or elements.
        </div>
      )}
    </div>
  );
}

    case "column":
      const width = props?.width;
      const columnLayout = props?.layout || "vertical";
      const effectiveColumnLayout =
        columnLayout === "horizontal" && device === "mobile"
          ? "vertical"
          : columnLayout;
      const columnClass =
        effectiveColumnLayout === "horizontal"
          ? "flex flex-row flex-wrap items-start gap-4"
          : "flex flex-col";
      
      return (
        <div
          className={`${baseClass} ${columnClass} min-h-24 p-2 bg-slate-50/40`}
          style={normalizeStyleConflicts({
            ...renderStyle,
            flex: (node.style?.flex as React.CSSProperties["flex"]) ?? 1,
            minWidth: 0,
            width: width ? clampWidth(width) : renderStyle.width,
          })}
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
          {emptyState && (
            <div className="border border-dashed border-slate-300 rounded-md px-3 py-4 text-xs text-slate-500 bg-white/70">
              Empty column. Drop or add elements here.
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div
          className={`${baseClass} min-h-8 p-2`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          contentEditable={!isLocked}
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={normalizeStyleConflicts(renderStyle)}
          dangerouslySetInnerHTML={{
            __html: String(props?.html ?? props?.text ?? props?.content ?? "Text"),
          }}
        />
      );

    case "heading":
      const level = (props?.level || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const HeadingTag = level;
      return (
        <HeadingTag
          className={`${baseClass} min-h-12 p-2 text-slate-900`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          contentEditable={!isLocked}
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={normalizeStyleConflicts(renderStyle)}
        >
          {String(props?.text ?? props?.content ?? "Heading")}
        </HeadingTag>
      );

    case "image":
      if (!props?.src) {
        return (
          <div
            className={`${baseClass} min-h-32 flex items-center justify-center text-slate-500 bg-slate-100`}
            data-node-id={node.id}
            onClick={handleClick}
            {...commonDragProps}
            style={normalizeStyleConflicts(renderStyle)}
          >
            Image placeholder
          </div>
        );
      }

      return (
        <img
          src={String(props?.src)}
          alt={String(props?.alt ?? "")}
          className={`${baseClass} min-h-32`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          style={normalizeStyleConflicts(renderStyle)}
        />
      );

    case "video":
      return (
        <video
          className={`${baseClass} min-h-32 w-full`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          controls={props?.controls !== false}
          autoPlay={Boolean(props?.autoplay)}
          loop={Boolean(props?.loop)}
          muted={Boolean(props?.muted || props?.autoplay)}
          playsInline={props?.playsInline !== false}
          poster={String(props?.poster ?? "")}
          style={normalizeStyleConflicts({
            ...renderStyle,
            backgroundColor: renderStyle.backgroundColor ?? "#000000",
          })}
        >
          <source src={String(props?.src ?? "")} type={String(props?.mimeType ?? "video/mp4")} />
        </video>
      );

    case "icon":
      const iconDecorative = props?.decorative !== false && !commonDragProps["aria-label"];
      return (
          <span
          className={`${baseClass} inline-flex items-center justify-center min-w-8 min-h-8`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          aria-hidden={iconDecorative ? true : undefined}
          style={normalizeStyleConflicts({
            ...renderStyle,
            paddingTop: renderStyle.paddingTop ?? renderStyle.padding ?? "8px",
            paddingRight: renderStyle.paddingRight ?? renderStyle.padding ?? "8px",
            paddingBottom: renderStyle.paddingBottom ?? renderStyle.padding ?? "8px",
            paddingLeft: renderStyle.paddingLeft ?? renderStyle.padding ?? "8px",
          })}
        >
          <IconGlyph name={props?.iconName ?? props?.glyph} size={toPx(toCssUnit(node.style?.fontSize)) ?? 24} />
        </span>
      );

    case "divider": {
      const lineColor = resolveTokenColor(
        node.style?.borderTopColor ?? node.style?.color,
        "#cbd5e1"
      );
      const lineWidth = toCssUnit(node.style?.width ?? "100%", { scale: false });
      const lineThickness = toCssUnit(
        node.style?.borderTopWidth ?? node.style?.height ?? 1
      );
      const lineStyle =
        (props?.lineStyle as React.CSSProperties["borderTopStyle"]) ??
        (pickResponsive(node.style?.borderTopStyle) as React.CSSProperties["borderTopStyle"]) ??
        "solid";
      const isVertical = props?.orientation === "vertical";

      return (
        <div
          className={`${baseClass} py-2`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          style={normalizeStyleConflicts(renderStyle)}
        >
          {isVertical ? (
            <div
              aria-hidden="true"
              style={{
                height: lineWidth,
                minHeight: lineWidth,
                borderLeftWidth: lineThickness,
                borderLeftStyle: lineStyle,
                borderLeftColor: lineColor,
              }}
            />
          ) : (
            <hr
              className="border-0"
              style={{
                width: lineWidth,
                maxWidth: "100%",
                borderTopWidth: lineThickness,
                borderTopStyle: lineStyle,
                borderTopColor: lineColor,
              }}
            />
          )}
        </div>
      );
    }

    case "spacer":
      return (
        <div
          className={`${baseClass}`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          style={normalizeStyleConflicts({
            ...renderStyle,
            width: renderStyle.width ?? "100%",
            height: toCssUnit(node.style?.height ?? 24),
            minHeight: toCssUnit(node.style?.height ?? 24),
          })}
        />
      );

    case "button":
      return (
        <button
          className={`px-4 py-2 rounded bg-blue-600 text-white ${baseClass}`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          contentEditable={!isLocked}
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={normalizeStyleConflicts({
            ...renderStyle,
            backgroundColor: resolveTokenColor(node.style?.backgroundColor, "#2563eb"),
            color: resolveTokenColor(node.style?.color, "#ffffff"),
          })}
        >
          {String(props?.label ?? props?.text ?? "Button")}
        </button>
      );

    default:
      if (PREMIUM_NODE_TYPES.has(node.type)) {
        return (
          <div
            className={baseClass}
            data-node-id={node.id}
            onClick={handleClick}
            {...commonDragProps}
          >
            <PremiumWidgetPreview
              type={node.type}
              eyebrow={typeof props?.eyebrow === "string" ? props.eyebrow : undefined}
              title={typeof props?.title === "string" ? props.title : undefined}
              body={typeof props?.body === "string" ? props.body : undefined}
              primaryCta={typeof props?.primaryCta === "string" ? props.primaryCta : undefined}
              secondaryCta={typeof props?.secondaryCta === "string" ? props.secondaryCta : undefined}
              items={Array.isArray(props?.items) ? props.items.map(String) : undefined}
              style={normalizeStyleConflicts(renderStyle)}
            />
          </div>
        );
      }

      return (
        <div
          className={`${baseClass} p-2 min-h-12`}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          style={normalizeStyleConflicts(renderStyle)}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
        </div>
      );
  }
}
