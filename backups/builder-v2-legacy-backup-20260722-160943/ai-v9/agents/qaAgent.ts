import type { V9Workflow } from "./types";

const GENERIC_COPY_PATTERNS = [
  /\bwelcome to\b/i,
  /\bour services\b/i,
  /\bproperty sales\b/i,
  /\binvestment advice\b/i,
  /\bproperty management\b/i,
  /get in touch/i,
  /we're here to help/i,
  /our office/i,
  /john doe/i,
  /jane smith/i,
  /123 business/i,
  /\(123\)\s*456-7890/i,
  /contact@business\.com/i,
  /follow us/i,
  /latest updates and news/i,
  /all rights reserved/i,
  /schedule a consultation/i,
  /credible company website/i,
  /brand context/i,
  /offer clarity/i,
  /publish aligned/i,
  /same native blueprint/i,
  /a sharper online experience/i,
  /\bfor name\b/i,
  /\bname is positioned\b/i,
  /\bproject name\s*\d*\b/i,
  /\bwhy choose us\b/i,
  /\bcustomer satisfaction\b/i,
  /\bluxury villa\b/i,
  /\bavailable residence\b/i,
  /\bcommercial space\b/i,
  /\bhospitality project\b/i,
  /\belevate your living experience\b/i,
  /\bexplore our latest developments\b/i,
  /\bvisualize your future home\b/i,
  /\bdiscover our diverse range\b/i,
  /\bservice\s+\d+\b/i,
  /\bfeature\s+\d+\b/i,
  /\bproject\s+\d+\b/i,
  /\bfeatured work\b/i,
  /\ba brief description\b/i,
  /\bproject\s+[a-f]\b/i,
  /\bfocused .+ section keeps the page complete\b/i,
  /\blogo of (?:a|an|the)\b/i,
  /\bnational newspaper logo\b/i,
  /\bmagazine logo\b/i,
];

