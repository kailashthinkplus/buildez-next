import type {
  BuilderBlueprint,
  BuilderNode,
  BuilderStyle,
  NodeType,
} from "../types/blueprint";
import {
  logBuilderDebug,
  summarizeBlueprint,
} from "../debug/blueprintDebug";

type Tokens = Record<string, any>;
type PremiumVariant = "editorial" | "conversion" | "visual";
type PremiumBlueprintInput = {
  pageId: string;
  pageTitle: string;
  prompt?: string;
  siteName?: string | null;
  designTokens?: Tokens | null;
  brandContext?: Record<string, unknown> | null;
  brandResolution?: Record<string, unknown> | null;
  research?: Record<string, unknown> | null;
  designBrief?: Record<string, unknown> | null;
  candidateDirective?: Record<string, unknown> | null;
  intent?: {
    industry: string;
    goal: string;
    audience: string;
    imageStyle: string;
  } | null;
  variant?: PremiumVariant;
};


const ALLOWED_NODE_TYPES = new Set<NodeType>([
  "page",
  "section",
  "container",
  "grid",
  "column",
  "heading",
  "text",
  "button",
  "image",
  "video",
  "icon",
  "divider",
  "spacer",
  "form",
  "hero",
  "leadForm",
  "cardGrid",
  "galleryLightbox",
  "features",
  "pricing",
  "gallery",
  "faq",
  "testimonials",
  "offerGrid",
  "floatingWhatsApp",
  "locationMap",
  "cta",
  "custom",
]);

const DEFAULT_COLORS = {
  background: "#f6f3ec",
  surface: "#ffffff",
  surfaceAlt: "#e8dfd1",
  textPrimary: "#17231d",
  textSecondary: "#53635a",
  primary: "#174a43",
  primaryContrast: "#ffffff",
  accent: "#9a5b37",
  border: "#d8cfc1",
};

const FALLBACK_PALETTES = [
  {
    background: "#f7f4ef",
    surface: "#ffffff",
    surfaceAlt: "#ebe3d6",
    textPrimary: "#1f2933",
    textSecondary: "#52606d",
    primary: "#0f766e",
    primaryContrast: "#ffffff",
    accent: "#b45309",
    border: "#d8cfc1",
  },
  {
    background: "#f6f7f4",
    surface: "#ffffff",
    surfaceAlt: "#e6ebe4",
    textPrimary: "#17231d",
    textSecondary: "#53635a",
    primary: "#2f6f4e",
    primaryContrast: "#ffffff",
    accent: "#8b5e34",
    border: "#d4ddd2",
  },
  {
    background: "#f7f7fb",
    surface: "#ffffff",
    surfaceAlt: "#e8e8f2",
    textPrimary: "#1d2433",
    textSecondary: "#535d72",
    primary: "#4338ca",
    primaryContrast: "#ffffff",
    accent: "#be185d",
    border: "#d9dbea",
  },
  {
    background: "#f5f7f8",
    surface: "#ffffff",
    surfaceAlt: "#e5ecef",
    textPrimary: "#102027",
    textSecondary: "#4e626b",
    primary: "#0e7490",
    primaryContrast: "#ffffff",
    accent: "#a16207",
    border: "#cfdae0",
  },
  {
    background: "#fbf7f5",
    surface: "#ffffff",
    surfaceAlt: "#f0e4df",
    textPrimary: "#2a1f1d",
    textSecondary: "#6b5a55",
    primary: "#9f1239",
    primaryContrast: "#ffffff",
    accent: "#0f766e",
    border: "#e3d2cc",
  },
];

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function paletteFor(input: PremiumBlueprintInput) {
  const designTokenColors = isRecord(input.designTokens?.colors)
    ? input.designTokens?.colors
    : null;

  if (designTokenColors && Object.keys(designTokenColors).length > 0) {
    return designTokenColors;
  }

  const brandColors =
    isRecord(input.brandResolution?.palette)
      ? input.brandResolution?.palette
      : Array.isArray(input.brandResolution?.palette)
        ? input.brandResolution?.palette
        : null;

  if (Array.isArray(brandColors) && brandColors.length >= 3) {
    return {
      background: brandColors[0],
      surface: "#ffffff",
      surfaceAlt: brandColors[1],
      textPrimary: "#111827",
      textSecondary: "#4b5563",
      primary: brandColors[2],
      primaryContrast: "#ffffff",
      accent: brandColors[3] || brandColors[2],
      border: "#d1d5db",
    };
  }

  const basis = [
    input.pageId,
    input.pageTitle,
    input.siteName,
    input.brandResolution?.companyName,
    input.brandResolution?.industry,
    input.brandResolution?.location,
    input.brandContext?.companyName,
    input.brandContext?.industry,
    input.brandContext?.offer,
    input.intent?.industry,
  ]
    .filter(Boolean)
    .join("|")
    .toLowerCase();

  const palettes = [
    {
      background: "#f7f4ef",
      surface: "#ffffff",
      surfaceAlt: "#ebe3d6",
      textPrimary: "#1f2933",
      textSecondary: "#52606d",
      primary: "#0f766e",
      primaryContrast: "#ffffff",
      accent: "#b45309",
      border: "#d8cfc1",
    },
    {
      background: "#f6f7f4",
      surface: "#ffffff",
      surfaceAlt: "#e6ebe4",
      textPrimary: "#17231d",
      textSecondary: "#53635a",
      primary: "#2f6f4e",
      primaryContrast: "#ffffff",
      accent: "#8b5e34",
      border: "#d4ddd2",
    },
    {
      background: "#fbf7f5",
      surface: "#ffffff",
      surfaceAlt: "#f0e4df",
      textPrimary: "#2a1f1d",
      textSecondary: "#6b5a55",
      primary: "#9f1239",
      primaryContrast: "#ffffff",
      accent: "#0f766e",
      border: "#e3d2cc",
    },
    {
      background: "#f5f7f8",
      surface: "#ffffff",
      surfaceAlt: "#e5ecef",
      textPrimary: "#102027",
      textSecondary: "#4e626b",
      primary: "#0e7490",
      primaryContrast: "#ffffff",
      accent: "#a16207",
      border: "#cfdae0",
    },
  ];

  const hash = Array.from(basis).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );

  return palettes[hash % palettes.length];
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPresent(value: unknown) {
  return value !== undefined && value !== null && value !== "";
}

