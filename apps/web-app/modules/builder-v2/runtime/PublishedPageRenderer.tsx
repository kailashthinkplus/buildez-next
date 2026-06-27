import type React from "react";
import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import { defaultThemeTokens } from "../theme/defaultTheme";
import { SiteThemeFrame } from "../theme/SiteThemeFrame";
import type { SiteThemeLayout } from "../theme/siteLayout";
import type { BuilderThemeTokens } from "../theme/theme.types";
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

type Breakpoint = "desktop" | "laptop" | "tablet" | "mobile";
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

const TOKEN_COLORS: Record<string, string> = {
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

const MOTION_KEYFRAMES = `
@keyframes builder-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes builder-slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes builder-scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
#buildez-preview-root,
#buildez-preview-root * {
  box-sizing: border-box;
}
#buildez-preview-root img,
#buildez-preview-root video {
  max-width: 100%;
}
@media (max-width: 768px) {
  #buildez-preview-root [data-buildez-hide-mobile="true"] {
    display: none !important;
  }

  #buildez-preview-root [data-buildez-stack="true"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    grid-template-columns: minmax(0, 1fr) !important;
  }

  #buildez-preview-root [data-buildez-column="true"] {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    flex: 0 0 auto !important;
  }

  #buildez-preview-root [data-buildez-media="true"] {
    width: 100% !important;
    height: auto;
  }
}
@media (min-width: 769px) and (max-width: 1024px) {
  #buildez-preview-root [data-buildez-hide-tablet="true"] {
    display: none !important;
  }
}
@media (min-width: 1025px) {
  #buildez-preview-root [data-buildez-hide-desktop="true"] {
    display: none !important;
  }
}
`;

interface PublishedPageRendererProps {
  blueprint: BuilderBlueprint;
  siteLayout?: SiteThemeLayout | null;
}

export function PublishedPageRenderer({
  blueprint,
  siteLayout,
}: PublishedPageRendererProps) {
  const root = blueprint.nodes[blueprint.root];
  const themeTokens = getThemeTokens(blueprint);

  if (!root) {
    return null;
  }

  return (
    <div id="buildez-preview-root">
      <style dangerouslySetInnerHTML={{ __html: MOTION_KEYFRAMES }} />
      <style dangerouslySetInnerHTML={{ __html: collectCustomKeyframes(blueprint) }} />
      <style dangerouslySetInnerHTML={{ __html: collectMotionCss(blueprint) }} />
      <style dangerouslySetInnerHTML={{ __html: collectResponsiveCss(blueprint) }} />
      <SiteThemeFrame layout={siteLayout} tokens={themeTokens}>
        <PublishedNode node={root} blueprint={blueprint} />
      </SiteThemeFrame>
    </div>
  );
}

interface PublishedNodeProps {
  node: BuilderNode;
  blueprint: BuilderBlueprint;
}

function PublishedNode({ node, blueprint }: PublishedNodeProps) {
  if (node.parentId !== null && node.hidden) {
    return null;
  }

  const { type, props } = node;
  const children = (node.children ?? [])
    .map((id) => blueprint.nodes[id])
    .filter((child): child is BuilderNode => Boolean(child));
  const advanced = asRecord(props?.advanced);
  const accessibility = asRecord(advanced.accessibility);
  const renderStyle = getRenderStyle(node, blueprint);
  const containerWidthStyle = getContainerWidthStyle(node, blueprint);
  const commonProps = getCommonProps(node, accessibility);
  const childNodes = children.map((child) => (
    <PublishedNode key={child.id} node={child} blueprint={blueprint} />
  ));

  switch (type) {
    case "page":
      return (
        <main
          {...commonProps}
          style={cleanStyle({
            minHeight: "100vh",
            backgroundColor: renderStyle.backgroundColor ?? "#ffffff",
            color: renderStyle.color ?? "#0f172a",
            ...renderStyle,
            ...containerWidthStyle,
          })}
        >
          {childNodes}
        </main>
      );

    case "section":
      return (
        <section
          {...commonProps}
          style={cleanStyle({
            width: "100%",
            ...renderStyle,
            ...containerWidthStyle,
          })}
        >
          {childNodes}
        </section>
      );

    case "container": {
      const layout = String(props?.layout ?? "flex");
      const direction = String(props?.direction ?? "row");

      return (
        <div
          {...commonProps}
          data-buildez-stack="true"
          style={cleanStyle({
            display: layout === "grid" ? "grid" : "flex",
            flexDirection: direction as React.CSSProperties["flexDirection"],
            ...renderStyle,
            ...containerWidthStyle,
            gap: renderStyle.gap ?? toCssUnit(props?.gap ?? 24, undefined, blueprint),
          })}
        >
          {childNodes}
        </div>
      );
    }

    case "column": {
      const width = props?.width;

      return (
        <div
          {...commonProps}
          data-buildez-column="true"
          style={cleanStyle({
            display: renderStyle.display ?? "flex",
            flexDirection:
              renderStyle.flexDirection ??
              (props?.layout === "horizontal" ? "row" : "column"),
            flex: cleanStyleValue(node.style?.flex) ?? 1,
            minWidth: 0,
            ...renderStyle,
            width: width ? toCssUnit(width, { scale: false }, blueprint) : renderStyle.width,
          })}
        >
          {childNodes}
        </div>
      );
    }

    case "heading": {
      const level = normalizeHeadingLevel(props?.level);
      const HeadingTag = level;

      return (
        <HeadingTag {...commonProps} style={cleanStyle(renderStyle)}>
          {String(props?.text ?? props?.content ?? "")}
        </HeadingTag>
      );
    }

    case "text":
      return (
        <div
          {...commonProps}
          style={cleanStyle(renderStyle)}
          dangerouslySetInnerHTML={{
            __html: String(props?.html ?? props?.text ?? props?.content ?? ""),
          }}
        />
      );

    case "button": {
      const label = String(props?.label ?? props?.text ?? "Button");
      const href = stringOrUndefined(props?.href ?? props?.url);
      const buttonStyle: React.CSSProperties = {
        display: renderStyle.display ?? "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: renderStyle.paddingTop ?? renderStyle.padding ?? "10px",
        paddingRight: renderStyle.paddingRight ?? renderStyle.padding ?? "16px",
        paddingBottom: renderStyle.paddingBottom ?? renderStyle.padding ?? "10px",
        paddingLeft: renderStyle.paddingLeft ?? renderStyle.padding ?? "16px",
        borderRadius: renderStyle.borderRadius ?? "6px",
        border: renderStyle.border ?? "0",
        backgroundColor: resolveTokenColor(node.style?.backgroundColor, "#2563eb", blueprint),
        color: resolveTokenColor(node.style?.color, "#ffffff", blueprint),
        textDecoration: "none",
        ...renderStyle,
      };

      if (href) {
        return (
          <a
            {...commonProps}
            href={href}
            target={props?.target === "_blank" ? "_blank" : undefined}
            rel={props?.target === "_blank" ? "noopener noreferrer" : undefined}
            style={cleanStyle(buttonStyle)}
          >
            {label}
          </a>
        );
      }

      return (
        <button {...commonProps} type="button" style={cleanStyle(buttonStyle)}>
          {label}
        </button>
      );
    }

    case "image": {
      const src = stringOrUndefined(props?.src);
      if (!src) return null;

      return (
        <img
          {...commonProps}
          data-buildez-media="true"
          src={src}
          alt={String(props?.alt ?? "")}
          loading={props?.loading === "eager" ? "eager" : "lazy"}
          decoding="async"
          style={cleanStyle({
            display: renderStyle.display ?? "block",
            objectFit:
              renderStyle.objectFit ??
              (pickResponsive(node.style?.objectFit) as React.CSSProperties["objectFit"]) ??
              "cover",
            ...renderStyle,
          })}
        />
      );
    }

    case "video": {
      const src = stringOrUndefined(props?.src);

      return (
        <video
          {...commonProps}
          data-buildez-media="true"
          controls={props?.controls !== false}
          autoPlay={Boolean(props?.autoplay)}
          loop={Boolean(props?.loop)}
          muted={Boolean(props?.muted || props?.autoplay)}
          playsInline={props?.playsInline !== false}
          poster={stringOrUndefined(props?.poster)}
          preload="metadata"
          style={cleanStyle({
            display: renderStyle.display ?? "block",
            backgroundColor: renderStyle.backgroundColor ?? "#000000",
            ...renderStyle,
          })}
        >
          {src ? (
            <source src={src} type={String(props?.mimeType ?? "video/mp4")} />
          ) : null}
        </video>
      );
    }

    case "icon":
      return (
        <span
          {...commonProps}
          aria-hidden={
            props?.decorative !== false && !commonProps["aria-label"] ? true : undefined
          }
          style={cleanStyle({
            display: renderStyle.display ?? "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            ...renderStyle,
          })}
        >
        <IconGlyph name={props?.iconName ?? props?.glyph} size={toNumber(toCssUnit(node.style?.fontSize, undefined, blueprint)) ?? 24} />
        </span>
      );

    case "divider": {
      const lineColor = resolveTokenColor(
        node.style?.borderTopColor ?? node.style?.color,
        "#cbd5e1",
        blueprint
      );
      const lineWidth = toCssUnit(node.style?.width ?? "100%", { scale: false }, blueprint);
      const lineThickness = toCssUnit(
        node.style?.borderTopWidth ?? node.style?.height ?? 1,
        undefined,
        blueprint
      );
      const lineStyle =
        (props?.lineStyle as React.CSSProperties["borderTopStyle"]) ??
        (pickResponsive(
          node.style?.borderTopStyle
        ) as React.CSSProperties["borderTopStyle"]) ??
        "solid";
      const isVertical = props?.orientation === "vertical";

      return (
        <div {...commonProps} style={cleanStyle(renderStyle)}>
          {isVertical ? (
            <div
              aria-hidden="true"
              style={cleanStyle({
                height: lineWidth,
                minHeight: lineWidth,
                borderLeftWidth: lineThickness,
                borderLeftStyle: lineStyle,
                borderLeftColor: lineColor,
              })}
            />
          ) : (
            <hr
              style={cleanStyle({
                width: lineWidth,
                maxWidth: "100%",
                border: 0,
                borderTopWidth: lineThickness,
                borderTopStyle: lineStyle,
                borderTopColor: lineColor,
              })}
            />
          )}
        </div>
      );
    }

    case "spacer":
      return (
        <div
          {...commonProps}
          aria-hidden="true"
          style={cleanStyle({
            ...renderStyle,
            width: renderStyle.width ?? "100%",
            height: toCssUnit(node.style?.height ?? 24, undefined, blueprint),
            minHeight: toCssUnit(node.style?.height ?? 24, undefined, blueprint),
          })}
        />
      );

    default:
      if (PREMIUM_NODE_TYPES.has(node.type)) {
        return (
          <div {...commonProps}>
            <PremiumWidgetPreview
              type={node.type}
              eyebrow={typeof props?.eyebrow === "string" ? props.eyebrow : undefined}
              title={typeof props?.title === "string" ? props.title : undefined}
              body={typeof props?.body === "string" ? props.body : undefined}
              primaryCta={typeof props?.primaryCta === "string" ? props.primaryCta : undefined}
              secondaryCta={typeof props?.secondaryCta === "string" ? props.secondaryCta : undefined}
              items={Array.isArray(props?.items) ? props.items.map(String) : undefined}
              style={cleanStyle(renderStyle)}
            />
          </div>
        );
      }

      return (
        <div {...commonProps} style={cleanStyle(renderStyle)}>
          {childNodes}
        </div>
      );
  }
}

function getRenderStyle(
  node: BuilderNode,
  blueprint: BuilderBlueprint
): React.CSSProperties {
  const advanced = asRecord(node.props?.advanced);
  const motion = asRecord(advanced.motion);
  const style = node.style ?? {};
  const baseStyle: React.CSSProperties = {
    color: resolveTokenColor(style.color, "", blueprint),
    display: pickResponsive(style.display) as React.CSSProperties["display"],
    backgroundColor:
      style.backgroundColor !== undefined
        ? resolveTokenColor(style.backgroundColor, "transparent", blueprint)
        : undefined,
    backgroundImage: stringOrUndefined(style.backgroundImage),
    backgroundSize: pickResponsive(style.backgroundSize) as React.CSSProperties["backgroundSize"],
    backgroundPosition: pickResponsive(style.backgroundPosition) as React.CSSProperties["backgroundPosition"],
    backgroundRepeat: pickResponsive(style.backgroundRepeat) as React.CSSProperties["backgroundRepeat"],
    backgroundAttachment:
      (motion.engine === "parallax" || Number(motion.parallaxSpeed ?? 0) !== 0
        ? "fixed"
        : pickResponsive(style.backgroundAttachment)) as React.CSSProperties["backgroundAttachment"],
    opacity: typeof style.opacity === "number" ? style.opacity : undefined,
    fontFamily: stringOrUndefined(resolveStyleValue(style.fontFamily, blueprint)),
    fontSize: toCssUnit(style.fontSize, undefined, blueprint),
    fontWeight: style.fontWeight as React.CSSProperties["fontWeight"],
    lineHeight: style.lineHeight as React.CSSProperties["lineHeight"],
    letterSpacing: toCssUnit(style.letterSpacing, undefined, blueprint),
    textAlign: style.textAlign as React.CSSProperties["textAlign"],
    textTransform: style.textTransform as React.CSSProperties["textTransform"],
    textDecoration: style.textDecoration as React.CSSProperties["textDecoration"],
    padding: toCssUnit(style.padding, undefined, blueprint),
    paddingTop: toCssUnit(style.paddingTop, undefined, blueprint),
    paddingRight: toCssUnit(style.paddingRight, undefined, blueprint),
    paddingBottom: toCssUnit(style.paddingBottom, undefined, blueprint),
    paddingLeft: toCssUnit(style.paddingLeft, undefined, blueprint),
    margin: toCssUnit(style.margin, undefined, blueprint),
    marginTop: toCssUnit(style.marginTop, undefined, blueprint),
    marginRight: toCssUnit(style.marginRight, undefined, blueprint),
    marginBottom: toCssUnit(style.marginBottom, undefined, blueprint),
    marginLeft: toCssUnit(style.marginLeft, undefined, blueprint),
    borderRadius: toCssUnit(style.borderRadius, undefined, blueprint),
    border: stringOrUndefined(resolveStyleValue(style.border, blueprint)),
    boxShadow: stringOrUndefined(resolveStyleValue(style.boxShadow, blueprint)),
    width: toCssUnit(style.width, { scale: false }, blueprint),
    height: toCssUnit(style.height, undefined, blueprint),
    minWidth: toCssUnit(style.minWidth, { scale: false }, blueprint),
    minHeight: toCssUnit(style.minHeight, undefined, blueprint),
    maxWidth: toCssUnit(style.maxWidth, { scale: false }, blueprint),
    maxHeight: toCssUnit(style.maxHeight, undefined, blueprint),
    gap: toCssUnit(style.gap, undefined, blueprint),
    flexWrap: pickResponsive(style.flexWrap) as React.CSSProperties["flexWrap"],
    flexDirection: pickResponsive(style.flexDirection) as React.CSSProperties["flexDirection"],
    justifyContent: pickResponsive(style.justifyContent) as React.CSSProperties["justifyContent"],
    alignItems: pickResponsive(style.alignItems) as React.CSSProperties["alignItems"],
    gridTemplateColumns: resolveStyleValue(style.gridTemplateColumns, blueprint) as string | undefined,
    position: style.position,
    top: toCssUnit(style.top, undefined, blueprint),
    right: toCssUnit(style.right, undefined, blueprint),
    bottom: toCssUnit(style.bottom, undefined, blueprint),
    left: toCssUnit(style.left, undefined, blueprint),
    overflow: pickResponsive(style.overflow) as React.CSSProperties["overflow"],
    objectFit: pickResponsive(style.objectFit) as React.CSSProperties["objectFit"],
    objectPosition: pickResponsive(style.objectPosition) as React.CSSProperties["objectPosition"],
    aspectRatio: pickResponsive(style.aspectRatio) as React.CSSProperties["aspectRatio"],
    zIndex: style.zIndex,
    transform: pickResponsive(style.transform) as string | undefined,
    transition: stringOrUndefined(style.transition),
  };

  return cleanStyle({
    ...baseStyle,
    ...getStylePresetStyle(node.props?.stylePreset),
    ...parseInlineCss(String(advanced.customCss ?? "")),
    ...getMotionStyle(motion),
  });
}

function getContainerWidthStyle(
  node: BuilderNode,
  blueprint: BuilderBlueprint
): React.CSSProperties {
  if (!["page", "section", "container"].includes(node.type)) {
    return {};
  }

  const widthMode = String(
    node.props?.container ??
      node.props?.widthMode ??
      (node.type === "page" ? "full" : "boxed")
  );

  if (widthMode === "full") {
    return {
      width: "100%",
      maxWidth: "none",
      marginLeft: undefined,
      marginRight: undefined,
    };
  }

  return {
    width: "100%",
    maxWidth: toCssUnit(
      node.props?.maxWidth ?? node.style?.maxWidth ?? "1280px",
      { scale: false },
      blueprint
    ),
    marginLeft: "auto",
    marginRight: "auto",
  };
}

function getCommonProps(
  node: BuilderNode,
  accessibility: Record<string, unknown>
) {
  const advanced = asRecord(node.props?.advanced);
  const responsiveVisibility = asRecord(node.props?.__responsiveVisibility);
  const responsive = asRecord(advanced.responsive);
  const cssId = String(advanced.cssId ?? "").trim() || undefined;
  const className = String(advanced.className ?? node.props?.className ?? "").trim();
  const ariaLabel =
    typeof accessibility.ariaLabel === "string" && accessibility.ariaLabel
      ? accessibility.ariaLabel
      : typeof node.props?.ariaLabel === "string" && node.props.ariaLabel
        ? node.props.ariaLabel
      : undefined;
  const role =
    typeof accessibility.role === "string" && accessibility.role
      ? accessibility.role
      : undefined;

  return {
    id: cssId,
    className: className || undefined,
    role,
    "aria-label": ariaLabel,
    "data-buildez-node-id": node.id,
    "data-buildez-hide-desktop":
      responsiveVisibility.desktop === false || responsive.desktopMode === "hidden"
        ? "true"
        : undefined,
    "data-buildez-hide-tablet":
      responsiveVisibility.tablet === false || responsive.tabletMode === "hidden"
        ? "true"
        : undefined,
    "data-buildez-hide-mobile":
      responsiveVisibility.mobile === false || responsive.mobileMode === "hidden"
        ? "true"
        : undefined,
    tabIndex:
      accessibility.tabIndex !== undefined && accessibility.tabIndex !== ""
        ? Number(accessibility.tabIndex)
        : undefined,
  };
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
      );
      (style as Record<string, string>)[key] = rawValue;
      return style;
    }, {});
}

