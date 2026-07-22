import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { V9Workflow } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function tokenColor(blueprint: BuilderBlueprint, key: string, fallback: string) {
  const colors = isRecord(blueprint.theme?.tokens?.colors)
    ? (blueprint.theme.tokens.colors as Record<string, unknown>)
    : {};

  return typeof colors[key] === "string" ? colors[key] : fallback;
}

function themeColors(blueprint: BuilderBlueprint) {
  const colors = isRecord(blueprint.theme?.tokens?.colors)
    ? (blueprint.theme.tokens.colors as Record<string, unknown>)
    : {};

  return {
    background: typeof colors.background === "string" ? colors.background : "#f6f3ec",
    surface: typeof colors.surface === "string" ? colors.surface : "#ffffff",
    surfaceAlt: typeof colors.surfaceAlt === "string" ? colors.surfaceAlt : "#ebe5d9",
    textPrimary: typeof colors.textPrimary === "string" ? colors.textPrimary : "#18332f",
    textSecondary: typeof colors.textSecondary === "string" ? colors.textSecondary : "#5f6b67",
    primary: typeof colors.primary === "string" ? colors.primary : "#004d40",
    primaryContrast:
      typeof colors.primaryContrast === "string" ? colors.primaryContrast : "#ffffff",
    accent: typeof colors.accent === "string" ? colors.accent : "#ff6f00",
    border: typeof colors.border === "string" ? colors.border : "#d8d2c4",
  };
}

function ensureMotion(
  node: BuilderNode,
  preset: "fade-in" | "slide-up" | "scale-in" | "stagger-children",
  index = 0
) {
  const advanced = isRecord(node.props?.advanced)
    ? { ...(node.props?.advanced as Record<string, unknown>) }
    : {};
  if (isRecord(advanced.motion)) return false;

  advanced.motion = {
    preset,
    duration: preset === "stagger-children" ? 0.65 : 0.72,
    delay: Math.min(index * 0.06, 0.42),
    ease: "cubic-bezier(.2,.8,.2,1)",
    ...(preset === "stagger-children" ? { stagger: 0.08 } : {}),
  };
  node.props = {
    ...node.props,
    advanced,
  };
  return true;
}

function ensureParallax(node: BuilderNode, speed = 0.12) {
  const advanced = isRecord(node.props?.advanced)
    ? { ...(node.props?.advanced as Record<string, unknown>) }
    : {};
  const motion = isRecord(advanced.motion)
    ? { ...(advanced.motion as Record<string, unknown>) }
    : {};

  if (motion.engine === "parallax" && Number(motion.parallaxSpeed ?? 0) !== 0) {
    return false;
  }

  advanced.motion = {
    ...motion,
    preset: motion.preset || "fade-in",
    duration: motion.duration || 0.72,
    delay: motion.delay || 0,
    ease: motion.ease || "cubic-bezier(.2,.8,.2,1)",
    engine: "parallax",
    parallaxSpeed: speed,
  };
  node.props = {
    ...node.props,
    advanced,
  };
  return true;
}

const BUILDEZ_STYLE_COLORS = new Set([
  "#2563eb",
  "#1d4ed8",
  "#3b82f6",
  "#0ea5e9",
  "#0284c7",
  "#f97316",
  "#ea580c",
  "#0f172a",
  "#1e293b",
  "#334155",
  "#475569",
  "#64748b",
  "#f8fafc",
  "#eef2f7",
  "#e2e8f0",
]);

const PREMIUM_SECTION_TYPES = new Set([
  "hero",
  "leadForm",
  "cardGrid",
  "features",
  "gallery",
  "galleryLightbox",
  "faq",
  "testimonials",
  "pricing",
  "offerGrid",
  "locationMap",
  "cta",
]);

function isSectionLike(node: BuilderNode) {
  return node.type === "section" || PREMIUM_SECTION_TYPES.has(node.type);
}

function repairThemeColorTokens(blueprint: BuilderBlueprint) {
  if (!isRecord(blueprint.theme?.tokens)) return false;

  const tokens = blueprint.theme.tokens as Record<string, unknown>;
  const colors = isRecord(tokens.colors)
    ? { ...(tokens.colors as Record<string, unknown>) }
    : {};
  const before = JSON.stringify(colors);

  if (colors.background === "#f8fafc") colors.background = "#f6f3ec";
  if (colors.surfaceAlt === "#eef2f7") colors.surfaceAlt = "#ebe5d9";
  if (colors.textPrimary === "#0f172a") colors.textPrimary = "#18332f";
  if (colors.textSecondary === "#475569") colors.textSecondary = "#5f6b67";
  if (["#2563eb", "#1d4ed8", "#3b82f6", "#0ea5e9", "#0284c7"].includes(String(colors.primary))) {
    colors.primary = "#174a43";
  }
  if (["#f97316", "#ea580c"].includes(String(colors.accent))) colors.accent = "#9a5b37";
  if (colors.border === "#cbd5e1" || colors.border === "#dbe3ef") {
    colors.border = "#d8d2c4";
  }

  tokens.colors = colors;
  return JSON.stringify(colors) !== before;
}