function mergeMissingDefaults<T extends Record<string, any>>(
  defaults: T,
  provided: unknown
): T {
  if (!isRecord(provided)) return { ...defaults };

  const next: Record<string, any> = { ...provided };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const currentValue = next[key];

    if (!isPresent(currentValue)) {
      next[key] = defaultValue;
      continue;
    }

    if (isRecord(defaultValue)) {
      next[key] = isRecord(currentValue)
        ? mergeMissingDefaults(defaultValue, currentValue)
        : defaultValue;
    }
  }

  return next as T;
}

function debugNormalizeSnapshot(label: string, payload: Record<string, unknown>) {
  logBuilderDebug(`ai-v9:normalize:${label}`, payload);
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function contentText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(contentText).filter(Boolean).join(", ");
  }

  if (!isRecord(value)) return "";

  const directKeys = [
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

  for (const key of directKeys) {
    const result = contentText(value[key]);
    if (result) return result;
  }

  return "";
}

function normalizeGeneratedContentProps(
  nodeType: NodeType,
  props: Record<string, unknown>,
  input: PremiumBlueprintInput
) {
  const textKeys = [
    "eyebrow",
    "kicker",
    "title",
    "headline",
    "subheadline",
    "body",
    "description",
    "content",
    "text",
    "label",
    "caption",
    "alt",
    "placeholder",
  ];

  for (const key of textKeys) {
    if (props[key] === undefined || props[key] === null) continue;
    const value = contentText(props[key]);
    if (value) props[key] = value;
  }

  for (const key of ["primaryCta", "secondaryCta", "cta"]) {
    if (props[key] === undefined || props[key] === null) continue;
    const value = contentText(props[key]);
    if (value) props[key] = value;
  }

  if (Array.isArray(props.items)) {
    props.items = props.items
      .map((item) => contentText(item))
      .filter(Boolean);
  }

  if (nodeType === "heading" && !contentText(props.text)) {
    props.text = contentText(props.title) || replacementCopy(input, "heading");
  }

  if (nodeType === "text" && !contentText(props.text)) {
    props.text =
      contentText(props.body) ||
      contentText(props.description) ||
      contentText(props.content) ||
      replacementCopy(input, "text");
  }

  if (nodeType === "button" && !contentText(props.label)) {
    props.label =
      contentText(props.primaryCta) ||
      contentText(props.cta) ||
      contentText(props.text) ||
      replacementCopy(input, "button");
  }

  if (
    ["hero", "leadForm", "cardGrid", "galleryLightbox", "features", "pricing", "gallery", "faq", "testimonials", "offerGrid", "locationMap", "cta"].includes(nodeType)
  ) {
    props.eyebrow = contentText(props.eyebrow) || industryFor(input);
    props.title =
      contentText(props.title) ||
      contentText(props.headline) ||
      replacementCopy(input, "heading");
    props.body =
      contentText(props.body) ||
      contentText(props.description) ||
      replacementCopy(input, "text");
    props.primaryCta =
      contentText(props.primaryCta) ||
      contentText(props.cta) ||
      replacementCopy(input, "button");
    if (!Array.isArray(props.items) || props.items.length === 0) {
      props.items = [
        "Verified project context",
        "Construction quality",
        "Site visit clarity",
        "Enquiry support",
      ];
    }
  }
}

function humanText(value: unknown) {
  const raw = text(value);
  if (!raw) return "";

  const known: Record<string, string> = {
    company_website: "a credible company website",
    landing_pages: "conversion-focused landing pages",
    marketing: "marketing and lead generation",
    internal_tools: "internal tools and workflows",
    other: "a tailored website experience",
  };

  return known[raw] || raw.replace(/_/g, " ");
}

function briefValue(input: PremiumBlueprintInput, key: string) {
  return (
    humanText(input.brandResolution?.[key]) ||
    humanText(input.brandContext?.[key]) ||
    humanText(input.research?.[key]) ||
    ""
  );
}

function businessNameFor(input: PremiumBlueprintInput) {
  return (
    briefValue(input, "companyName") ||
    briefValue(input, "websiteName") ||
    input.siteName?.trim() ||
    input.pageTitle?.trim() ||
    "your brand"
  );
}

function industryFor(input: PremiumBlueprintInput) {
  return (
    briefValue(input, "industry") ||
    input.intent?.industry ||
    "service business"
  );
}

function fontPairFor(input: PremiumBlueprintInput) {
  const signal = [
    industryFor(input),
    input.brandContext?.designIntent,
    input.designBrief?.typographyDirection,
    input.designBrief?.typography,
    input.prompt,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/real estate|property|builder|construction|architect|premium|editorial|luxury/.test(signal)) {
    return { headingFont: "Cormorant Garamond", bodyFont: "Instrument Sans" };
  }

  if (/saas|software|platform|technical|product/.test(signal)) {
    return { headingFont: "Space Grotesk", bodyFont: "Source Sans 3" };
  }

  if (/restaurant|hospitality|cafe|hotel|atmospheric/.test(signal)) {
    return { headingFont: "Fraunces", bodyFont: "Manrope" };
  }

  if (/clinic|health|doctor|medical|care/.test(signal)) {
    return { headingFont: "Sora", bodyFont: "Public Sans" };
  }

  if (/portfolio|studio|creative|gallery/.test(signal)) {
    return { headingFont: "Bricolage Grotesque", bodyFont: "DM Sans" };
  }

  return { headingFont: "Bricolage Grotesque", bodyFont: "Manrope" };
}