function getMotionStyle(motion: Record<string, unknown>): React.CSSProperties {
  const preset = String(motion.preset ?? "none");
  if (
    preset === "none" ||
    preset === "stagger-children"
  ) {
    return {};
  }

  if (preset === "custom-keyframes") {
    const animationName = getKeyframesName(String(motion.keyframes ?? ""));
    if (!animationName) return {};

    return {
      animationName,
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

function collectCustomKeyframes(blueprint: BuilderBlueprint) {
  return Object.values(blueprint.nodes)
    .map((node) => {
      const advanced = asRecord(node.props?.advanced);
      const motion = asRecord(advanced.motion);
      return typeof motion.keyframes === "string" ? motion.keyframes.trim() : "";
    })
    .filter(Boolean)
    .join("\n");
}

function collectMotionCss(blueprint: BuilderBlueprint) {
  return Object.values(blueprint.nodes)
    .map((node) => {
      const advanced = asRecord(node.props?.advanced);
      const motion = asRecord(advanced.motion);

      if (motion.preset !== "stagger-children") {
        return "";
      }

      const selector = `[data-buildez-node-id="${cssEscape(node.id)}"] > *`;
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

function cssEscape(value: string) {
  return value.replace(/["\\]/g, "\\$&");
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
  size?: number;
}) {
  const Icon = ICONS[String(name ?? "star")] ?? Star;
  return <Icon size={size} strokeWidth={2} />;
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

function getThemeTokens(blueprint: BuilderBlueprint): BuilderThemeTokens {
  return blueprint.theme?.tokens &&
    typeof blueprint.theme.tokens === "object" &&
    !Array.isArray(blueprint.theme.tokens)
    ? (blueprint.theme.tokens as unknown as BuilderThemeTokens)
    : defaultThemeTokens;
}

function getThemeValue(blueprint: BuilderBlueprint, path: string): unknown {
  const tokens = getThemeTokens(blueprint);

  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, tokens);
}

function resolveStyleValue(value: unknown, blueprint: BuilderBlueprint): unknown {
  const picked = pickResponsive(value);
  if (typeof picked !== "string" || !picked) return picked;

  const exactThemeMatch = picked.match(/^theme\.(.+)$/);
  if (exactThemeMatch) {
    return getThemeValue(blueprint, exactThemeMatch[1]) ?? picked;
  }

  if (TOKEN_COLORS[picked]) {
    return TOKEN_COLORS[picked];
  }

  return picked.replace(/theme\.([a-zA-Z0-9_.]+)/g, (match, path) => {
    const resolved = getThemeValue(blueprint, path);
    return resolved === undefined || resolved === null ? match : String(resolved);
  });
}

function resolveTokenColor(
  value: unknown,
  fallback: string,
  blueprint: BuilderBlueprint
): string | undefined {
  const resolved = resolveStyleValue(value, blueprint);
  if (resolved === undefined || resolved === null || resolved === "") {
    return fallback || undefined;
  }
  return String(resolved);
}

const RESPONSIVE_STYLE_KEYS = [
  "display",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "backgroundAttachment",
  "fontSize",
  "letterSpacing",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderRadius",
  "gap",
  "flexWrap",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "gridTemplateColumns",
  "top",
  "right",
  "bottom",
  "left",
  "overflow",
  "objectFit",
  "objectPosition",
  "aspectRatio",
  "transform",
] as const;

const CSS_UNITED_KEYS = new Set([
  "fontSize",
  "letterSpacing",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderRadius",
  "gap",
  "top",
  "right",
  "bottom",
  "left",
]);

function collectResponsiveCss(blueprint: BuilderBlueprint) {
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  Object.values(blueprint.nodes).forEach((node) => {
    const tablet = getResponsiveDeclarations(node, "tablet", blueprint);
    const mobile = getResponsiveDeclarations(node, "mobile", blueprint);
    const selector = `[data-buildez-node-id="${cssEscape(node.id)}"]`;

    if (tablet) {
      tabletRules.push(`${selector} { ${tablet} }`);
    }

    if (mobile) {
      mobileRules.push(`${selector} { ${mobile} }`);
    }
  });

  return `
@media (min-width: 769px) and (max-width: 1024px) {
${tabletRules.join("\n")}
}
@media (max-width: 768px) {
${mobileRules.join("\n")}
}
`;
}

function getResponsiveDeclarations(
  node: BuilderNode,
  breakpoint: "tablet" | "mobile",
  blueprint: BuilderBlueprint
) {
  return RESPONSIVE_STYLE_KEYS.flatMap((key) => {
    const responsive = node.style?.[key];
    if (!responsive || typeof responsive !== "object" || Array.isArray(responsive)) {
      return [];
    }

    const value = (responsive as Record<string, unknown>)[breakpoint];
    const cssValue = formatResponsiveCssValue(key, value, blueprint);
    if (cssValue === undefined) {
      return [];
    }

    return [`${camelToKebab(key)}: ${cssValue} !important;`];
  }).join(" ");
}

function formatResponsiveCssValue(
  key: string,
  value: unknown,
  blueprint: BuilderBlueprint
) {
  const resolved = resolveStyleValue(value, blueprint);
  if (resolved === undefined || resolved === null || resolved === "") {
    return undefined;
  }

  if (typeof resolved === "number") {
    return CSS_UNITED_KEYS.has(key) ? `${resolved}px` : String(resolved);
  }

  if (typeof resolved === "string") {
    const trimmed = resolved.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed) && CSS_UNITED_KEYS.has(key)) {
      return `${trimmed}px`;
    }
    return trimmed;
  }

  return String(resolved);
}

function camelToKebab(value: string) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function pickResponsive(value: unknown, breakpoint: Breakpoint = "desktop"): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const objectValue = value as Record<string, unknown>;
  return (
    objectValue[breakpoint] ??
    objectValue.desktop ??
    objectValue.laptop ??
    objectValue.tablet ??
    objectValue.mobile ??
    value
  );
}

function toCssUnit(
  value: unknown,
  _options?: { scale?: boolean },
  blueprint?: BuilderBlueprint
): string | number | undefined {
  const v = blueprint ? resolveStyleValue(value, blueprint) : pickResponsive(value);
  if (v === undefined || v === null || v === "") return undefined;

  if (typeof v === "number") {
    return `${Math.round(v * 100) / 100}px`;
  }

  if (typeof v === "string") {
    const trimmed = v.trim();
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      return `${Math.round(Number(trimmed) * 100) / 100}px`;
    }

    return trimmed;
  }

  return String(v);
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

function cleanStyle(style: React.CSSProperties): React.CSSProperties {
  const normalizedStyle = normalizeStyleConflicts(style);

  return Object.fromEntries(
    Object.entries(normalizedStyle).flatMap(([key, value]) => {
      const cleanValue = cleanStyleValue(value);
      return cleanValue === undefined ? [] : [[key, cleanValue]];
    })
  ) as React.CSSProperties;
}

function cleanStyleValue(value: unknown): string | number | undefined {
  const resolved = pickResponsive(value);
  if (resolved === undefined || resolved === null || resolved === "") {
    return undefined;
  }

  if (typeof resolved === "number") {
    return Number.isFinite(resolved) ? resolved : undefined;
  }

  if (typeof resolved === "string") {
    return resolved;
  }

  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/i) ?? value.match(/^(-?\d+(?:\.\d+)?)$/);
  return match ? Number(match[1]) : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeHeadingLevel(value: unknown) {
  const level = String(value ?? "h2");
  return ["h1", "h2", "h3", "h4", "h5", "h6"].includes(level)
    ? (level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6")
    : "h2";
}
