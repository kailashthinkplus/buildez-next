"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import { useSelectionStore } from "../store/useSelectionStore";
import { useCanvasStore, type Device } from "../store/useCanvasStore";
import { useHoverStore } from "../store/useHoverStore";
import { commandBus } from "../core/commands/CommandBus";
import { UpdateNodeCommand } from "../core/commands/MoveNodeCommand";
import { buildInlineTextProps } from "./inlineTextUpdate";
import { getResponsiveValue } from "../core/responsive";
import {
  getRenderContainerWidthStyle,
  getRenderSectionContentWidthStyle,
  resolveRenderStyle,
  resolveRenderStyleValue,
} from "../core/rendering/renderStyleResolver";
import { resolveNativeLayoutDisplay } from "../core/rendering/renderContract";
import { collectRenderCustomCss } from "../core/rendering/renderCustomCss";
import { isSystemFont, normalizeGoogleFontFamily } from "@/lib/googleFonts";
import ProductionWidgetView from "../widgets/premium/ProductionWidgetView";
import MotionRuntimeEffects from "../motion/MotionRuntimeEffects";
import { buildRuntimeMotionEntries } from "../motion/runtimeMotionEntries";
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
  "contactForm",
  "cardGrid",
  "galleryLightbox",
  "features",
  "gallery",
  "masonryGallery",
  "faq",
  "accordion",
  "tabs",
  "testimonials",
  "testimonial",
  "pricing",
  "statsCounter",
  "logoCloud",
  "team",
  "portfolio",
  "timeline",
  "featureGrid",
  "offerGrid",
  "floatingWhatsApp",
  "socialLinks",
  "locationMap",
  "smartFooter",
  "cta",
  "carousel",
  "beforeAfter",
  "table",
  "countdown",
  "codeBlock",
  "embed",
  "blogGrid",
  "postList",
  "categoryList",
  "popupModal",
]);

function renderText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(renderText).filter(Boolean).join(", ");
  }

  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const keys = [
    "label",
    "text",
    "title",
    "heading",
    "name",
    "question",
    "body",
    "description",
    "content",
    "caption",
    "value",
  ];

  for (const key of keys) {
    const result = renderText(record[key]);
    if (result) return result;
  }

  return "";
}

function renderItems(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.map(renderText).filter(Boolean);
  return items.length ? items : undefined;
}

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

      const selector = `:is([data-node-id="${cssEscape(node.id)}"],[data-buildez-node-id="${cssEscape(node.id)}"]) > *`;
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