function audienceFor(input: PremiumBlueprintInput) {
  return (
    briefValue(input, "audience") ||
    input.intent?.audience ||
    "customers comparing expertise, trust, and next steps"
  );
}

function offerFor(input: PremiumBlueprintInput) {
  return (
    briefValue(input, "offer") ||
    briefValue(input, "useCase") ||
    "a clearer path from first visit to qualified enquiry"
  );
}

function researchDescriptionFor(input: PremiumBlueprintInput) {
  return (
    text(input.research?.description) ||
    text(input.research?.h1) ||
    text(input.research?.title) ||
    ""
  );
}

function cleanNodeType(value: unknown): NodeType {
  return ALLOWED_NODE_TYPES.has(value as NodeType)
    ? (value as NodeType)
    : "container";
}

function cleanStyle(value: unknown): BuilderStyle {
  if (!isRecord(value)) return {};
  const next: BuilderStyle = {};

  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw === "string" || typeof raw === "number") {
      (next as Record<string, unknown>)[key] = raw;
      continue;
    }
    if (isRecord(raw)) {
      (next as Record<string, unknown>)[key] = raw;
    }
  }

  return next;
}

function cleanProps(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return {};
  const next: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (key === "className" || key === "style") continue;
    next[key] = raw;
  }

  return next;
}

function containsPlaceholderCopy(value: string) {
  return /\b(?:lorem ipsum|feature\s+\d+|service\s+\d+|project\s+\d+|john doe|jane smith|a sharper online experience|a modern site structure|how the page works|positioning that lands|services with depth|next step clarity|clear positioning|relevant decision cues|publish aligned)\b/i.test(
    value
  );
}

function replacementCopy(input: PremiumBlueprintInput, kind: "heading" | "text" | "button") {
  const business = businessNameFor(input);
  const offer = offerFor(input);
  const audience = audienceFor(input);

  if (kind === "button") return /book|appointment|reserve/i.test(offer) ? "Book now" : "Start the conversation";
  if (kind === "heading") return `${business} for ${audience}`;
  return `${business} helps ${audience} understand ${offer} and take the next step with confidence.`;
}

function sanitizeGeneratedCopy(
  nodeType: NodeType,
  props: Record<string, unknown>,
  input: PremiumBlueprintInput
) {
  const keys = ["text", "content", "label", "title", "body", "eyebrow", "primaryCta", "secondaryCta"];

  keys.forEach((key) => {
    const value = props[key];
    if (typeof value !== "string" || !containsPlaceholderCopy(value)) return;

    if (key === "label" || key === "primaryCta" || key === "secondaryCta") {
      props[key] = replacementCopy(input, "button");
    } else if (nodeType === "heading" || key === "title") {
      props[key] = replacementCopy(input, "heading");
    } else {
      props[key] = replacementCopy(input, "text");
    }
  });

  if (Array.isArray(props.items)) {
    props.items = props.items.map((item, index) => {
      if (typeof item === "string") {
        return containsPlaceholderCopy(item)
          ? `${offerFor(input)} detail ${index + 1}`
          : item;
      }
      if (!isRecord(item)) return item;
      const next = { ...item };
      sanitizeGeneratedCopy("custom", next, input);
      return next;
    });
  }
}

function isInvalidImageUrl(value: unknown) {
  if (typeof value !== "string") return true;
  return (
    !/^https:\/\//i.test(value) ||
    /(?:example|placeholder|placehold|dummy|invalid|test|unsplash\.com)/i.test(value)
  );
}