function replaceBuildEzColor(value: string, colors: ReturnType<typeof themeColors>) {
  const replacements: Record<string, string> = {
    "#2563eb": colors.primary,
    "#1d4ed8": colors.primary,
    "#3b82f6": colors.primary,
    "#0ea5e9": colors.primary,
    "#0284c7": colors.primary,
    "#f97316": colors.accent,
    "#ea580c": colors.accent,
    "#0f172a": colors.textPrimary,
    "#1e293b": colors.textPrimary,
    "#334155": colors.textSecondary,
    "#475569": colors.textSecondary,
    "#64748b": colors.textSecondary,
    "#f8fafc": colors.background,
    "#eef2f7": colors.surfaceAlt,
    "#e2e8f0": colors.border,
  };

  let next = value;

  Object.entries(replacements).forEach(([from, to]) => {
    next = next.replace(new RegExp(from, "gi"), to);
  });

  return next;
}

function repairStyleColors(value: unknown, colors: ReturnType<typeof themeColors>): unknown {
  if (typeof value === "string") {
    return replaceBuildEzColor(value, colors);
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairStyleColors(item, colors));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        repairStyleColors(item, colors),
      ])
    );
  }

  return value;
}

function styleHasBuildEzColor(style: unknown) {
  if (typeof style === "string") {
    const lower = style.toLowerCase();
    return [...BUILDEZ_STYLE_COLORS].some((color) => lower.includes(color));
  }

  if (Array.isArray(style)) return style.some(styleHasBuildEzColor);
  if (isRecord(style)) return Object.values(style).some(styleHasBuildEzColor);

  return false;
}

function repairLeakedBuildEzColors(blueprint: BuilderBlueprint) {
  let changed = repairThemeColorTokens(blueprint);
  const colors = themeColors(blueprint);

  Object.values(blueprint.nodes).forEach((node) => {
    if (!styleHasBuildEzColor(node.style)) return;

    node.style = repairStyleColors(node.style, colors) as BuilderNode["style"];
    changed = true;
  });

  return changed;
}

function textOf(node: BuilderNode) {
  const props = node.props || {};
  return String(props.text || props.html || props.label || "").toLowerCase();
}

function setNodeText(node: BuilderNode, value: string) {
  const props = node.props || {};

  if (typeof props.text === "string") {
    node.props = { ...props, text: value };
    return;
  }

  if (typeof props.html === "string") {
    node.props = { ...props, html: value };
    return;
  }

  if (typeof props.label === "string") {
    node.props = { ...props, label: value };
  }
}

function childrenOf(blueprint: BuilderBlueprint, node: BuilderNode) {
  return (node.children || [])
    .map((id) => blueprint.nodes[id])
    .filter((child): child is BuilderNode => Boolean(child));
}

function directPageSections(blueprint: BuilderBlueprint, root: BuilderNode) {
  return childrenOf(blueprint, root).filter(isSectionLike);
}

function walk(
  blueprint: BuilderBlueprint,
  node: BuilderNode,
  visit: (node: BuilderNode, depth: number) => void,
  depth = 0
) {
  visit(node, depth);

  childrenOf(blueprint, node).forEach((child) =>
    walk(blueprint, child, visit, depth + 1)
  );
}

function setDescendantTextColor(
  blueprint: BuilderBlueprint,
  node: BuilderNode,
  color: string,
  mutedColor: string
) {
  walk(blueprint, node, (child) => {
    if (child.type === "heading") {
      child.style = {
        ...child.style,
        color,
      };
    }

    if (child.type === "text") {
      child.style = {
        ...child.style,
        color: mutedColor,
      };
    }

    if (child.type === "button") {
      child.style = {
        ...child.style,
        color: child.style?.color || color,
      };
    }
  });
}

function brandNameFor(workflow: V9Workflow) {
  const resolved = workflow.brandResolution?.companyName;
  const context = workflow.brandContext?.companyName;
  const siteName = workflow.siteName;

  return typeof resolved === "string" && resolved.trim()
    ? resolved.trim()
    : typeof context === "string" && context.trim()
      ? context.trim()
      : typeof siteName === "string" && siteName.trim()
        ? siteName.trim()
        : "the brand";
}

function removeFakeTestimonials(
  blueprint: BuilderBlueprint,
  workflow: V9Workflow
) {
  const brand = brandNameFor(workflow);

  Object.values(blueprint.nodes).forEach((node) => {
    if (node.type !== "heading" && node.type !== "text") return;

    const text = textOf(node);

    if (/what our clients say|client testimonials|testimonials/i.test(text)) {
      node.props = {
        ...node.props,
        text: "What buyers need to know before they enquire",
      };
    }

    if (
      /r\. kumar|s\. patel|a\. mehta|homeowner|business owner|investor|a satisfied client/i.test(
        text
      )
    ) {
      node.props = {
        ...node.props,
        text: `${brand} presents clear decision cues, offer context, and an easy enquiry path for visitors.`,
      };
    }

    if (
      /exceeded our expectations|best decision|aesthetically pleasing|dream home|unparalleled/i.test(
        text
      )
    ) {
      node.props = {
        ...node.props,
        text:
          "Visitors can review the offer, understand the positioning, and move toward enquiry without relying on unverified claims.",
      };
    }
  });
}