const DEFAULT_COLORS = new Set([
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

const MAX_RARE_SCORE = 96;
const SECTION_LIKE_TYPES = new Set([
  "section",
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

const PREMIUM_GRID_TYPES = new Set([
  "offerGrid",
  "cardGrid",
  "features",
  "gallery",
  "galleryLightbox",
  "pricing",
  "testimonials",
  "faq",
]);

const PREMIUM_CTA_TYPES = new Set([
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

function textContent(value: unknown) {
  return typeof value === "string" ? value : "";
}

function collectText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  return Object.values(value as Record<string, unknown>).map(collectText).join(" ");
}

function slugValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sectionContractNames(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const record = item as Record<string, unknown>;
        return typeof record.name === "string"
          ? record.name
          : typeof record.title === "string"
            ? record.title
            : "";
      }
      return "";
    })
    .map((name) => name.trim())
    .filter(Boolean);
}

function descendantNodes(
  nodes: V9Workflow["blueprint"]["nodes"],
  nodeId: string
) {
  const root = nodes[nodeId];
  if (!root) return [];

  return [
    root,
    ...(root.children || []).flatMap((childId) => descendantNodes(nodes, childId)),
  ];
}

function meaningfulWordCount(value: string) {
  return value
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9'-]/gi, ""))
    .filter((word) => word.length >= 3).length;
}

function isRealUrl(value: unknown) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function hasRealImageAsset(node: V9Workflow["blueprint"]["nodes"][string]) {
  if (node.type === "image" && isRealUrl(node.props?.src)) return true;

  const backgroundImage = node.style?.backgroundImage;
  return (
    typeof backgroundImage === "string" &&
    /url\(["']?https?:\/\//i.test(backgroundImage)
  );
}

function hasMotion(node: V9Workflow["blueprint"]["nodes"][string]) {
  const advanced = node.props?.advanced;
  return Boolean(
    advanced &&
      typeof advanced === "object" &&
      !Array.isArray(advanced) &&
      (advanced as Record<string, unknown>).motion
  );
}

function isSectionLike(node: V9Workflow["blueprint"]["nodes"][string]) {
  return SECTION_LIKE_TYPES.has(node.type);
}

function hasPropText(
  node: V9Workflow["blueprint"]["nodes"][string],
  prop: string
) {
  return meaningfulWordCount(collectText(node.props?.[prop]).trim()) > 0;
}

function premiumVirtualChildCount(node: V9Workflow["blueprint"]["nodes"][string]) {
  if (!isSectionLike(node) || node.type === "section") return 0;

  const itemCount = Array.isArray(node.props?.items) ? node.props.items.length : 0;
  return (
    1 +
    (hasPropText(node, "eyebrow") ? 1 : 0) +
    (hasPropText(node, "title") ? 1 : 0) +
    (hasPropText(node, "body") ? 1 : 0) +
    (hasPropText(node, "primaryCta") ? 1 : 0) +
    (hasPropText(node, "secondaryCta") ? 1 : 0) +
    itemCount
  );
}

function stripNegativeLogoPhrases(value: string) {
  return value
    .replace(/\bno\s+(?:text,\s*)?logos?\b/gi, " ")
    .replace(/\bwithout\s+(?:text\s+or\s+)?logos?\b/gi, " ");
}

export function runV9QaAgent(workflow: V9Workflow) {
  const blueprint = workflow.blueprint;
  const warnings: string[] = [];

  if (!blueprint) {
    return {
      score: 0,
      warnings: ["Missing blueprint."],
      categoryScores: {
        visualHierarchy: 0,
        premiumStyling: 0,
        layoutOriginality: 0,
        typographyQuality: 0,
        colorHarmony: 0,
        contentSpecificity: 0,
        imageDirection: 0,
        sectionDepth: 0,
      },
      hardPenalties: 0,
      gates: {
        minSections: false,
        heroHasH1: false,
        noPlaceholderNames: false,
        noDefaultPaletteDominance: false,
        distinctLayouts: false,
        editorialLayouts: false,
        showcaseSection: false,
        qualityScore: false,
      },
      metrics: {
        nodeCount: 0,
      },
    };
  }

  const nodes = Object.values(blueprint.nodes);
  const rootNode = blueprint.nodes[blueprint.root];
  const sections = rootNode
    ? (rootNode.children || [])
        .map((id) => blueprint.nodes[id])
        .filter((node): node is V9Workflow["blueprint"]["nodes"][string] =>
          Boolean(node) && isSectionLike(node)
        )
    : nodes.filter(isSectionLike);
  const sectionCount = sections.length;
  const premiumHeadingCount = sections.filter((section) =>
    hasPropText(section, "title")
  ).length;
  const premiumButtonCount = sections.reduce(
    (count, section) =>
      count +
      (PREMIUM_CTA_TYPES.has(section.type) && hasPropText(section, "primaryCta")
        ? 1
        : 0) +
      (PREMIUM_CTA_TYPES.has(section.type) && hasPropText(section, "secondaryCta")
        ? 1
        : 0),
    0
  );
  const headingCount =
    nodes.filter((node) => node.type === "heading").length + premiumHeadingCount;
  const buttonCount =
    nodes.filter((node) => node.type === "button").length + premiumButtonCount;
  const h1Count = nodes.filter(
    (node) => node.type === "heading" && node.props?.level === "h1"
  ).length;
  const gridCount = nodes.filter(
    (node) =>
      node.style?.display === "grid" ||
      typeof node.style?.gridTemplateColumns !== "undefined" ||
      node.props?.layout === "grid"
  ).length;
  const splitLayoutCount = nodes.filter((node) => {
    const columns = node.style?.gridTemplateColumns;
    const asText = typeof columns === "string" ? columns : JSON.stringify(columns || "");
    return node.type === "container" && /0\.[0-9]fr|1\.[0-9]fr|minmax/i.test(asText);
  }).length;
  const asymmetricLayoutCount = nodes.filter((node) => {
    const style = node.style || {};
    const columns = JSON.stringify(style.gridTemplateColumns || "");
    return Boolean(
      columns.match(/0\.[0-9]fr|1\.[0-9]fr/) ||
        style.marginLeft === 0 ||
        style.alignItems === "start" ||
        style.transform ||
        style.position === "absolute"
    );
  }).length;
  const distinctSectionBackgrounds = new Set(
    sections.map((section) =>
      JSON.stringify({
        backgroundColor: section.style?.backgroundColor || "",
        backgroundImage: section.style?.backgroundImage || "",
      })
    )
  ).size;
  const imagePromptCount = nodes.filter(
    (node) =>
      typeof node.props?.aiImagePrompt === "string" ||
      typeof node.props?.backgroundPrompt === "string"
  ).length;
  const visualCount = nodes.filter(
    (node) =>
      node.type === "image" ||
      typeof node.props?.backgroundPrompt === "string" ||
      typeof node.style?.backgroundImage === "string"
  ).length;
  const realImageCount = nodes.filter(hasRealImageAsset).length;
  const motionCount = nodes.filter(hasMotion).length;
  const parallaxCount = nodes.filter((node) => {
    const advanced = node.props?.advanced;
    const motion =
      advanced && typeof advanced === "object" && !Array.isArray(advanced)
        ? (advanced as Record<string, unknown>).motion
        : null;
    return Boolean(
      motion &&
        typeof motion === "object" &&
        !Array.isArray(motion) &&
        ((motion as Record<string, unknown>).engine === "parallax" ||
          Number((motion as Record<string, unknown>).parallaxSpeed || 0) !== 0)
    );
  }).length;
  const themeTypography =
    blueprint.theme?.tokens?.typography &&
    typeof blueprint.theme.tokens.typography === "object" &&
    !Array.isArray(blueprint.theme.tokens.typography)
      ? (blueprint.theme.tokens.typography as Record<string, unknown>)
      : {};
  const headingFont = String(themeTypography.headingFont || "").toLowerCase();
  const bodyFont = String(themeTypography.bodyFont || "").toLowerCase();
  const basicFontSystem =
    (!headingFont || /inter|arial|helvetica|system-ui/.test(headingFont)) &&
    (!bodyFont || /inter|arial|helvetica|system-ui/.test(bodyFont));
  const styledSectionCount = nodes.filter(
    (node) =>
      isSectionLike(node) &&
      (node.style?.backgroundImage ||
        node.style?.boxShadow ||
        node.style?.border ||
        node.style?.borderRadius ||
        Number(node.style?.minHeight || 0) >= 520 ||
        typeof node.props?.backgroundPrompt === "string" ||
        typeof node.props?.variant === "string")
  ).length;
  const showcaseSectionCount = sections.filter((section) => {
    const descendants = descendantNodes(blueprint.nodes, section.id);
    const sectionText = descendants.map(collectText).join(" ").toLowerCase();
    const hasImageDirection = descendants.some(
      (node) =>
        node.type === "image" ||
        typeof node.props?.aiImagePrompt === "string" ||
        typeof node.props?.backgroundPrompt === "string"
    );
    return Boolean(
      section.props?.backgroundPrompt ||
        section.style?.backgroundImage ||
        hasImageDirection ||
        /showcase|spotlight|gallery|material|lifestyle|journey|visit|architecture|project/i.test(
          sectionText
        )
    );
  }).length;
  const richStyleCount = nodes.filter((node) => {
    const style = node.style || {};
    return Boolean(
      style.boxShadow ||
        style.borderRadius ||
        style.border ||
        style.backgroundImage ||
        style.position ||
        style.transform ||
        style.backdropFilter
    );
  }).length;
  const combinedCopy = nodes
    .map((node) =>
      [
        textContent(node.props?.text),
        textContent(node.props?.html),
        textContent(node.props?.label),
        textContent(node.props?.alt),
        textContent(node.props?.aiImagePrompt),
        textContent(node.props?.backgroundPrompt),
      ].join(" ")
    )
    .join(" ");
  const genericMatches = GENERIC_COPY_PATTERNS.filter((pattern) =>
    pattern.test(combinedCopy)
  ).length;
  const fakeLogoPromptCount = nodes.filter((node) =>
    /\b(?:logo|logos|press logo|newspaper masthead|magazine masthead|vector mark|award badge)\b/i.test(
      stripNegativeLogoPhrases(
        [
          textContent(node.props?.aiImagePrompt),
          textContent(node.props?.backgroundPrompt),
          textContent(node.props?.alt),
        ].join(" ")
      )
    )
  ).length;
  const sectionAnalyses = sections.map((section) => {
    const descendants = descendantNodes(blueprint.nodes, section.id);
    const sectionText = [collectText(section), ...descendants.map(collectText)].join(" ");
    const virtualChildCount = premiumVirtualChildCount(section);
    const premiumHeadingCount = hasPropText(section, "title") ? 1 : 0;
    const premiumButtonCount =
      (PREMIUM_CTA_TYPES.has(section.type) && hasPropText(section, "primaryCta")
        ? 1
        : 0) +
      (PREMIUM_CTA_TYPES.has(section.type) && hasPropText(section, "secondaryCta")
        ? 1
        : 0);
    const imageCount = descendants.filter(
      (node) =>
        node.type === "image" ||
        typeof node.props?.backgroundPrompt === "string" ||
        typeof node.style?.backgroundImage === "string"
    ).length + (typeof section.props?.backgroundPrompt === "string" ||
      typeof section.style?.backgroundImage === "string"
        ? 1
        : 0);
    return {
      section,
      childCount: Math.max(descendants.length - 1, virtualChildCount),
      wordCount: meaningfulWordCount(sectionText),
      imageCount,
      realImageCount: descendants.filter(hasRealImageAsset).length,
      headingCount:
        descendants.filter((node) => node.type === "heading").length +
        premiumHeadingCount,
      buttonCount:
        descendants.filter((node) => node.type === "button").length +
        premiumButtonCount,
      gridCount: descendants.filter(
        (node) =>
          node.style?.display === "grid" ||
          typeof node.style?.gridTemplateColumns !== "undefined" ||
          node.props?.layout === "grid"
      ).length + (PREMIUM_GRID_TYPES.has(section.type) ? 1 : 0),
    };
  });
  const thinSectionCount = sectionAnalyses.filter(
    (section) => section.childCount < 5 || (section.wordCount < 45 && section.imageCount < 1)
  ).length;
  const textOnlySplitSectionCount = sectionAnalyses.filter(
    (section) =>
      section.headingCount >= 1 &&
      section.imageCount === 0 &&
      section.buttonCount === 0 &&
      section.wordCount < 80
  ).length;
  const richSectionCount = sectionAnalyses.filter(
    (section) =>
      section.childCount >= 7 &&
      section.wordCount >= 45 &&
      (section.imageCount >= 1 || section.gridCount >= 1 || section.buttonCount >= 1)
  ).length;
  const projectLikeSections = sectionAnalyses.filter((analysis) =>
    /project|residence|property|home|gallery|showcase/i.test(
      [
        analysis.section.name,
        analysis.section.props?.anchorId,
        collectText(analysis.section),
      ].join(" ")
    )
  );
  const weakProjectShowcase = projectLikeSections.some(
    (section) => section.realImageCount < 2 && section.childCount < 12
  );
  const firstHeading = nodes.find((node) => node.type === "heading");
  const allBlueprintText = collectText(blueprint);
  const defaultPaletteHits = nodes.reduce((count, node) => {
    const style = node.style || {};
    return (
      count +
      [style.color, style.backgroundColor, style.borderColor, style.borderTopColor]
        .filter((value) => typeof value === "string" && DEFAULT_COLORS.has(value))
        .length
    );
  }, 0);
  const repeatedCardGridPenalty =
    gridCount >= 4 && splitLayoutCount < 2 && asymmetricLayoutCount < 3;
  const flatSectionPenalty = distinctSectionBackgrounds <= Math.max(2, Math.ceil(sectionCount / 3));
  const fallbackTemplate = /fallback/i.test(String(blueprint.metadata?.template || ""));
  const defaultTheme =
    blueprint.theme?.id === "buildez-default" ||
    blueprint.theme?.preset === "buildez-default" ||
    blueprint.theme?.name === "BuildEZ Default";
  const placeholderBrandHits = /\bbrand:\s*name\b|\bcompany\s+name\b|\bwebsite\s+name\b|\bmy first site\b|\bfor name\b|\bname,/i.test(
    allBlueprintText
  );
  const contractNames = sectionContractNames(blueprint.metadata?.sectionContract);
  const namedSectionSignatures = sections.map((section) =>
    [
      section.name,
      section.props?.anchorId,
      section.props?.id,
      collectText(section).slice(0, 120),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
  );
  const sectionContractHits = contractNames.length
    ? contractNames.filter((name) => {
        const slug = slugValue(name);
        const firstWord = slug.split("-")[0] || slug;
        return namedSectionSignatures.some(
          (signature) => signature.includes(slug) || signature.includes(firstWord)
        );
      }).length
    : sections.filter((section) => section.name || section.props?.anchorId).length;

  if (sectionCount < 4) warnings.push("Site has fewer than four sections.");
  if (sectionCount < 7) warnings.push("Site has fewer than seven meaningful sections.");
  if (headingCount < 4) warnings.push("Site has thin heading hierarchy.");
  if (buttonCount < 2) warnings.push("Site has fewer than two calls to action.");
  if (h1Count < 1) warnings.push("Site has no h1 hero heading.");
  if (gridCount < 1) warnings.push("Site does not include a native responsive grid.");
  if (imagePromptCount < 1) warnings.push("Site has no image generation prompts.");
  if (visualCount < 2) warnings.push("Site has too little visual direction or imagery.");
  if (realImageCount < 3) warnings.push("Site has fewer than three hydrated real image assets.");
  if (motionCount < 4) warnings.push("Site has too little motion or interaction direction.");
  if (parallaxCount < 1) warnings.push("Site has no parallax/image-depth direction.");
  if (basicFontSystem) warnings.push("Site uses basic/default typography.");
  if (thinSectionCount >= 2) warnings.push("Site contains too many shallow or incomplete sections.");
  if (textOnlySplitSectionCount >= 3) warnings.push("Site repeats thin text-only split sections.");
  if (richSectionCount < 4) warnings.push("Site lacks enough content-dense finished sections.");
  if (fakeLogoPromptCount > 0) warnings.push("Site asks image generation/search for fake logo or press visuals.");
  if (weakProjectShowcase) warnings.push("Project/showcase area is too thin or missing project imagery.");
  if (styledSectionCount < 2) warnings.push("Site sections are visually flat.");
  if (distinctSectionBackgrounds < 3) warnings.push("Site uses too few distinct section treatments.");
  if (splitLayoutCount + gridCount < 3) warnings.push("Site has fewer than three distinct layout structures.");
  if (asymmetricLayoutCount < 2) warnings.push("Site lacks asymmetric/editorial layout moves.");
  if (showcaseSectionCount < 1) warnings.push("Site lacks a strong visual showcase section.");
  if (richStyleCount < 8) warnings.push("Site lacks enough explicit premium styling.");
  if (genericMatches > 0) {
    warnings.push("Site contains generic template filler copy.");
  }
  if (fallbackTemplate) warnings.push("Site is using deterministic fallback template.");
  if (defaultTheme) warnings.push("Site still uses the BuildEZ default theme.");
  if (defaultPaletteHits >= 8) warnings.push("Site overuses the default BuildEZ palette.");
  if (placeholderBrandHits) warnings.push("Site contains placeholder brand names.");
  if (firstHeading && firstHeading.props?.level !== "h1") {
    warnings.push("First visible heading is not an h1.");
  }
  if (repeatedCardGridPenalty) warnings.push("Site relies on repeated card grids.");
  if (flatSectionPenalty) warnings.push("Site has flat same-background section rhythm.");
  if (sectionContractHits < Math.min(5, contractNames.length || 5)) {
    warnings.push("Site does not follow the expected landing-page section contract.");
  }

  const categoryScores = {
    visualHierarchy: Math.min(
      20,
      (h1Count >= 1 ? 5 : 0) +
        (headingCount >= 6 ? 5 : headingCount >= 4 ? 3 : 0) +
        (buttonCount >= 2 ? 3 : 0) +
        (styledSectionCount >= 3 ? 4 : styledSectionCount >= 2 ? 2 : 0) +
        (richStyleCount >= 12 ? 2 : richStyleCount >= 8 ? 1 : 0) +
        (motionCount >= 4 ? 1 : 0)
    ),
    premiumStyling: Math.min(
      20,
      (richStyleCount >= 16 ? 8 : richStyleCount >= 10 ? 5 : 0) +
        (styledSectionCount >= 4 ? 5 : styledSectionCount >= 2 ? 3 : 0) +
        (visualCount >= 3 ? 2 : visualCount >= 2 ? 1 : 0) +
        (realImageCount >= 4 ? 2 : realImageCount >= 2 ? 1 : 0) +
        (!defaultTheme ? 3 : 0)
    ),
    layoutOriginality: Math.min(
      15,
      (splitLayoutCount >= 2 ? 5 : splitLayoutCount >= 1 ? 3 : 0) +
        (asymmetricLayoutCount >= 3 ? 5 : asymmetricLayoutCount >= 2 ? 4 : 0) +
        (distinctSectionBackgrounds >= 4 ? 3 : distinctSectionBackgrounds >= 3 ? 2 : 0) +
        (!repeatedCardGridPenalty && textOnlySplitSectionCount < 3 ? 2 : 0) +
        (sectionContractHits >= 5 ? 2 : 0)
    ),
    typographyQuality: Math.min(
      15,
      (h1Count === 1 ? 4 : h1Count > 1 ? 2 : 0) +
        (headingCount >= 6 ? 4 : headingCount >= 4 ? 2 : 0) +
        (nodes.some((node) => Number(node.style?.lineHeight || 0) > 0) ? 3 : 0) +
        (nodes.some((node) => typeof node.style?.fontSize === "object") ? 3 : 0) +
        (!basicFontSystem ? 1 : 0)
    ),
    colorHarmony: Math.min(
      10,
      (defaultPaletteHits === 0 ? 4 : defaultPaletteHits < 4 ? 2 : 0) +
        (!defaultTheme ? 2 : 0) +
        (distinctSectionBackgrounds >= 3 ? 2 : 0) +
        (!flatSectionPenalty ? 2 : 0)
    ),
    contentSpecificity: Math.min(
      10,
      (genericMatches === 0 ? 4 : 0) +
        (!placeholderBrandHits ? 3 : 0) +
        (combinedCopy.length > 1400 ? 2 : combinedCopy.length > 800 ? 1 : 0) +
        (richSectionCount >= 4 ? 1 : 0)
    ),
    imageDirection: Math.min(
      5,
      (realImageCount >= 4 ? 3 : realImageCount >= 2 ? 2 : imagePromptCount >= 2 ? 1 : 0) +
        (visualCount >= 3 ? 2 : visualCount >= 1 ? 1 : 0)
    ),
    sectionDepth: Math.min(
      5,
      (sectionCount >= 9 ? 2 : sectionCount >= 7 ? 1 : 0) +
        (richSectionCount >= 5 ? 3 : richSectionCount >= 4 ? 2 : richSectionCount >= 3 ? 1 : 0)
    ),
  };

  const hardPenalties =
    (genericMatches > 0 ? 25 : 0) +
    (defaultPaletteHits >= 8 || defaultTheme ? 20 : 0) +
    (sectionCount < 7 ? 20 : 0) +
    (repeatedCardGridPenalty ? 15 : 0) +
    (h1Count < 1 || firstHeading?.props?.level !== "h1" ? 10 : 0) +
    (flatSectionPenalty ? 15 : 0) +
    (asymmetricLayoutCount < 2 ? 15 : 0) +
    (placeholderBrandHits ? 30 : 0) +
    (realImageCount < 3 ? 15 : 0) +
    (motionCount < 4 ? 8 : 0) +
    (parallaxCount < 1 ? 6 : 0) +
    (basicFontSystem ? 10 : 0) +
    (thinSectionCount >= 2 ? 18 : 0) +
    (textOnlySplitSectionCount >= 3 ? 18 : 0) +
    (richSectionCount < 4 ? 16 : 0) +
    (fakeLogoPromptCount > 0 ? 15 : 0) +
    (weakProjectShowcase ? 15 : 0) +
    (fallbackTemplate ? 20 : 0);

  const rawScore = Object.values(categoryScores).reduce((sum, value) => sum + value, 0);
  const score = Math.max(0, Math.min(MAX_RARE_SCORE, rawScore - hardPenalties));
  const gates = {
    minSections: sectionCount >= 7,
    heroHasH1: h1Count >= 1 && (!firstHeading || firstHeading.props?.level === "h1"),
    noPlaceholderNames: !placeholderBrandHits,
    noDefaultPaletteDominance: defaultPaletteHits < 8 && !defaultTheme,
    distinctLayouts: splitLayoutCount + gridCount >= 3,
    editorialLayouts: asymmetricLayoutCount >= 2,
    showcaseSection: showcaseSectionCount >= 1,
    hydratedImages: realImageCount >= 3,
    compositionDepth: richSectionCount >= 4 && thinSectionCount < 2,
    motionDirection: motionCount >= 4,
    parallaxDirection: parallaxCount >= 1,
    nonBasicTypography: !basicFontSystem,
    qualityScore: score >= 85,
  };

  return {
    score,
    warnings,
    categoryScores,
    hardPenalties,
    gates,
    metrics: {
      nodeCount: nodes.length,
      sectionCount,
      headingCount,
      buttonCount,
      h1Count,
      gridCount,
      imagePromptCount,
      realImageCount,
      visualCount,
      motionCount,
      parallaxCount,
      basicFontSystem,
      styledSectionCount,
      richStyleCount,
      splitLayoutCount,
      asymmetricLayoutCount,
      distinctSectionBackgrounds,
      showcaseSectionCount,
      sectionContractHits,
      genericMatches,
      fakeLogoPromptCount,
      thinSectionCount,
      textOnlySplitSectionCount,
      richSectionCount,
      weakProjectShowcase,
      fallbackTemplate,
      defaultTheme,
      defaultPaletteHits,
      placeholderBrandHits,
      repeatedCardGridPenalty,
      flatSectionPenalty,
    },
  };
}