function imagePromptFor(input: PremiumBlueprintInput) {
  const subject = businessNameFor(input);
  const industry = industryFor(input);
  const style =
    input.intent?.imageStyle ||
    "premium professional editorial photography, natural light, high detail";
  return `${subject}, ${industry}, ${style}, website hero image, brand atmosphere, no text, no watermark`;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function customThemeFor(rawBlueprint: Record<string, any>, input: PremiumBlueprintInput) {
  const rawTheme = isRecord(rawBlueprint.theme) ? rawBlueprint.theme : {};
  const rawTokens = isRecord(rawTheme.tokens) ? rawTheme.tokens : {};
  const rawColors = isRecord(rawTokens.colors)
    ? rawTokens.colors
    : isRecord(rawTheme.colors)
      ? rawTheme.colors
      : {};
  const rawTypography = isRecord(rawTokens.typography) ? rawTokens.typography : {};
  const rawSpacing = isRecord(rawTokens.spacing) ? rawTokens.spacing : {};
  const rawRadius = isRecord(rawTokens.radius) ? rawTokens.radius : {};
  const rawShadow = isRecord(rawTokens.shadow) ? rawTokens.shadow : {};
  const rawButtons = isRecord(rawTokens.buttons) ? rawTokens.buttons : {};
  const rawPrimaryButton = isRecord(rawButtons.primary) ? rawButtons.primary : {};
  const rawSecondaryButton = isRecord(rawButtons.secondary) ? rawButtons.secondary : {};
  const colors = mergeMissingDefaults(
    {
      ...DEFAULT_COLORS,
      ...paletteFor(input),
    },
    rawColors
  );
  const typography = mergeMissingDefaults(
    {
      ...fontPairFor(input),
      baseSize: 16,
      scale: {
        h1: 58,
        h2: 38,
        h3: 24,
        body: 16,
        small: 14,
      },
    },
    rawTypography
  );
  const chosenFontPair = fontPairFor(input);
  const headingFont = String(typography.headingFont || "").toLowerCase();
  const bodyFont = String(typography.bodyFont || "").toLowerCase();
  if (
    (!headingFont || headingFont === "inter" || headingFont === "system-ui") &&
    (!bodyFont || bodyFont === "inter" || bodyFont === "system-ui")
  ) {
    typography.headingFont = chosenFontPair.headingFont;
    typography.bodyFont = chosenFontPair.bodyFont;
  }
  const spacing = mergeMissingDefaults(
    {
      sectionY: 88,
      containerX: 24,
      contentGap: 28,
      cardGap: 20,
    },
    rawSpacing
  );
  const radius = mergeMissingDefaults(
    {
      button: 10,
      card: 12,
      media: 14,
    },
    rawRadius
  );
  const shadow = mergeMissingDefaults(
    {
      card: "0 16px 42px rgba(15, 23, 42, 0.08)",
      media: "0 24px 70px rgba(15, 23, 42, 0.16)",
    },
    rawShadow
  );
  const primaryButton = mergeMissingDefaults(
    {
      backgroundColor: colors.primary,
      color: colors.primaryContrast,
      borderRadius: 10,
    },
    rawPrimaryButton
  );
  const secondaryButton = mergeMissingDefaults(
    {
      backgroundColor: "transparent",
      color: colors.textPrimary,
      borderColor: colors.border,
      borderRadius: 10,
    },
    rawSecondaryButton
  );
  const baseName =
    text(rawTheme.name) ||
    `${businessNameFor(input)} ${industryFor(input)} AI Theme`;
  const preset =
    text(rawTheme.preset) && rawTheme.preset !== "buildez-default"
      ? text(rawTheme.preset)
      : `ai-${slug(baseName || input.pageId) || input.pageId}`;

return {
  id: preset,
  name:
    baseName === "BuildEZ Default"
      ? `${businessNameFor(input)} AI Theme`
      : baseName,
  preset,
  tone: "professional",
  previewImageUrl: "",
  demoData: {
    category: industryFor(input),
    audience: audienceFor(input),
    description: offerFor(input),
    sections: [],
    highlights: [],
  },
  tokens: {
    colors,
    typography,
    spacing,
    radius,
    shadow,
    buttons: {
      primary: primaryButton,
      secondary: secondaryButton,
    },
  },
} as any;
}

function recoverRootId(
  rawBlueprint: Record<string, any>,
  rawNodes: Record<string, any>
) {
  const requestedRoot =
    typeof rawBlueprint.root === "string" && rawNodes[rawBlueprint.root]
      ? rawBlueprint.root
      : "";

  if (requestedRoot) return requestedRoot;

  const pageNode = Object.entries(rawNodes).find(
    ([, node]) => isRecord(node) && node.type === "page"
  );

  if (pageNode) return pageNode[0];

  const parentlessNode = Object.entries(rawNodes).find(
    ([, node]) => isRecord(node) && !isPresent(node.parentId)
  );

  if (parentlessNode) return parentlessNode[0];

  return Object.keys(rawNodes)[0] || "";
}

function hexToRgb(value: unknown) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  const match = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1].split("").map((char) => `${char}${char}`).join("")
      : match[1];
  const number = Number.parseInt(hex, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function relativeLuminance(color: { r: number; g: number; b: number }) {
  const convert = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * convert(color.r) + 0.7152 * convert(color.g) + 0.0722 * convert(color.b);
}

function contrastRatio(foreground: string, background: string) {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;
  const light = Math.max(relativeLuminance(fg), relativeLuminance(bg));
  const dark = Math.min(relativeLuminance(fg), relativeLuminance(bg));
  return (light + 0.05) / (dark + 0.05);
}

function isDarkColor(color: string) {
  const rgb = hexToRgb(color);
  return rgb ? relativeLuminance(rgb) < 0.38 : false;
}

function nearestBackground(
  nodes: Record<string, BuilderNode>,
  node: BuilderNode,
  fallback: string
) {
  let current: BuilderNode | undefined = node;
  while (current) {
    const background = current.style?.backgroundColor;
    if (typeof background === "string" && hexToRgb(background)) return background;
    current = current.parentId ? nodes[current.parentId] : undefined;
  }
  return fallback;
}

function ensureReadableContrast(blueprint: BuilderBlueprint) {
  const themeColors = isRecord(blueprint.theme?.tokens?.colors)
    ? blueprint.theme.tokens.colors
    : {};
  const defaultBackground =
    typeof themeColors.background === "string" && hexToRgb(themeColors.background)
      ? themeColors.background
      : "#ffffff";

  Object.values(blueprint.nodes).forEach((node) => {
    const style = node.style || {};
    const background =
      typeof style.backgroundColor === "string" && hexToRgb(style.backgroundColor)
        ? style.backgroundColor
        : nearestBackground(blueprint.nodes, node, defaultBackground);
    const readable = isDarkColor(background) ? "#F8FAFC" : "#111827";
    const muted = isDarkColor(background) ? "#E5E7EB" : "#374151";

    if (["heading", "text", "button"].includes(node.type)) {
      const current =
        typeof style.color === "string" && hexToRgb(style.color)
          ? style.color
          : "";
      const ratio = current ? contrastRatio(current, background) : null;
      if (!ratio || ratio < 4.5) {
        style.color = node.type === "text" ? muted : readable;
      }
    }

    if (node.type === "button") {
      const buttonBg =
        typeof style.backgroundColor === "string" && hexToRgb(style.backgroundColor)
          ? style.backgroundColor
          : "";
      if (buttonBg) {
        const buttonColor =
          typeof style.color === "string" && hexToRgb(style.color)
            ? style.color
            : readable;
        const ratio = contrastRatio(buttonColor, buttonBg);
        if (!ratio || ratio < 4.5) {
          style.color = isDarkColor(buttonBg) ? "#FFFFFF" : "#111827";
        }
      }
    }

    node.style = style;
  });
}

export function normalizeV9Blueprint(
  raw: unknown,
  input: PremiumBlueprintInput
): BuilderBlueprint {
  const now = new Date().toISOString();
  const rawBlueprint = isRecord(raw) ? raw : {};
  const rawNodes = isRecord(rawBlueprint.nodes) ? rawBlueprint.nodes : {};
  debugNormalizeSnapshot("raw-input", {
    root: rawBlueprint.root,
    nodeCount: Object.keys(rawNodes).length,
    keys: Object.keys(rawBlueprint),
    template: rawBlueprint.metadata?.template,
    themeTokenKeys: Object.keys(
      isRecord(rawBlueprint.theme?.tokens) ? rawBlueprint.theme.tokens : {}
    ),
  });

  if (!Object.keys(rawNodes).length) {
    debugNormalizeSnapshot("unrecoverable-before-fallback", {
      reason: "Blueprint has no nodes to normalize.",
      root: rawBlueprint.root,
      keys: Object.keys(rawBlueprint),
      metadata: rawBlueprint.metadata,
    });
    return createFallbackBlueprint(input);
  }

  debugNormalizeSnapshot("root-repair-before", {
    requestedRoot: rawBlueprint.root,
    nodeKeys: Object.keys(rawNodes).slice(0, 30),
  });
  const rawRoot = recoverRootId(rawBlueprint, rawNodes);
  debugNormalizeSnapshot("root-repair-after", {
    requestedRoot: rawBlueprint.root,
    repairedRoot: rawRoot,
    rootNodeType: isRecord(rawNodes[rawRoot]) ? rawNodes[rawRoot].type : undefined,
  });

  if (!rawRoot || !isRecord(rawNodes[rawRoot])) {
    debugNormalizeSnapshot("unrecoverable-before-fallback", {
      reason: "Blueprint root could not be recovered from nodes.",
      requestedRoot: rawBlueprint.root,
      repairedRoot: rawRoot,
      nodeCount: Object.keys(rawNodes).length,
    });
    return createFallbackBlueprint(input);
  }

  const nodes: Record<string, BuilderNode> = {};
  const visiting = new Set<string>();

  function visit(rawId: string, parentId: string | null): string | null {
    if (visiting.has(rawId)) return null;
    const source = rawNodes[rawId];
    if (!isRecord(source)) return null;

    visiting.add(rawId);
    const type = parentId === null ? "page" : cleanNodeType(source.type);
    const id =
      typeof source.id === "string" && source.id.trim()
        ? source.id.trim()
        : createId(type);
    const childIds: string[] = [];
    const props = cleanProps(source.props);
    normalizeGeneratedContentProps(type, props, input);
    sanitizeGeneratedCopy(type, props, input);
    if (type === "heading" && typeof props.level !== "string") {
      props.level = Object.values(nodes).some(
        (node) => node.type === "heading" && node.props?.level === "h1"
      )
        ? "h2"
        : "h1";
    }
    if (type === "image" && isInvalidImageUrl(props.src)) {
      props.src = "";
      if (typeof props.aiImagePrompt !== "string") {
        props.aiImagePrompt = imagePromptFor(input);
      }
      props.alt = typeof props.alt === "string" ? props.alt : "Website visual";
    }

    nodes[id] = {
      id,
      type,
      name: typeof source.name === "string" ? source.name : undefined,
      parentId,
      children: childIds,
      props,
      style: cleanStyle(source.style),
      locked: false,
      hidden: false,
    };

    const sourceChildren = Array.isArray(source.children) ? source.children : [];
    sourceChildren.forEach((child, index) => {
      if (typeof child === "string") {
        const childId = visit(child, id);
        if (childId) childIds.push(childId);
        return;
      }

      if (!isRecord(child)) return;
      const nestedId =
        typeof child.id === "string" && child.id
          ? child.id
          : `${id}-child-${index}`;
      rawNodes[nestedId] = {
        ...child,
        id: nestedId,
      };
      const childId = visit(nestedId, id);
      if (childId) childIds.push(childId);
    });

    visiting.delete(rawId);
    return id;
  }

  debugNormalizeSnapshot("node-visit-before", {
    rawRoot,
    rawNodeCount: Object.keys(rawNodes).length,
  });
  const root = visit(rawRoot, null);
  debugNormalizeSnapshot("node-visit-after", {
    rawRoot,
    root,
    generatedNodes: Object.keys(nodes).length,
    generatedNodeTypes: Object.values(nodes).reduce<Record<string, number>>(
      (counts, node) => {
        counts[node.type] = (counts[node.type] || 0) + 1;
        return counts;
      },
      {}
    ),
  });

  if (!root || !nodes[root]) {
    debugNormalizeSnapshot("unrecoverable-before-fallback", {
      reason: "Root visit failed.",
      rawRoot,
      root,
      normalizedNodeKeys: Object.keys(nodes).slice(0, 20),
    });

    return createFallbackBlueprint(input);
  }

  debugNormalizeSnapshot("theme-repair-before", {
    rawThemeKeys: Object.keys(isRecord(rawBlueprint.theme) ? rawBlueprint.theme : {}),
    rawTokenKeys: Object.keys(
      isRecord(rawBlueprint.theme?.tokens) ? rawBlueprint.theme.tokens : {}
    ),
    rawColorKeys: Object.keys(
      isRecord(rawBlueprint.theme?.tokens?.colors)
        ? rawBlueprint.theme.tokens.colors
        : isRecord(rawBlueprint.theme?.colors)
          ? rawBlueprint.theme.colors
          : {}
    ),
    rawTypographyKeys: Object.keys(
      isRecord(rawBlueprint.theme?.tokens?.typography)
        ? rawBlueprint.theme.tokens.typography
        : {}
    ),
  });
  const theme = customThemeFor(rawBlueprint, input);
  debugNormalizeSnapshot("theme-repair-after", {
    themeId: theme.id,
    tokenKeys: Object.keys(theme.tokens || {}),
    colorKeys: Object.keys(
      isRecord(theme.tokens?.colors) ? theme.tokens.colors : {}
    ),
    typographyKeys: Object.keys(
      isRecord(theme.tokens?.typography) ? theme.tokens.typography : {}
    ),
    typographyScale: isRecord(theme.tokens?.typography)
      ? theme.tokens.typography.scale
      : undefined,
  });

  const blueprint: BuilderBlueprint = {
    metadata: {
      version: 2,
      title: input.pageTitle || "AI Generated Page",
      createdAt:
        typeof rawBlueprint.metadata?.createdAt === "string"
          ? rawBlueprint.metadata.createdAt
          : now,
      updatedAt: now,
      aiGenerated: true,
      template: "ai-v9-native-blueprint",
      industry:
        typeof rawBlueprint.metadata?.industry === "string"
          ? rawBlueprint.metadata.industry
          : industryFor(input),
    },
    theme,
    root,
    nodes,
  };

  ensureReadableContrast(blueprint);

  debugNormalizeSnapshot("final-blueprint", {
    summary: summarizeBlueprint(blueprint),
  });

  return blueprint;
}

function addNode(
  blueprint: BuilderBlueprint,
  type: NodeType,
  parentId: string,
  props: Record<string, unknown>,
  style: BuilderStyle,
  name?: string
) {
  const id = createId(type);
  blueprint.nodes[id] = {
    id,
    type,
    name,
    parentId,
    children: [],
    props,
    style,
  };
  blueprint.nodes[parentId].children.push(id);
  return id;
}

function section(
  blueprint: BuilderBlueprint,
  parentId: string,
  name: string,
  style: BuilderStyle,
  props: Record<string, unknown> = {}
) {
  return addNode(
    blueprint,
    "section",
    parentId,
    props,
    {
      width: "100%",
      paddingTop: { desktop: 96, tablet: 72, mobile: 56 },
      paddingBottom: { desktop: 96, tablet: 72, mobile: 56 },
      paddingLeft: { desktop: 32, mobile: 18 },
      paddingRight: { desktop: 32, mobile: 18 },
      ...style,
    },
    name
  );
}

function stack(
  blueprint: BuilderBlueprint,
  parentId: string,
  style: BuilderStyle = {}
) {
  return addNode(
    blueprint,
    "container",
    parentId,
    { layout: "flex", direction: "column", widthMode: "boxed", maxWidth: 1180 },
    {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      width: "100%",
      maxWidth: 1180,
      marginLeft: "auto",
      marginRight: "auto",
      ...style,
    }
  );
}

export function createFallbackBlueprint(input: PremiumBlueprintInput): BuilderBlueprint {
  console.warn(
  "[BuildEZDebug] USING FALLBACK BLUEPRINT",
  {
    page: input.pageTitle,
    company: input.brandResolution?.companyName,
    prompt: input.intent,
  }
);
  return createPremiumBlueprint(input);
}

export function createPremiumBlueprint(input: PremiumBlueprintInput): BuilderBlueprint {
  const now = new Date().toISOString();
  const colors = {
    ...DEFAULT_COLORS,
    ...paletteFor(input),
  };
  const businessName = businessNameFor(input);
  const industry = industryFor(input);
  const audience = audienceFor(input);
  const offer = offerFor(input);
  const researchDescription = researchDescriptionFor(input);
  const variant = input.variant || "editorial";
  const fallbackFonts = fontPairFor(input);
  const heroGradient =
    variant === "visual"
      ? "linear-gradient(135deg, rgba(2,6,23,0.94), rgba(79,70,229,0.66), rgba(249,115,22,0.45))"
      : variant === "conversion"
        ? "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(14,165,233,0.68))"
        : "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(37,99,235,0.76))";
  const theme = {
  id: `ai-${slug(businessName || input.pageId)}`,
  name: `${businessName} AI Theme`,
  preset: `ai-${slug(businessName || input.pageId)}`,
  tone: "professional",
  previewImageUrl: "",
  demoData: {
    category: industry,
    audience,
    description: offer,
    sections: [],
    highlights: [],
  },
  tokens: {
    colors,
    typography: {
      ...fallbackFonts,
      baseSize: 16,
      scale: {
        h1: 58,
        h2: 38,
        h3: 24,
        body: 16,
        small: 14,
      },
    },
    spacing: {
      sectionY: 88,
      containerX: 24,
      contentGap: 28,
      cardGap: 20,
    },
    radius: {
      button: 10,
      card: 12,
      media: 14,
    },
    shadow: {
      card: "0 16px 42px rgba(15, 23, 42, 0.08)",
      media: "0 24px 70px rgba(15, 23, 42, 0.16)",
    },
    buttons: {
      primary: {
        backgroundColor: colors.primary,
        color: colors.primaryContrast,
        borderRadius: 10,
      },
      secondary: {
        backgroundColor: "transparent",
        color: colors.textPrimary,
        borderColor: colors.border,
        borderRadius: 10,
      },
    },
  },
} as any;

  const rootId = `${input.pageId}-v9-page`;
  const blueprint: BuilderBlueprint = {
    metadata: {
      version: 2,
      title: input.pageTitle || "AI Generated Page",
      createdAt: now,
      updatedAt: now,
      aiGenerated: true,
      template: "ai-v9-native-fallback",
      industry,
    },
    theme,
    root: rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: "page",
        parentId: null,
        children: [],
        props: {},
        style: {
          minHeight: "100vh",
          backgroundColor: colors.background,
          color: colors.textPrimary,
          fontFamily: `${fallbackFonts.bodyFont}, system-ui, sans-serif`,
        },
      },
    },
  };

  const hero = section(blueprint, rootId, "Hero", {
    minHeight: { desktop: 640, mobile: 560 },
    backgroundColor: colors.textPrimary,
    color: "#ffffff",
    backgroundImage:
      heroGradient,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
  }, {
    backgroundPrompt: imagePromptFor(input),
  });
  const heroStack = stack(blueprint, hero, { maxWidth: 960, marginLeft: 0 });
  addNode(
    blueprint,
    "text",
    heroStack,
    { text: `${industry} / ${businessName}` },
    {
      color: colors.accent,
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: "uppercase",
    }
  );
  addNode(
    blueprint,
    "heading",
    heroStack,
    {
      level: "h1",
      text:
        variant === "conversion"
          ? `Turn ${audience} into confident enquiries for ${businessName}`
          : variant === "visual"
            ? `See ${businessName} through the details buyers care about`
            : `Find the right ${industry.toLowerCase()} opportunity with ${businessName}`,
    },
    {
      color: "#ffffff",
      fontSize: { desktop: 58, tablet: 48, mobile: 36 },
      fontWeight: 900,
      lineHeight: 1.02,
      maxWidth: 900,
    }
  );
  addNode(
    blueprint,
    "text",
    heroStack,
    {
      text:
        researchDescription ||
        `Built around ${offer}, this page gives ${audience} a fast way to understand value, trust the brand, and take the next step.`,
    },
    {
      color: "rgba(255,255,255,0.82)",
      fontSize: { desktop: 20, mobile: 17 },
      lineHeight: 1.7,
      maxWidth: 720,
    }
  );
  addNode(
    blueprint,
    "button",
    heroStack,
    { label: /site visit|visit|book/i.test(offer) ? "Book a site visit" : "Explore projects", href: "#contact" },
    {
      width: "fit-content",
      backgroundColor: colors.accent,
      color: "#ffffff",
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 24,
      paddingRight: 24,
      borderRadius: 999,
      fontWeight: 800,
      boxShadow: "0 18px 38px rgba(249,115,22,0.28)",
    }
  );

  const proofGrid = addNode(
    blueprint,
    "container",
    heroStack,
    { layout: "grid", columns: 3, widthMode: "boxed", maxWidth: 760 },
    {
      display: "grid",
      gridTemplateColumns: {
        desktop: "repeat(3, minmax(0, 1fr))",
        tablet: "repeat(3, minmax(0, 1fr))",
        mobile: "1fr",
      },
      gap: 14,
      width: "100%",
      marginTop: 20,
    }
  );
  [
    ["01", "Project context"],
    ["02", "Buyer-ready details"],
    ["03", "Site visit path"],
  ].forEach(([value, label]) => {
    const stat = addNode(
      blueprint,
      "column",
      proofGrid,
      {},
      {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18,
        padding: 18,
        backgroundColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
      }
    );
    addNode(blueprint, "heading", stat, { level: "h3", text: value }, {
      color: "#ffffff",
      fontSize: 28,
      fontWeight: 900,
      lineHeight: 1,
    });
    addNode(blueprint, "text", stat, { text: label }, {
      color: "rgba(255,255,255,0.72)",
      fontSize: 13,
      lineHeight: 1.45,
    });
  });

  const proof = section(blueprint, rootId, "Proof Strip", {
    backgroundColor: colors.surface,
    paddingTop: { desktop: 34, mobile: 28 },
    paddingBottom: { desktop: 34, mobile: 28 },
    borderBottom: `1px solid ${colors.border}`,
  });
  const proofStack = stack(blueprint, proof, {
    display: "grid",
    gridTemplateColumns: {
      desktop: "1.1fr repeat(3, minmax(0, 1fr))",
      tablet: "repeat(2, minmax(0, 1fr))",
      mobile: "1fr",
    },
    alignItems: "center",
    gap: 18,
  });
  [
    ["Bangalore context", `${businessName} gives ${audience} a clearer way to compare location, fit, and next steps.`],
    ["Project clarity", `${offer} stays visible without forcing visitors to hunt through generic sections.`],
    ["Trust signals", "Verified facts, construction focus, and project imagery support the enquiry decision."],
    ["Visit path", "Every major section points toward enquiry, callback, brochure, or site visit."],
  ].forEach(([title, body]) => {
    const item = addNode(blueprint, "column", proofStack, {}, {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: 12,
    });
    addNode(blueprint, "heading", item, { level: "h3", text: title }, {
      fontSize: 18,
      fontWeight: 850,
      lineHeight: 1.15,
    });
    addNode(blueprint, "text", item, { text: body }, {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 1.55,
    });
  });

  const services = section(blueprint, rootId, "Services", {
    backgroundColor: colors.background,
  });
  const servicesStack = stack(blueprint, services);
  addNode(
    blueprint,
    "heading",
    servicesStack,
    {
      level: "h2",
      text: `What ${audience} need before they book a site visit`,
    },
    {
      fontSize: { desktop: 42, mobile: 32 },
      fontWeight: 850,
      lineHeight: 1.1,
      textAlign: "center",
    }
  );
  const grid = addNode(
    blueprint,
    "container",
    servicesStack,
    { layout: "grid", columns: 3, widthMode: "boxed", maxWidth: 1180 },
    {
      display: "grid",
      gridTemplateColumns: {
        desktop: "repeat(3, minmax(0, 1fr))",
        tablet: "repeat(2, minmax(0, 1fr))",
        mobile: "1fr",
      },
      gap: 22,
      width: "100%",
    }
  );
  [
    ["Location fit", `Help visitors understand where ${businessName} belongs in their Bangalore search.`],
    ["Project depth", `Show project types, living context, amenities, and construction confidence without fake names.`],
    ["Enquiry clarity", "Make the callback, brochure, and site-visit route obvious from the first screen."],
  ].forEach(([title, body]) => {
    const card = addNode(
      blueprint,
      "column",
      grid,
      {},
      {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        padding: 28,
        boxShadow: "0 18px 44px rgba(15,23,42,0.08)",
      }
    );
    addNode(blueprint, "heading", card, { level: "h3", text: title }, {
      fontSize: 24,
      fontWeight: 800,
      lineHeight: 1.2,
    });
    addNode(blueprint, "text", card, { text: body }, {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 1.65,
    });
  });

  const process = section(blueprint, rootId, "Process", {
    backgroundColor: colors.textPrimary,
    color: "#ffffff",
    backgroundImage:
      "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(37,99,235,0.62))",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }, {
    backgroundPrompt: `${businessName}, ${industry}, ${offer}, professional team and customer experience, premium editorial photography, no text, no watermark`,
  });
  const processGrid = stack(blueprint, process, {
    display: "grid",
    gridTemplateColumns: {
      desktop: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
      tablet: "1fr",
      mobile: "1fr",
    },
    alignItems: "center",
    gap: { desktop: 46, mobile: 26 },
  });
  const processIntro = addNode(blueprint, "column", processGrid, {}, {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  });
  addNode(blueprint, "text", processIntro, { text: "HOW THE PAGE WORKS" }, {
    color: colors.accent,
    fontSize: 13,
    fontWeight: 850,
    letterSpacing: 0,
    textTransform: "uppercase",
  });
  addNode(blueprint, "heading", processIntro, {
    level: "h2",
    text: `Guide ${audience} from confidence to contact without losing momentum`,
  }, {
    color: "#ffffff",
    fontSize: { desktop: 44, mobile: 32 },
    fontWeight: 900,
    lineHeight: 1.08,
  });
  addNode(blueprint, "text", processIntro, {
    text: `The page should help buyers move from first impression to project comparison, then to a site-visit conversation with enough context to feel confident.`,
  }, {
    color: "rgba(255,255,255,0.76)",
    fontSize: 17,
    lineHeight: 1.75,
  });
  const processCards = addNode(blueprint, "container", processGrid, {
    layout: "grid",
    columns: 1,
  }, {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  });
  [
    ["01", "Orient the buyer", "Lead with location, project category, and the reason this visit is worth their time."],
    ["02", "Show the evidence", "Use verified development facts and real project imagery before asking for contact."],
    ["03", "Make the visit easy", "Ask for preferred project type, location, and callback details in one clear path."],
  ].forEach(([step, title, body]) => {
    const card = addNode(blueprint, "column", processCards, {}, {
      display: "grid",
      gridTemplateColumns: "58px minmax(0, 1fr)",
      gap: 16,
      alignItems: "start",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.08)",
      padding: 22,
      boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
    });
    addNode(blueprint, "heading", card, { level: "h3", text: step }, {
      color: colors.accent,
      fontSize: 22,
      fontWeight: 900,
      lineHeight: 1,
    });
    const copy = addNode(blueprint, "column", card, {}, {
      display: "flex",
      flexDirection: "column",
      gap: 7,
    });
    addNode(blueprint, "heading", copy, { level: "h3", text: title }, {
      color: "#ffffff",
      fontSize: 21,
      fontWeight: 850,
      lineHeight: 1.2,
    });
    addNode(blueprint, "text", copy, { text: body }, {
      color: "rgba(255,255,255,0.7)",
      fontSize: 15,
      lineHeight: 1.6,
    });
  });

  const testimonial = section(blueprint, rootId, "Trust", {
    backgroundColor: colors.surfaceAlt,
  });
  const testimonialStack = stack(blueprint, testimonial, {
    display: "grid",
    gridTemplateColumns: {
      desktop: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
      tablet: "1fr",
      mobile: "1fr",
    },
    gap: { desktop: 34, mobile: 22 },
    alignItems: "stretch",
  });
  const quote = addNode(blueprint, "column", testimonialStack, {}, {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 22,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 26,
    padding: { desktop: 40, mobile: 26 },
    boxShadow: "0 24px 70px rgba(15,23,42,0.1)",
  });
  addNode(blueprint, "heading", quote, {
    level: "h2",
    text: `Credibility for ${businessName} starts before the enquiry form`,
  }, {
    fontSize: { desktop: 38, mobile: 30 },
    fontWeight: 900,
    lineHeight: 1.08,
  });
  addNode(blueprint, "text", quote, {
    text: `${audience} need verified facts, project visuals, construction confidence, and a practical route to inspect the right option in person.`,
  }, {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 1.75,
  });
  const imageCard = addNode(blueprint, "column", testimonialStack, {}, {
    minHeight: { desktop: 390, mobile: 280 },
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.textPrimary,
    backgroundImage:
      "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(249,115,22,0.42))",
    boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
  });
  const generatedImage = addNode(blueprint, "image", imageCard, {
    src: "",
    alt: `${businessName} premium brand visual`,
    aiImagePrompt: imagePromptFor(input),
  }, {
    width: "100%",
    height: "100%",
    minHeight: { desktop: 390, mobile: 280 },
    objectFit: "cover",
  });
  blueprint.nodes[generatedImage].hidden = true;

  const contact = section(blueprint, rootId, "Contact", {
    backgroundColor: colors.surface,
    backgroundImage:
      "linear-gradient(135deg, rgba(255,255,255,1), rgba(219,234,254,0.72))",
  });
  const contactStack = stack(blueprint, contact, {
    alignItems: "center",
    textAlign: "center",
    maxWidth: 860,
  });
  addNode(blueprint, "heading", contactStack, {
    level: "h2",
    text: `Ready to explore a ${businessName} project in person?`,
  }, {
    fontSize: { desktop: 40, mobile: 30 },
    fontWeight: 850,
    lineHeight: 1.12,
  });
  addNode(blueprint, "button", contactStack, {
    label: /site visit|visit|book/i.test(offer) ? "Book a site visit" : "Request project details",
    href: "#contact",
  }, {
    width: "fit-content",
    backgroundColor: colors.primary,
    color: colors.primaryContrast,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 12,
    fontWeight: 800,
  });

  return blueprint;
}