function repairGenericCopy(blueprint: BuilderBlueprint, workflow: V9Workflow) {
  const brand = brandNameFor(workflow);
  const location =
    typeof workflow.brandResolution?.location === "string"
      ? workflow.brandResolution.location
      : "Bangalore";
  let changed = false;

  Object.values(blueprint.nodes).forEach((node) => {
    if (node.type !== "heading" && node.type !== "text" && node.type !== "button") {
      return;
    }

    const raw = String(
      node.props?.text || node.props?.html || node.props?.label || ""
    ).trim();
    const lower = raw.toLowerCase();
    if (!raw) return;

    if (/^welcome to\b/i.test(raw)) {
      setNodeText(node, `${brand} developments in ${location}`);
      changed = true;
      return;
    }

    if (/^contact us$/i.test(raw)) {
      setNodeText(node, node.type === "button" ? "Book a site visit" : "Plan a site visit");
      changed = true;
      return;
    }

    if (/^our projects$/i.test(raw)) {
      setNodeText(node, "Residential, commercial, and hospitality work");
      changed = true;
      return;
    }

    if (/^about us$/i.test(raw)) {
      setNodeText(node, `${brand} at a glance`);
      changed = true;
      return;
    }

    if (/^our process$/i.test(raw)) {
      setNodeText(node, "From first enquiry to site visit");
      changed = true;
      return;
    }

    if (/^why choose us$/i.test(raw)) {
      setNodeText(node, "What makes this experience different");
      changed = true;
      return;
    }

    if (/^project name\s*\d*$/i.test(raw) || /^project\s+\d+$/i.test(raw)) {
      setNodeText(node, "Project type and buyer fit");
      changed = true;
      return;
    }

    if (/^(available residence|luxury villa|commercial space|hospitality project)$/i.test(raw)) {
      setNodeText(node, "Project category and enquiry fit");
      changed = true;
      return;
    }

    if (/^customer satisfaction$/i.test(raw)) {
      setNodeText(node, "Buyer confidence");
      changed = true;
      return;
    }

    if (/^featured work$/i.test(raw)) {
      setNodeText(node, "Project category and enquiry fit");
      changed = true;
      return;
    }

    if (/get in touch|schedule a site visit/i.test(lower)) {
      setNodeText(
        node,
        `Share your preferred location and project type, and ${brand} can guide the next site-visit conversation.`
      );
      changed = true;
      return;
    }

    if (/join our community of satisfied customers/i.test(lower)) {
      setNodeText(node, "Buyer confidence shaped by delivered and ongoing development work.");
      changed = true;
    }
  });

  return changed;
}

function isDarkBackground(value: unknown) {
  if (typeof value !== "string") return false;

  const lower = value.toLowerCase();

  return (
    lower.includes("#0") ||
    lower.includes("#1") ||
    lower.includes("rgb(0") ||
    lower.includes("rgba(0") ||
    lower.includes("linear-gradient")
  );
}

function ensureReadableHeroText(
  blueprint: BuilderBlueprint,
  hero: BuilderNode,
  textPrimary: string
) {
  const heroBg =
    hero.style?.backgroundColor || hero.style?.backgroundImage || "";

  if (isDarkBackground(heroBg)) {
    setDescendantTextColor(
      blueprint,
      hero,
      "#ffffff",
      "rgba(255,255,255,0.78)"
    );
  } else {
    setDescendantTextColor(
      blueprint,
      hero,
      textPrimary,
      "rgba(17,24,39,0.72)"
    );
  }
}

function firstContainerChild(blueprint: BuilderBlueprint, section: BuilderNode) {
  return childrenOf(blueprint, section).find(
    (child) => child.type === "container" || child.type === "column"
  );
}

function slugValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function layoutSeedFor(workflow: V9Workflow) {
  const directive = isRecord(workflow.candidateDirective)
    ? workflow.candidateDirective
    : {};
  const value = [
    directive.id,
    directive.creativeDirection,
    directive.layoutArchetype,
    workflow.prompt,
  ]
    .filter(Boolean)
    .join("|");

  return value
    .split("")
    .reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) >>> 0, 5381);
}

function sectionNameFrom(value: unknown) {
  if (typeof value === "string") {
    return value.split(":")[0].trim();
  }

  if (isRecord(value)) {
    const name = value.name || value.title || value.section || value.label;
    return typeof name === "string" ? name.trim() : "";
  }

  return "";
}

function sectionContractFor(workflow: V9Workflow, count: number) {
  const brief = isRecord(workflow.designBrief) ? workflow.designBrief : {};
  const metadataContract = workflow.blueprint?.metadata?.sectionContract;
  const sources = [
    metadataContract,
    brief.pageSections,
    brief.sections,
    brief.sectionNarrative,
  ];
  const names = sources
    .flatMap((source) => (Array.isArray(source) ? source : []))
    .map(sectionNameFrom)
    .filter(Boolean);

  const fallbackNames = [
    "Hero",
    "Overview",
    "Showcase",
    "Proof",
    "Process",
    "Conversion",
    "Contact",
  ];

  return Array.from({ length: count }, (_, index) => {
    const name = names[index] || fallbackNames[index] || `Section ${index + 1}`;
    return {
      name,
      anchorId: slugValue(name) || `section-${index + 1}`,
    };
  });
}