function collectImageBackgroundCss(blueprint: BuilderBlueprint) {
  return Object.values(blueprint.nodes)
    .filter(
      (node) =>
        typeof node.style?.backgroundImage === "string" &&
        /url\(/i.test(node.style.backgroundImage)
    )
    .map((node) => {
      const selector = `[data-node-id="${cssEscape(node.id)}"][data-buildez-image-bg="true"]`;

      return `
${selector} {
  position: relative;
  overflow: hidden;
}
`;
    })
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

  if (device === "mobile" && node.props?.hideOnMobile === true) {
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
  const imageBackgroundCss = useMemo(() => collectImageBackgroundCss(blueprint), [blueprint]);
  const customCss = useMemo(() => collectRenderCustomCss(blueprint), [blueprint]);
  const motionEntries = useMemo(() => buildRuntimeMotionEntries(blueprint), [blueprint]);

  useEffect(() => {
    fontFamilies.forEach(loadGoogleFont);
  }, [fontFamilies]);

  return (
    <div id="buildez-canvas-motion-root" className="w-full h-full">
      <MotionRuntimeEffects entries={motionEntries} rootId="buildez-canvas-motion-root" />
      {customKeyframes && <style dangerouslySetInnerHTML={{ __html: customKeyframes }} />}
      {motionCss && <style dangerouslySetInnerHTML={{ __html: motionCss }} />}
      {imageBackgroundCss && <style dangerouslySetInnerHTML={{ __html: imageBackgroundCss }} />}
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
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
  if (motion.engine === "none") return {};
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
    fade: "builder-fade-in",
    "fade-in": "builder-fade-in",
    slide: "builder-slide-up",
    "slide-up": "builder-slide-up",
    scale: "builder-scale-in",
    "scale-in": "builder-scale-in",
    rotate: "builder-rotate-in",
    blur: "builder-blur-in",
    reveal: "builder-soft-reveal",
    zoom: "builder-zoom-in",
    luxury: "builder-luxury-in",
    editorial: "builder-slide-up",
    corporate: "builder-fade-in",
    minimal: "builder-fade-in",
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

function parsePercentageWidth(value: unknown): number | null {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;

  const numericValue = Number(match[1]);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
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
  const { type } = node;
  const bindings = (node.props?.cmsBindings || {}) as Record<string, { entryId?: string; fieldKey?: string }>;
  const [cmsData, setCmsData] = useState<Record<string, unknown> | null>(null);
  const bindingEntryId = Object.values(bindings).find((binding) => binding?.entryId)?.entryId;
  useEffect(() => {
    if (!bindingEntryId) return setCmsData(null);
    let active = true;
    fetch(`/api/cms/runtime/${bindingEntryId}`).then((response) => response.ok ? response.json() : null).then((body) => { if (active && body?.entry?.data) setCmsData(body.entry.data); });
    return () => { active = false; };
  }, [bindingEntryId]);
  const props = useMemo(() => {
    if (!cmsData) return node.props;
    const next = { ...node.props } as Record<string, any>;
    for (const [property, binding] of Object.entries(bindings)) {
      if (binding.fieldKey && cmsData[binding.fieldKey] !== undefined) next[property] = cmsData[binding.fieldKey];
    }
    return next;
  }, [node.props, bindings, cmsData]);
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);
  const device = useCanvasStore((s) => s.device);
  const isDarkMode = useCanvasStore((s) => s.isDarkMode);
  const setHoveredNodeId = useHoverStore((s) => s.setHoveredNodeId);
  const isSelected = selectedId === node.id;
  const isLocked = !!node.locked;
  const isDisabled = Boolean(node.props?.disabled);
  const isHidden = !!node.hidden;
  const isDragEnabled = node.id !== blueprint.root && !isLocked;
  const responsiveVisible = isVisibleOnDevice(node, device);

const canvasWidth =
  device === "mobile"
    ? 390
    : device === "tablet"
      ? 768
      : 1200;

const sizeScale =
  device === "mobile"
    ? 0.82
    : device === "tablet"
      ? 0.92
      : 1;
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
  const storedMotion =
    advanced.motion && typeof advanced.motion === "object"
      ? (advanced.motion as Record<string, unknown>)
      : {};
  const motion: Record<string, unknown> = {
    ...storedMotion,
    ...(storedMotion.preset === undefined && typeof node.props?.motionPreset === "string"
      ? { preset: node.props.motionPreset }
      : {}),
  };
  const accessibility =
    advanced.accessibility && typeof advanced.accessibility === "object"
      ? (advanced.accessibility as Record<string, unknown>)
      : {};
  const seo =
    advanced.seo && typeof advanced.seo === "object"
      ? (advanced.seo as Record<string, unknown>)
      : {};
  const visibility =
    advanced.visibility && typeof advanced.visibility === "object"
      ? (advanced.visibility as Record<string, unknown>)
      : {};
  const customClass = String(
    advanced.className ?? node.props?.className ?? ""
  ).trim();
  const cssId =
    String(advanced.cssId ?? "").trim() ||
    (node.type === "section"
      ? String(node.props?.anchorId ?? "").trim()
      : "") ||
    undefined;

  function pickResponsive(value: unknown): unknown {
    return getResponsiveValue(value, device, value);
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
    return getThemeValue(exactThemeMatch[1]) ?? undefined;
  }

  const tokenAliasMap: Record<string, string> = {
    "text.primary": "colors.text",
    "text.secondary": "colors.muted",
    "primary.500": "colors.primary",
    "primary": "colors.primary",
    "accent": "colors.accent",
    "surface": "colors.surface",
    "surface.muted": "colors.surfaceMuted",
    "background": "colors.background",
    "border": "colors.border",
  };

  if (tokenAliasMap[picked]) {
    return getThemeValue(tokenAliasMap[picked]) ?? undefined;
  }

  if (
    picked === "transparent" ||
    picked === "white" ||
    picked === "black" ||
    picked.startsWith("#") ||
    picked.startsWith("rgb") ||
    picked.startsWith("hsl") ||
    picked.startsWith("linear-gradient") ||
    picked.startsWith("radial-gradient") ||
    picked.startsWith("url(")
  ) {
    return picked;
  }

  return picked.replace(/theme\.([a-zA-Z0-9_.]+)/g, (match, path) => {
    const resolved = getThemeValue(path);
    return resolved === undefined || resolved === null ? "" : String(resolved);
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

  const shouldUseFixedBackground =
    motion.engine === "parallax" ||
    Number(motion.parallaxSpeed ?? 0) !== 0 ||
    Number(motion.parallaxHorizontal ?? 0) !== 0 ||
    Number(motion.parallaxVertical ?? 0) !== 0;

  const nodeStyle: React.CSSProperties = {
    ...resolveRenderStyle(node, blueprint, {
      device,
      scale: sizeScale,
      canvasWidth,
      textFallback: isDarkMode ? "#e5e7eb" : "#0f172a",
    }),
    ...(shouldUseFixedBackground ? { backgroundAttachment: "fixed" } : {}),
  };
  const motionStyle = getMotionStyle(motion);
  const customCssStyle = parseInlineCss(String(advanced.customCss ?? ""));
  const renderStyle: React.CSSProperties = {
  ...getStylePresetStyle(props?.stylePreset),
  ...normalizeStyleConflicts(nodeStyle),
  ...customCssStyle,
  ...motionStyle,
};
  const containerWidthStyle = getRenderContainerWidthStyle(node, blueprint, {
  device,
  scale: sizeScale,
  canvasWidth,
});

const sectionContentWidthStyle = getRenderSectionContentWidthStyle(
  node,
  blueprint,
  {
    device,
    scale: sizeScale,
    canvasWidth,
  }
);

  // Base styling: border + cursor + hover effect
  const baseClass = `
  builder-node
  group/builder-node
  relative
  box-border
  select-none
  ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
  ${isLocked ? "outline outline-2 outline-amber-400/70 bg-amber-400/[0.08]" : ""}
  ${isDisabled ? "opacity-45 grayscale" : ""}
  pointer-events-auto
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
    title:
      typeof seo.title === "string" && seo.title.trim()
        ? seo.title
        : undefined,
    "data-node-label": String(
      node.props?.label ?? node.props?.name ?? node.name ?? ""
    ).trim() || undefined,
    "data-node-parent-id": node.parentId ?? undefined,
    "data-node-type": node.type,
    "data-visibility-condition":
      visibility.condition && visibility.condition !== "always"
        ? String(visibility.condition)
        : undefined,
    "data-schema-hint":
      seo.schema && seo.schema !== "none" ? String(seo.schema) : undefined,
    "data-seo-description":
      typeof seo.description === "string" && seo.description.trim()
        ? seo.description
        : undefined,
    "data-ai-action-note":
      typeof node.props?.aiActionNote === "string"
        ? node.props.aiActionNote
        : undefined,
    "data-href":
      node.type === "button"
        ? String(node.props?.href ?? node.props?.url ?? "").trim() || undefined
        : undefined,
    "data-target":
      node.type === "button" && node.props?.target
        ? String(node.props.target)
        : undefined,
    "data-widget-variant":
      typeof node.props?.variant === "string" && node.props.variant
        ? node.props.variant
        : undefined,
    "data-buildez-image-bg":
      typeof node.style?.backgroundImage === "string" &&
      /url\(/i.test(node.style.backgroundImage)
        ? "true"
        : undefined,
  };

  const updateInlineText = (value: string) => {
    if (isLocked) {
      return;
    }

    /*
     * Starting a native drag from the selected node's handle blurs its
     * contentEditable surface. That blur is interaction chrome, not an
     * inline-text edit, and must not create an UpdateNodeCommand.
     */
    const activeDragId =
      typeof window !== "undefined"
        ? ((window as any).__builderDragId as string | null)
        : null;

    if (activeDragId === node.id) {
      return;
    }

    const props = buildInlineTextProps(node, value);
    if (!props) return;

    commandBus.execute(
      new UpdateNodeCommand(node.id, { props })
    );
  };

  switch (type) {
    case "page":
  return (
    <div
      className={`builder-node-page ${customClass}`}
      data-drop-target="true"
      data-node-id={node.id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...commonDragProps}
      style={normalizeStyleConflicts({
        ...renderStyle,
        ...containerWidthStyle,
        minHeight: renderStyle.minHeight ?? "100vh",
        width: renderStyle.width ?? "100%",
      })}
    >
      {children.map((child) => (
        <RenderNode key={child.id} node={child} blueprint={blueprint} />
      ))}
    </div>
  );

    case "section": {
  const sectionLayout =
    renderStyle.display === "grid" ? "grid" : "flex";

  return (
    <section
      className={baseClass}
      data-drop-target="true"
      data-node-id={node.id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...commonDragProps}
      style={normalizeStyleConflicts({
        ...renderStyle,
        ...containerWidthStyle,
        boxSizing: "border-box",

        // Layout must run on the inner wrapper that owns the children.
        display: "block",
        flexDirection: undefined,
        flexWrap: undefined,
        justifyContent: undefined,
        alignItems: undefined,
        gap: undefined,
        gridTemplateColumns: undefined,
      })}
    >
      <div
        data-section-content="true"
        style={normalizeStyleConflicts({
          ...sectionContentWidthStyle,
          boxSizing: "border-box",

          display: sectionLayout,
          flexDirection:
            sectionLayout === "flex"
              ? renderStyle.flexDirection ?? "column"
              : undefined,
          flexWrap:
            sectionLayout === "flex"
              ? renderStyle.flexWrap
              : undefined,
          justifyContent: renderStyle.justifyContent,
          alignItems: renderStyle.alignItems,
          gap: renderStyle.gap,
          gridTemplateColumns:
            sectionLayout === "grid"
              ? renderStyle.gridTemplateColumns
              : undefined,
        })}
      >
        {children.map((child) => (
          <RenderNode
            key={child.id}
            node={child}
            blueprint={blueprint}
          />
        ))}

        {emptyState && (
          <div
            data-canvas-placeholder="empty-section"
            className="rounded-lg border border-dashed border-blue-300/70 bg-blue-50/70 px-3 py-4 text-xs font-medium text-blue-700 shadow-inner"
          >
            Empty section. Use Add from toolbar or sidebar to insert widgets.
          </div>
        )}
      </div>
    </section>
  );
}

   case "container": {
  const layout = resolveNativeLayoutDisplay({
    resolvedDisplay: renderStyle.display,
    layoutProp: props?.layout,
  });
  const direction = String(renderStyle.flexDirection ?? props?.direction ?? "row");
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
        ${
          layout !== "grid"
            ? effectiveDirection === "row"
              ? "flex-row"
              : "flex-col"
            : ""
        }
      `}
      style={normalizeStyleConflicts({
        ...renderStyle,
        ...containerWidthStyle,
        boxSizing: "border-box",
        minWidth: renderStyle.minWidth ?? 0,

        display: layout,

        flexDirection:
          layout === "grid"
            ? renderStyle.flexDirection
            : (effectiveDirection as React.CSSProperties["flexDirection"]),

        gridTemplateColumns:
          layout === "grid"
            ? renderStyle.gridTemplateColumns ??
              `repeat(${Number(props?.columns ?? 3)}, minmax(0, 1fr))`
            : renderStyle.gridTemplateColumns,

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
        <div
          data-canvas-placeholder="empty-container"
          className="w-full rounded-lg border border-dashed border-sky-300/80 bg-sky-50/70 px-3 py-4 text-xs font-medium text-sky-700 shadow-inner"
        >
          Empty container. Insert columns or elements.
        </div>
      )}
    </div>
  );
}

    case "column": {
      const columnLayout = String(props?.layout ?? "vertical");

      const parentNode = node.parentId
        ? blueprint.nodes[node.parentId]
        : undefined;

      const configuredParentDirection = String(
        resolveRenderStyleValue(
          parentNode?.style?.flexDirection,
          blueprint,
          device
        ) ??
          parentNode?.props?.direction ??
          "row"
      );
      const parentDirection =
        (device === "mobile" || device === "tablet") && configuredParentDirection === "row"
          ? "column"
          : configuredParentDirection;

      const parentDisplay = resolveNativeLayoutDisplay({
        resolvedDisplay: parentNode
          ? resolveRenderStyle(parentNode, blueprint, { device, scale: 1 }).display
          : undefined,
        layoutProp: parentNode?.props?.layout,
      });
      const isGridParent = parentDisplay === "grid";

      const isVerticallyStacked =
        parentDirection === "column" ||
        parentDirection === "column-reverse";

      const effectiveColumnLayout =
        columnLayout === "horizontal" && device === "mobile"
          ? "vertical"
          : columnLayout;

      const rawResolvedWidth =
  typeof renderStyle.width === "string" ||
  typeof renderStyle.width === "number"
    ? renderStyle.width
    : undefined;

const resolvedWidth =
  !isVerticallyStacked &&
  rawResolvedWidth === "100%" &&
  parentNode?.type === "container" &&
  (parentNode.children?.length ?? 0) > 1
    ? undefined
    : rawResolvedWidth;

      const positionMode = renderStyle.position ?? "relative";

      const usesPositionOffsets =
        positionMode === "relative" ||
        positionMode === "absolute" ||
        positionMode === "fixed" ||
        positionMode === "sticky";

      const siblingCount =
  parentNode?.type === "container"
    ? Math.max(1, parentNode.children?.length ?? 1)
    : 1;

const equalWidth = `${100 / siblingCount}%`;

const columnFlex = isVerticallyStacked
  ? "0 0 auto"
  : isGridParent
    ? undefined
  : resolvedWidth
    ? `0 0 ${resolvedWidth}`
    : `0 0 ${equalWidth}`;

      const columnWidth = isVerticallyStacked
  ? "100%"
  : isGridParent
    ? resolvedWidth
  : resolvedWidth ?? equalWidth;

const columnMaxWidth = isVerticallyStacked
  ? "100%"
  : isGridParent
    ? resolvedWidth ?? "none"
  : resolvedWidth ?? equalWidth;

      return (
        <div
          className={`
            ${baseClass}
            flex
            ${
              effectiveColumnLayout === "horizontal"
                ? "flex-row flex-wrap items-start"
                : "flex-col"
            }
          `}
          style={normalizeStyleConflicts({
            ...renderStyle,

            display: "flex",
            flexDirection:
              effectiveColumnLayout === "horizontal"
                ? "row"
                : "column",

            flex: columnFlex,
            width: columnWidth,
            maxWidth: columnMaxWidth,
            minWidth: 0,

            position: positionMode,

            top: usesPositionOffsets
              ? renderStyle.top
              : undefined,
            right: usesPositionOffsets
              ? renderStyle.right
              : undefined,
            bottom: usesPositionOffsets
              ? renderStyle.bottom
              : undefined,
            left: usesPositionOffsets
              ? renderStyle.left
              : undefined,

            transform: usesPositionOffsets
              ? renderStyle.transform
              : undefined,
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
            <div
              data-canvas-placeholder="empty-column"
              className="w-full border border-dashed border-indigo-300/80 bg-white/80 px-3 py-4 text-xs font-medium text-indigo-700 shadow-inner"
            >
              Empty column. Drop or add elements here.
            </div>
          )}
        </div>
      );
    }

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
      style={normalizeStyleConflicts({
        ...renderStyle,
        display: "block",
        width: renderStyle.width ?? "100%",
        whiteSpace: String(props?.text ?? "").includes("\n") ? "pre-line" : renderStyle.whiteSpace,
      })}
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
      className={baseClass}
      data-node-id={node.id}
      onClick={handleClick}
      {...commonDragProps}
      contentEditable={!isLocked}
      suppressContentEditableWarning
      onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
      style={normalizeStyleConflicts({
        ...renderStyle,
        display: "block",
        width: renderStyle.width ?? "100%",
        whiteSpace: String(props?.text ?? "").includes("\n") ? "pre-line" : renderStyle.whiteSpace,
      })}
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
            paddingTop: renderStyle.paddingTop ?? renderStyle.padding,
            paddingRight: renderStyle.paddingRight ?? renderStyle.padding,
            paddingBottom: renderStyle.paddingBottom ?? renderStyle.padding,
            paddingLeft: renderStyle.paddingLeft ?? renderStyle.padding,
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
          className={baseClass}
          data-node-id={node.id}
          onClick={handleClick}
          {...commonDragProps}
          contentEditable={!isLocked}
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={normalizeStyleConflicts({
            ...renderStyle,
            backgroundColor:
              renderStyle.backgroundColor ??
              resolveTokenColor(node.style?.backgroundColor, "#2563eb"),
            color: renderStyle.color ?? resolveTokenColor(node.style?.color, "#ffffff"),
          })}
        >
          {renderText(props?.label ?? props?.text ?? props?.primaryCta ?? props?.cta) ||
            "Learn more"}
        </button>
      );

    default:
      if (PREMIUM_NODE_TYPES.has(node.type)) {
        const { position, top, right, bottom, left, zIndex, ...innerWidgetStyle } = renderStyle;
        return (
          <div
            className={baseClass}
            data-node-id={node.id}
            onClick={handleClick}
            {...commonDragProps}
            style={{ position, top, right, bottom, left, zIndex }}
          >
            <ProductionWidgetView
              type={node.type}
              eyebrow={renderText(props?.eyebrow) || undefined}
              title={renderText(props?.title ?? props?.headline) || undefined}
              body={
                renderText(props?.body ?? props?.description ?? props?.content) ||
                undefined
              }
              primaryCta={
                renderText(props?.primaryCta ?? props?.cta ?? props?.label) ||
                undefined
              }
              secondaryCta={renderText(props?.secondaryCta) || undefined}
              items={renderItems(props?.items)}
              style={normalizeStyleConflicts(innerWidgetStyle)}
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