function enforceBriefDrivenLayout(
  blueprint: BuilderBlueprint,
  workflow: V9Workflow,
  sections: BuilderNode[],
  colors: ReturnType<typeof themeColors>
) {
  if (sections.length < 3) return false;

  let changed = false;
  const layoutSeed = layoutSeedFor(workflow);
  const patternOffset = layoutSeed % 7;

  sections.forEach((section, index) => {
    const contract = sectionContractFor(workflow, sections.length)[index];
    section.name = section.name || contract.name;
    section.props = {
      ...section.props,
      anchorId: section.props?.anchorId || contract.anchorId,
    };

    const container = firstContainerChild(blueprint, section);
    if (!container) return;

    const baseGrid = {
      display: "grid",
      width: "100%",
      maxWidth: container.style?.maxWidth || 1180,
      marginLeft: "auto",
      marginRight: "auto",
      gap: container.style?.gap || { desktop: 44, tablet: 30, mobile: 22 },
    };

    const pattern = (index + patternOffset) % 7;

    if (pattern === 0) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "minmax(0, 1.18fr) minmax(260px, 0.62fr)",
          tablet: "1fr",
          mobile: "1fr",
        },
        alignItems: "center",
        marginLeft: 0,
      };
      changed = true;
      return;
    }

    if (pattern === 1) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "minmax(240px, 0.82fr) minmax(0, 1.18fr)",
          tablet: "1fr",
          mobile: "1fr",
        },
        alignItems: "center",
      };
      changed = true;
      return;
    }

    if (pattern === 2) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "minmax(0, 0.95fr) minmax(0, 1.15fr)",
          tablet: "repeat(2, minmax(0, 1fr))",
          mobile: "1fr",
        },
        alignItems: "start",
      };
      changed = true;
      return;
    }

    if (pattern === 3) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "repeat(3, minmax(0, 1fr))",
          tablet: "repeat(2, minmax(0, 1fr))",
          mobile: "1fr",
        },
        gap: 0,
        borderTop: `1px solid ${colors.border}`,
        borderLeft: `1px solid ${colors.border}`,
      };
      childrenOf(blueprint, container).forEach((child) => {
        child.style = {
          ...child.style,
          borderRight: child.style?.borderRight || `1px solid ${colors.border}`,
          borderBottom: child.style?.borderBottom || `1px solid ${colors.border}`,
          borderRadius: 0,
          boxShadow: "none",
        };
      });
      changed = true;
      return;
    }

    if (pattern === 4) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "minmax(260px, 0.72fr) minmax(0, 1.28fr)",
          tablet: "1fr",
          mobile: "1fr",
        },
        alignItems: "center",
      };
      changed = true;
      return;
    }

    if (pattern === 5) {
      section.style = {
        ...section.style,
        paddingTop: { desktop: 34, mobile: 26 },
        paddingBottom: { desktop: 34, mobile: 26 },
        backgroundColor: colors.textPrimary,
        color: "#ffffff",
      };
      container.style = {
        ...container.style,
        display: "flex",
        flexDirection: { desktop: "row", mobile: "column" },
        justifyContent: "space-between",
        gap: { desktop: 38, mobile: 18 },
        overflow: "hidden",
      };
      changed = true;
      return;
    }

    if (pattern === 6) {
      container.style = {
        ...container.style,
        ...baseGrid,
        gridTemplateColumns: {
          desktop: "minmax(0, 0.78fr) minmax(0, 1.22fr)",
          tablet: "1fr",
          mobile: "1fr",
        },
        alignItems: "start",
      };
      changed = true;
    }
  });

  return changed;
}

function uniqueNodeId(blueprint: BuilderBlueprint, base: string) {
  let id = base || "section";
  let suffix = 2;

  while (blueprint.nodes[id]) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  return id;
}

function sectionSignature(blueprint: BuilderBlueprint, section: BuilderNode) {
  return [
    section.name,
    section.props?.anchorId,
    collectNodeText(blueprint, section).slice(0, 160),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function collectNodeText(blueprint: BuilderBlueprint, node: BuilderNode): string {
  const own = String(
    node.props?.text ||
      node.props?.html ||
      node.props?.label ||
      node.props?.title ||
      node.props?.body ||
      node.props?.primaryCta ||
      ""
  );
  return [
    own,
    ...childrenOf(blueprint, node).map((child) => collectNodeText(blueprint, child)),
  ].join(" ");
}

function hasUsefulContent(blueprint: BuilderBlueprint, node: BuilderNode) {
  const text = collectNodeText(blueprint, node).trim();
  if (text.length >= 28) return true;
  return childrenOf(blueprint, node).some((child) =>
    ["image", "form", "leadForm", "gallery", "galleryLightbox", "offerGrid", "cardGrid"].includes(
      child.type
    )
  );
}

function ensurePremiumWidgetProps(
  node: BuilderNode,
  workflow: V9Workflow,
  index: number
) {
  if (!PREMIUM_SECTION_TYPES.has(node.type)) return false;
  const brand = brandNameFor(workflow);
  const typeLabel = node.type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const props = { ...(node.props || {}) };
  const before = JSON.stringify(props);

  props.eyebrow =
    typeof props.eyebrow === "string" && props.eyebrow.trim()
      ? props.eyebrow
      : typeLabel;
  props.title =
    typeof props.title === "string" && props.title.trim()
      ? props.title
      : `${typeLabel} for ${brand}`;
  props.body =
    typeof props.body === "string" && props.body.trim()
      ? props.body
      : `${brand} can use this section to clarify details, show proof, and guide visitors toward the next step.`;
  props.primaryCta =
    typeof props.primaryCta === "string" && props.primaryCta.trim()
      ? props.primaryCta
      : /form|cta|lead/i.test(node.type)
        ? "Book a site visit"
        : "Explore details";
  if (!Array.isArray(props.items) || props.items.length === 0) {
    props.items = [
      "Verified context",
      "Quality signal",
      "Clear comparison",
      "Confident next step",
    ];
  }
  props.anchorId = props.anchorId || slugValue(`${node.type}-${index + 1}`);

  node.props = props;
  return JSON.stringify(props) !== before;
}

function isPlainWhite(value: unknown) {
  return (
    typeof value === "string" &&
    ["#fff", "#ffffff", "white", "rgb(255,255,255)", "rgb(255, 255, 255)"].includes(
      value.trim().toLowerCase()
    )
  );
}

function hasImageBackground(node: BuilderNode) {
  return (
    typeof node.style?.backgroundImage === "string" &&
    /url\(/i.test(node.style.backgroundImage)
  );
}

function addImageOverlay(style: BuilderNode["style"] | undefined) {
  const backgroundImage = style?.backgroundImage;
  if (typeof backgroundImage !== "string" || !/url\(/i.test(backgroundImage)) {
    return style || {};
  }
  if (/linear-gradient/i.test(backgroundImage)) return style || {};
  return {
    ...(style || {}),
    backgroundImage: `linear-gradient(90deg, rgba(8,13,20,0.76), rgba(8,13,20,0.42) 48%, rgba(8,13,20,0.22)), ${backgroundImage}`,
  };
}

function ensureSectionPolish(
  blueprint: BuilderBlueprint,
  workflow: V9Workflow,
  sections: BuilderNode[],
  colors: ReturnType<typeof themeColors>
) {
  let changed = false;
  const palette = [
    colors.background,
    colors.surface,
    colors.surfaceAlt,
    `linear-gradient(180deg, ${colors.surfaceAlt} 0%, ${colors.surface} 100%)`,
    colors.textPrimary,
  ];

  sections.forEach((section, index) => {
    const isHero = index === 0 || section.type === "hero";
    const needsContent = !hasUsefulContent(blueprint, section);
    if (ensurePremiumWidgetProps(section, workflow, index)) changed = true;

    section.style = {
      ...section.style,
      position: section.style?.position || "relative",
      overflow: section.style?.overflow || "hidden",
      paddingTop: section.style?.paddingTop || {
        desktop: isHero ? 110 : 92,
        tablet: isHero ? 86 : 74,
        mobile: isHero ? 64 : 54,
      },
      paddingBottom: section.style?.paddingBottom || {
        desktop: isHero ? 110 : 92,
        tablet: isHero ? 86 : 74,
        mobile: isHero ? 64 : 54,
      },
      paddingLeft: section.style?.paddingLeft || { desktop: 32, mobile: 18 },
      paddingRight: section.style?.paddingRight || { desktop: 32, mobile: 18 },
      transition:
        section.style?.transition ||
        "background-color 260ms ease, box-shadow 260ms ease, transform 260ms ease",
    };

    const background = section.style.backgroundColor;
    if (!section.style.backgroundImage && (!background || isPlainWhite(background))) {
      const next = palette[index % palette.length];
      if (String(next).startsWith("linear-gradient")) {
        section.style.backgroundImage = next;
        section.style.backgroundColor = colors.surface;
      } else {
        section.style.backgroundColor = next;
      }
      changed = true;
    }

    if (hasImageBackground(section) || section.props?.backgroundPrompt) {
      section.style = addImageOverlay(section.style);
      section.style.backgroundSize = section.style.backgroundSize || "cover";
      section.style.backgroundPosition = section.style.backgroundPosition || "center";
      section.props = {
        ...section.props,
        overlay: section.props?.overlay || "dark-gradient",
      };
      setDescendantTextColor(blueprint, section, "#ffffff", "rgba(255,255,255,0.82)");
      changed = true;
    } else if (isDarkBackground(section.style.backgroundColor || section.style.backgroundImage)) {
      setDescendantTextColor(blueprint, section, "#ffffff", "rgba(255,255,255,0.78)");
      changed = true;
    } else {
      setDescendantTextColor(blueprint, section, colors.textPrimary, colors.textSecondary);
    }

    if (needsContent && !PREMIUM_SECTION_TYPES.has(section.type)) {
      const container = firstContainerChild(blueprint, section) || section;
      const headingId = uniqueNodeId(blueprint, `${section.id}-repair-heading`);
      const bodyId = uniqueNodeId(blueprint, `${section.id}-repair-body`);
      blueprint.nodes[headingId] = {
        id: headingId,
        type: "heading",
        parentId: container.id,
        children: [],
        props: { level: "h2", text: `${brandNameFor(workflow)} decision support` },
        style: {
          color: colors.textPrimary,
          fontSize: { desktop: 36, mobile: 28 },
          lineHeight: 1.08,
          fontWeight: 800,
          maxWidth: 640,
        },
      };
      blueprint.nodes[bodyId] = {
        id: bodyId,
        type: "text",
        parentId: container.id,
        children: [],
        props: {
          html: "This section clarifies the offer, gives visitors useful context, and keeps the next action easy to find.",
        },
        style: {
          color: colors.textSecondary,
          fontSize: { desktop: 17, mobile: 15 },
          lineHeight: 1.7,
          maxWidth: 680,
        },
      };
      container.children = [...(container.children || []), headingId, bodyId];
      changed = true;
    }

    if (ensureMotion(section, isHero ? "fade-in" : "slide-up", index)) changed = true;
    if ((isHero || hasImageBackground(section)) && ensureParallax(section, isHero ? 0.12 : 0.08)) {
      changed = true;
    }
  });

  return changed;
}

function createSupportSection(
  blueprint: BuilderBlueprint,
  root: BuilderNode,
  contract: { name: string; anchorId: string },
  index: number,
  workflow: V9Workflow,
  colors: ReturnType<typeof themeColors>
) {
  const brand = brandNameFor(workflow);
  const sectionId = uniqueNodeId(blueprint, `section-${contract.anchorId || index + 1}`);
  const containerId = uniqueNodeId(blueprint, `${sectionId}-container`);
  const eyebrowId = uniqueNodeId(blueprint, `${sectionId}-eyebrow`);
  const headingId = uniqueNodeId(blueprint, `${sectionId}-heading`);
  const bodyId = uniqueNodeId(blueprint, `${sectionId}-body`);
  const actionId = uniqueNodeId(blueprint, `${sectionId}-action`);
  const isFinal = index >= 6 || /contact|enquiry|visit|book|conversion/i.test(contract.name);

  blueprint.nodes[sectionId] = {
    id: sectionId,
    type: "section",
    name: contract.name,
    parentId: root.id,
    children: [containerId],
    props: {
      anchorId: contract.anchorId,
      advanced: {
        motion: {
          preset: "fade-in",
          duration: 0.72,
          delay: Math.min(index * 0.06, 0.42),
          ease: "cubic-bezier(.2,.8,.2,1)",
        },
      },
    },
    style: {
      backgroundColor: isFinal ? colors.textPrimary : index % 2 ? colors.surface : colors.background,
      color: isFinal ? "#ffffff" : colors.textPrimary,
      paddingTop: { desktop: 86, tablet: 70, mobile: 54 },
      paddingBottom: { desktop: 86, tablet: 70, mobile: 54 },
      paddingLeft: { desktop: 32, mobile: 18 },
      paddingRight: { desktop: 32, mobile: 18 },
      borderTop: `1px solid ${colors.border}`,
    },
  };

  blueprint.nodes[containerId] = {
    id: containerId,
    type: "container",
    parentId: sectionId,
    children: [eyebrowId, headingId, bodyId, actionId],
    props: {
      advanced: {
        motion: {
          preset: "stagger-children",
          duration: 0.65,
          stagger: 0.08,
          delay: 0.04,
          ease: "cubic-bezier(.2,.8,.2,1)",
        },
      },
    },
    style: {
      display: "grid",
      gridTemplateColumns: {
        desktop: "minmax(220px, 0.7fr) minmax(0, 1.3fr)",
        tablet: "1fr",
        mobile: "1fr",
      },
      gap: { desktop: 34, mobile: 16 },
      maxWidth: 1180,
      marginLeft: "auto",
      marginRight: "auto",
      alignItems: "start",
    },
  };

  blueprint.nodes[eyebrowId] = {
    id: eyebrowId,
    type: "text",
    parentId: containerId,
    children: [],
    props: { html: contract.name },
    style: {
      color: isFinal ? "rgba(255,255,255,0.72)" : colors.accent,
      fontSize: { desktop: 12, mobile: 11 },
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: "uppercase",
    },
  };

  blueprint.nodes[headingId] = {
    id: headingId,
    type: "heading",
    parentId: containerId,
    children: [],
    props: {
      level: "h2",
      text: `${contract.name} for ${brand}`,
    },
    style: {
      color: isFinal ? "#ffffff" : colors.textPrimary,
      fontSize: { desktop: 42, tablet: 34, mobile: 28 },
      lineHeight: 1.05,
      fontWeight: 800,
      maxWidth: 620,
    },
  };

  blueprint.nodes[bodyId] = {
    id: bodyId,
    type: "text",
    parentId: containerId,
    children: [],
    props: {
      html: `${brand} can use this module to clarify verified details, compare options, and guide visitors toward a confident next step without adding unsupported claims.`,
    },
    style: {
      color: isFinal ? "rgba(255,255,255,0.78)" : colors.textSecondary,
      fontSize: { desktop: 18, mobile: 16 },
      lineHeight: 1.7,
      maxWidth: 620,
    },
  };

  blueprint.nodes[actionId] = {
    id: actionId,
    type: "button",
    parentId: containerId,
    children: [],
    props: {
      label: isFinal ? "Book a site visit" : "Explore details",
      href: isFinal ? "#contact" : `#${contract.anchorId}`,
    },
    style: {
      width: "fit-content",
      backgroundColor: isFinal ? colors.accent : colors.primary,
      color: colors.primaryContrast,
      borderRadius: 12,
      paddingTop: 13,
      paddingBottom: 13,
      paddingLeft: 22,
      paddingRight: 22,
      fontWeight: 800,
    },
  };

  root.children = [...(root.children || []), sectionId];
}

function ensureMinimumBriefSections(
  blueprint: BuilderBlueprint,
  workflow: V9Workflow,
  root: BuilderNode,
  colors: ReturnType<typeof themeColors>
) {
  const sections = childrenOf(blueprint, root).filter(
    isSectionLike
  );
  if (sections.length >= 7) return false;

  const contracts = sectionContractFor(workflow, Math.max(7, sections.length));
  const signatures = sections.map((section) => sectionSignature(blueprint, section));
  let changed = false;

  for (const contract of contracts) {
    if (directPageSections(blueprint, root).length >= 7) {
      break;
    }

    const slug = contract.anchorId || slugValue(contract.name);
    const firstWord = slug.split("-")[0] || slug;
    const exists = signatures.some(
      (signature) => signature.includes(slug) || signature.includes(firstWord)
    );

    if (exists) continue;

    createSupportSection(
      blueprint,
      root,
      contract,
      directPageSections(blueprint, root).length,
      workflow,
      colors
    );
    signatures.push(`${contract.name} ${slug}`.toLowerCase());
    changed = true;
  }

  while (directPageSections(blueprint, root).length < 7) {
    const index = directPageSections(blueprint, root).length;
    const contract = sectionContractFor(workflow, 7)[index] || {
      name: `Decision Support ${index + 1}`,
      anchorId: `decision-support-${index + 1}`,
    };
    createSupportSection(blueprint, root, contract, index, workflow, colors);
    changed = true;
  }

  return changed;
}

export function runV9VisualRepairAgent(workflow: V9Workflow) {
  const blueprint = workflow.blueprint;
  const warnings: string[] = [];

  if (!blueprint) {
    return {
      ok: false,
      changed: false,
      warnings: ["Missing blueprint."],
    };
  }

  const root = blueprint.nodes[blueprint.root];

  if (!root) {
    return {
      ok: false,
      changed: false,
      warnings: ["Missing root node."],
    };
  }

  let changed = false;

  if (repairLeakedBuildEzColors(blueprint)) {
    changed = true;
  }

  const colors = themeColors(blueprint);
  const textPrimary = tokenColor(blueprint, "textPrimary", colors.textPrimary);
  const surface = tokenColor(blueprint, "surface", colors.surface);

  if (ensureMinimumBriefSections(blueprint, workflow, root, colors)) {
    warnings.push("Restored missing brief-driven landing-page sections.");
    changed = true;
  }

  const headings = Object.values(blueprint.nodes).filter(
    (node) => node.type === "heading"
  );

  if (headings.length) {
    headings.forEach((heading, index) => {
      const currentLevel = heading.props?.level;

      heading.props = {
        ...heading.props,
        level: index === 0 ? "h1" : currentLevel || "h2",
      };
    });

    changed = true;
  }

  const sections = directPageSections(blueprint, root);

  const hero = sections[0];

  if (hero) {
    hero.style = {
      ...hero.style,
      minHeight: hero.style?.minHeight || {
        desktop: 720,
        tablet: 620,
        mobile: 560,
      },
      paddingTop: hero.style?.paddingTop || {
        desktop: 110,
        tablet: 88,
        mobile: 68,
      },
      paddingBottom: hero.style?.paddingBottom || {
        desktop: 110,
        tablet: 88,
        mobile: 68,
      },
      backgroundSize: hero.style?.backgroundSize || "cover",
      backgroundPosition: hero.style?.backgroundPosition || "center",
      display: hero.style?.display || "flex",
      alignItems: hero.style?.alignItems || "center",
      position: hero.style?.position || "relative",
      overflow: hero.style?.overflow || "hidden",
      backgroundColor: hero.style?.backgroundColor || colors.background,
      backgroundImage:
        hero.style?.backgroundImage ||
        `linear-gradient(135deg, ${colors.background} 0%, ${colors.surfaceAlt} 48%, rgba(255,111,0,0.16) 100%)`,
      borderBottom: hero.style?.borderBottom || `1px solid ${colors.border}`,
    };

    ensureReadableHeroText(blueprint, hero, textPrimary);
    if (ensureParallax(hero, 0.12)) {
      warnings.push("Added parallax motion to the hero/background visual.");
    }
    changed = true;
  }

  headings.slice(0, 1).forEach((heading) => {
    heading.style = {
      ...heading.style,
      fontSize: heading.style?.fontSize || {
        desktop: 60,
        tablet: 48,
        mobile: 36,
      },
      lineHeight: heading.style?.lineHeight || 1.02,
      fontWeight: heading.style?.fontWeight || 760,
      maxWidth: heading.style?.maxWidth || 980,
    };
  });

  sections.forEach((section, index) => {
    const isHero = section.id === hero?.id;
    const isOdd = index % 2 === 1;
    section.style = {
      ...section.style,
      backgroundColor:
        section.style?.backgroundColor ||
        (isOdd ? colors.surface : colors.background),
      paddingTop: section.style?.paddingTop || {
        desktop: 96,
        tablet: 76,
        mobile: 56,
      },
      paddingBottom: section.style?.paddingBottom || {
        desktop: 96,
        tablet: 76,
        mobile: 56,
      },
      paddingLeft: section.style?.paddingLeft || {
        desktop: 32,
        mobile: 18,
      },
      paddingRight: section.style?.paddingRight || {
        desktop: 32,
        mobile: 18,
      },
      borderTop:
        section.style?.borderTop ||
        (!isHero && index > 0 ? `1px solid ${colors.border}` : undefined),
      backgroundImage:
        section.style?.backgroundImage ||
        (!isHero && index % 3 === 2
          ? `linear-gradient(180deg, ${colors.surfaceAlt} 0%, ${colors.surface} 100%)`
          : undefined),
    };
    if (ensureMotion(section, isHero ? "fade-in" : "slide-up", index)) {
      changed = true;
    }
    if (!isHero && index % 3 === 2 && ensureParallax(section, 0.08)) {
      changed = true;
    }
    if (
      section.props?.backgroundPrompt ||
      section.style?.backgroundImage ||
      isDarkBackground(section.style?.backgroundColor)
    ) {
      setDescendantTextColor(
        blueprint,
        section,
        isDarkBackground(section.style?.backgroundColor || section.style?.backgroundImage)
          ? "#ffffff"
          : colors.textPrimary,
        isDarkBackground(section.style?.backgroundColor || section.style?.backgroundImage)
          ? "rgba(255,255,255,0.78)"
          : colors.textSecondary
      );
      if (section.props?.backgroundPrompt || section.style?.backgroundImage) {
        section.props = {
          ...section.props,
          overlay: section.props?.overlay || "dark-gradient",
        };
      }
      changed = true;
    }
    changed = true;
  });

  if (ensureSectionPolish(blueprint, workflow, directPageSections(blueprint, root), colors)) {
    warnings.push(
      "Repaired sparse sections, plain backgrounds, image overlays, contrast, and motion."
    );
    changed = true;
  }

  if (enforceBriefDrivenLayout(blueprint, workflow, sections, colors)) {
    warnings.push(
      "Applied design-brief-driven section contract and varied layout archetypes."
    );
    changed = true;
  }

  Object.values(blueprint.nodes).forEach((node) => {
    if (
  node.type === "container" &&
  (node.props?.layout === "grid" || node.style?.display === "grid")
) {
  node.style = {
    ...node.style,
    gap: node.style?.gap || {
      desktop: 28,
      mobile: 18,
    },
    alignItems: node.style?.alignItems || "stretch",
    borderRadius: node.style?.borderRadius || 18,
  };
  if (ensureMotion(node, "stagger-children")) {
    changed = true;
  }

  changed = true;
}
    

    if (node.type === "column") {
      const parent = node.parentId ? blueprint.nodes[node.parentId] : null;
      const parentIsGrid =
        parent?.props?.layout === "grid" || parent?.style?.display === "grid";

      if (parentIsGrid) {
        node.style = {
          ...node.style,
          backgroundColor: node.style?.backgroundColor || colors.surface,
          border: node.style?.border || `1px solid ${colors.border}`,
          borderRadius: node.style?.borderRadius || 18,
          boxShadow:
            node.style?.boxShadow ||
            "0 18px 45px rgba(24, 51, 47, 0.10)",
          overflow: node.style?.overflow || "hidden",
          transition:
            node.style?.transition ||
            "transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease",
        };
        if (ensureMotion(node, "slide-up")) {
          changed = true;
        }
        changed = true;
      }
    }

    if (node.type === "image") {
      node.style = {
        ...node.style,
        width: node.style?.width || "100%",
        minHeight: node.style?.minHeight || 280,
        aspectRatio: node.style?.aspectRatio || "4 / 3",
        objectFit: node.style?.objectFit || "cover",
        borderRadius: node.style?.borderRadius || 18,
        boxShadow:
          node.style?.boxShadow ||
          "0 24px 70px rgba(24, 51, 47, 0.16)",
        transition:
          node.style?.transition ||
          "transform 360ms ease, filter 360ms ease, box-shadow 360ms ease",
      };
      if (ensureMotion(node, "scale-in")) {
        changed = true;
      }
      changed = true;
    }

    if (node.type === "button") {
      node.style = {
        ...node.style,
        backgroundColor:
          node.style?.backgroundColor ||
          (node.props?.href ? colors.primary : undefined),
        color: node.style?.color || colors.primaryContrast,
        borderRadius: node.style?.borderRadius || 12,
        paddingTop: node.style?.paddingTop || 14,
        paddingBottom: node.style?.paddingBottom || 14,
        paddingLeft: node.style?.paddingLeft || 24,
        paddingRight: node.style?.paddingRight || 24,
        fontWeight: node.style?.fontWeight || 800,
        boxShadow: node.style?.boxShadow || "0 14px 32px rgba(0, 77, 64, 0.18)",
        transition:
          node.style?.transition ||
          "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
      };
      changed = true;
    }
  });

  removeFakeTestimonials(blueprint, workflow);
  if (repairGenericCopy(blueprint, workflow)) {
    changed = true;
  }
  if (repairLeakedBuildEzColors(blueprint)) {
    changed = true;
  }

  blueprint.nodes[blueprint.root].style = {
    ...blueprint.nodes[blueprint.root].style,
    backgroundColor: blueprint.nodes[blueprint.root].style?.backgroundColor || surface,
    color: blueprint.nodes[blueprint.root].style?.color || textPrimary,
  };
  changed = true;

  return {
    ok: true,
    changed,
    warnings,
  };
}
