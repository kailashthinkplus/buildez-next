import type {
  InsightAgent,
  InsightAgentId,
  InsightCategory,
  InsightCategoryId,
  InsightFinding,
  InsightPageSummary,
  InsightPriority,
  InsightRating,
  InsightReport,
  WebVitalMetric,
} from "./types";

type PageInput = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  metadata?: Record<string, unknown>;
};

type SourceFileInput = { path: string; content: string };

export type InsightEngineInput = {
  site: {
    id: string;
    name: string;
    slug: string;
    status: string;
    settings?: Record<string, unknown>;
  };
  pages: PageInput[];
  files: SourceFileInput[];
  pageId?: string;
};

type Check = {
  category: InsightCategoryId;
  passed: boolean;
  title: string;
  description: string;
  impact: string;
  priority: InsightPriority;
  actionLabel: string;
  fixPrompt: string;
  page?: PageInput;
};

const CATEGORY_META: Record<
  InsightCategoryId,
  { label: string; shortLabel: string; summary: string }
> = {
  seo: {
    label: "Search optimization",
    shortLabel: "SEO",
    summary: "Titles, descriptions, crawlability, headings and image metadata",
  },
  geo: {
    label: "AI discovery",
    shortLabel: "GEO",
    summary: "Structured, citable content for answer engines and AI search",
  },
  performance: {
    label: "Performance",
    shortLabel: "Speed",
    summary: "Loading behavior, media weight and interaction responsiveness",
  },
  accessibility: {
    label: "Accessibility",
    shortLabel: "A11y",
    summary: "Inclusive structure, labels, navigation and readable interactions",
  },
  conversion: {
    label: "Conversion",
    shortLabel: "CRO",
    summary: "Calls to action, trust signals, contact paths and measurement",
  },
  "best-practices": {
    label: "Best practices",
    shortLabel: "Quality",
    summary: "Privacy, safe links, error handling and production readiness",
  },
};

const priorityPenalty: Record<InsightPriority, number> = {
  high: 18,
  medium: 11,
  low: 6,
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asSettings(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function countMatches(source: string, expression: RegExp) {
  return source.match(expression)?.length ?? 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 0) {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

function rating(value: number, good: number, poor: number): InsightRating {
  if (value <= good) return "good";
  if (value >= poor) return "poor";
  return "needs-improvement";
}

function pageSource(files: SourceFileInput[], page?: PageInput) {
  if (!page) return files.map((file) => file.content).join("\n");
  const pageNeedles = [page.slug, page.title]
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean);
  const candidates = files.filter((file) => {
    const normalizedPath = file.path.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return pageNeedles.some((needle) => normalizedPath.includes(needle));
  });
  return (candidates.length ? candidates : files).map((file) => file.content).join("\n");
}

function check(
  checks: Check[],
  category: InsightCategoryId,
  passed: boolean,
  details: Omit<Check, "category" | "passed">,
) {
  checks.push({ category, passed, ...details });
}

function pageChecks(
  page: PageInput,
  source: string,
  siteSettings: Record<string, unknown>,
): Check[] {
  const checks: Check[] = [];
  const metadata = asSettings(page.metadata);
  const seoTitle =
    stringValue(metadata.seoTitle) ||
    stringValue(siteSettings.seoTitle) ||
    (page.title === "Home" ? "" : page.title);
  const seoDescription =
    stringValue(metadata.seoDescription) ||
    stringValue(siteSettings.seoDescription);
  const images = countMatches(source, /<(?:img|Image)\b/gi);
  const altImages = countMatches(source, /\balt\s*=\s*(?:"[^"]+"|'[^']+'|\{[^}]+\})/gi);
  const imageDimensions =
    countMatches(source, /\b(?:width|height)\s*=\s*(?:"?\d+|\{[^}]+\})/gi) / 2;
  const buttons = countMatches(source, /<(?:button|Button)\b/gi);
  const accessibleButtons = countMatches(
    source,
    /<(?:button|Button)\b[^>]*(?:aria-label|title)=/gi,
  );
  const inputs = countMatches(source, /<(?:input|textarea|select)\b/gi);
  const labels = countMatches(source, /<label\b/gi);
  const h1Count = countMatches(source, /<h1\b/gi);
  const h2Count = countMatches(source, /<h2\b/gi);
  const lazyImages = countMatches(source, /\bloading\s*=\s*["']lazy["']/gi);
  const ctaCount = countMatches(
    source,
    /\b(get started|book|buy|shop|contact|start|try|request|subscribe|join|order|learn more)\b/gi,
  );
  const analyticsConnected = Boolean(
    stringValue(siteSettings.googleAnalyticsId) ||
      stringValue(siteSettings.googleTagManagerId) ||
      /gtag\(|analytics|trackEvent|dataLayer/gi.test(source),
  );

  check(checks, "seo", seoTitle.length >= 30 && seoTitle.length <= 60, {
    page,
    title: seoTitle ? "Refine the search title" : "Add a search title",
    description: seoTitle
      ? `The current title is ${seoTitle.length} characters; aim for a descriptive 30–60 character title.`
      : "This page does not have a dedicated search title.",
    impact: "A clear title helps search engines understand the page and can improve click-through rate.",
    priority: "high",
    actionLabel: "Optimize title",
    fixPrompt: `Write and apply a clear, keyword-aware SEO title between 30 and 60 characters for the “${page.title}” page. Preserve the brand voice and avoid keyword stuffing.`,
  });
  check(
    checks,
    "seo",
    seoDescription.length >= 110 && seoDescription.length <= 165,
    {
      page,
      title: seoDescription
        ? "Improve the meta description"
        : "Add a meta description",
      description: seoDescription
        ? `The current description is ${seoDescription.length} characters; make it specific and keep it near 110–165 characters.`
        : "Search results have no page-specific summary to display.",
      impact: "A useful description can increase qualified clicks from search results.",
      priority: "high",
      actionLabel: "Write description",
      fixPrompt: `Write and apply a specific, benefit-led meta description between 110 and 165 characters for the “${page.title}” page.`,
    },
  );
  check(checks, "seo", h1Count === 1, {
    page,
    title: h1Count === 0 ? "Add one primary heading" : "Use one primary heading",
    description:
      h1Count === 0
        ? "No H1 heading was detected."
        : `${h1Count} H1 headings were detected; the page should have one clear primary topic.`,
    impact: "A single descriptive H1 improves page structure for visitors and search engines.",
    priority: "medium",
    actionLabel: "Fix heading structure",
    fixPrompt: `Restructure headings on the “${page.title}” page so it has exactly one descriptive H1 and a logical H2/H3 hierarchy. Keep the visual design unchanged.`,
  });
  check(
    checks,
    "seo",
    images === 0 || altImages / Math.max(images, 1) >= 0.8,
    {
      page,
      title: "Complete image descriptions",
      description: `${Math.max(0, images - altImages)} of ${images} detected images may be missing useful alt text.`,
      impact: "Image descriptions improve image search relevance and accessibility.",
      priority: "medium",
      actionLabel: "Add image alt text",
      fixPrompt: `Review every meaningful image on the “${page.title}” page and add concise, contextual alt text. Use empty alt text only for decorative images.`,
    },
  );

  check(
    checks,
    "geo",
    /application\/ld\+json|schema\.org|JSON-LD/gi.test(source),
    {
      page,
      title: "Add structured entity data",
      description: "No JSON-LD or schema.org markup was detected for this page.",
      impact: "Structured data helps search and AI systems identify the business, page purpose and key entities.",
      priority: "high",
      actionLabel: "Add structured data",
      fixPrompt: `Add valid JSON-LD to the “${page.title}” page using the most relevant schema.org types. Include only facts supported by the page and site settings.`,
    },
  );
  check(
    checks,
    "geo",
    /faq|frequently asked|questions/i.test(source) &&
      (/\?/g.test(source) || /FAQPage/i.test(source)),
    {
      page,
      title: "Add answer-ready questions",
      description: "The page does not include a concise FAQ or question-led explanation.",
      impact: "Direct questions and self-contained answers are easier for answer engines to cite.",
      priority: "medium",
      actionLabel: "Create an FAQ",
      fixPrompt: `Add a concise FAQ section to the “${page.title}” page with 4–6 genuine customer questions and factual, self-contained answers. Add FAQ schema only when the questions are visible on the page.`,
    },
  );
  check(
    checks,
    "geo",
    h2Count >= 2 && /<(main|article|section)\b/gi.test(source),
    {
      page,
      title: "Strengthen semantic content structure",
      description: "The page needs clearer sections and descriptive subheadings.",
      impact: "Well-labeled sections make the page easier for people and AI systems to interpret.",
      priority: "medium",
      actionLabel: "Improve content structure",
      fixPrompt: `Improve the semantic structure of the “${page.title}” page using main, section or article landmarks and descriptive H2 headings. Preserve the existing look and content intent.`,
    },
  );
  check(
    checks,
    "geo",
    /\b(about|founded|experience|expert|team|author|contact|address|verified|certified)\b/i.test(
      source,
    ),
    {
      page,
      title: "Clarify expertise and ownership",
      description: "Few trust, authorship or business-identity signals were detected.",
      impact: "Clear ownership and expertise help visitors and AI systems assess whether content is trustworthy.",
      priority: "low",
      actionLabel: "Add trust signals",
      fixPrompt: `Add relevant authorship, business identity, expertise, and contact trust signals to the “${page.title}” page without inventing credentials or claims.`,
    },
  );

  check(
    checks,
    "performance",
    images === 0 || lazyImages >= Math.max(0, images - 1) || /next\/image/i.test(source),
    {
      page,
      title: "Defer off-screen images",
      description: "Some images may load before visitors need them.",
      impact: "Lazy-loading below-the-fold media reduces initial network work and can improve LCP.",
      priority: "high",
      actionLabel: "Optimize image loading",
      fixPrompt: `Optimize image loading on the “${page.title}” page. Keep the likely hero image eager, lazy-load off-screen images, and preserve responsive behavior.`,
    },
  );
  check(
    checks,
    "performance",
    images === 0 || imageDimensions >= images * 0.7 || /fill\b/gi.test(source),
    {
      page,
      title: "Reserve image dimensions",
      description: "Some media may render without a stable aspect ratio or explicit dimensions.",
      impact: "Reserved media space prevents layout movement and improves Cumulative Layout Shift.",
      priority: "high",
      actionLabel: "Stabilize media",
      fixPrompt: `Add stable dimensions or aspect-ratio containers to images on the “${page.title}” page to prevent layout shift. Do not distort or crop important content.`,
    },
  );
  check(
    checks,
    "performance",
    countMatches(source, /@import\s+url|fonts\.googleapis\.com/gi) <= 1,
    {
      page,
      title: "Reduce font loading work",
      description: "Multiple external font-loading paths were detected.",
      impact: "Consolidating fonts reduces render-blocking requests and visual swapping.",
      priority: "medium",
      actionLabel: "Optimize fonts",
      fixPrompt: `Consolidate font loading for the “${page.title}” page, preload only critical weights, and use a resilient fallback stack while preserving the design.`,
    },
  );

  check(
    checks,
    "accessibility",
    images === 0 || altImages / Math.max(images, 1) >= 0.8,
    {
      page,
      title: "Describe meaningful images",
      description: "Some meaningful images may be silent to screen readers.",
      impact: "Useful alt text makes visual content available to more visitors.",
      priority: "high",
      actionLabel: "Improve image accessibility",
      fixPrompt: `Audit image accessibility on the “${page.title}” page. Add concise alt text to meaningful images and empty alt text to decorative images.`,
    },
  );
  check(
    checks,
    "accessibility",
    inputs === 0 || labels >= inputs || /aria-label|aria-labelledby/gi.test(source),
    {
      page,
      title: "Label form controls",
      description: "One or more form controls may not have a programmatic label.",
      impact: "Labels help screen-reader and voice-control users understand and complete forms.",
      priority: "high",
      actionLabel: "Fix form labels",
      fixPrompt: `Give every form control on the “${page.title}” page a visible label or an appropriate programmatic name. Preserve the current visual hierarchy.`,
    },
  );
  check(
    checks,
    "accessibility",
    buttons === 0 ||
      accessibleButtons >= buttons * 0.35 ||
      /<button\b[^>]*>\s*[A-Za-z]/gi.test(source),
    {
      page,
      title: "Name icon-only controls",
      description: "Some buttons may rely on icons without an accessible name.",
      impact: "Accessible names make controls understandable to assistive technology.",
      priority: "medium",
      actionLabel: "Label controls",
      fixPrompt: `Audit buttons and links on the “${page.title}” page. Add accessible names to icon-only controls and keep visible labels concise.`,
    },
  );
  check(
    checks,
    "accessibility",
    /focus-visible|focus:/gi.test(source),
    {
      page,
      title: "Add visible keyboard focus",
      description: "No explicit keyboard focus treatment was detected.",
      impact: "Visible focus lets keyboard users see where they are on the page.",
      priority: "medium",
      actionLabel: "Add focus states",
      fixPrompt: `Add consistent, high-contrast focus-visible styles to interactive elements on the “${page.title}” page without changing pointer hover styles.`,
    },
  );

  check(checks, "conversion", ctaCount >= 2, {
    page,
    title: "Clarify the primary next step",
    description: "The page has few clear, action-oriented prompts.",
    impact: "A focused primary action helps visitors move from interest to enquiry or purchase.",
    priority: "high",
    actionLabel: "Improve calls to action",
    fixPrompt: `Improve conversion paths on the “${page.title}” page with one clear primary call to action and context-appropriate supporting actions. Keep the tone helpful, not pushy.`,
  });
  check(
    checks,
    "conversion",
    /<form\b|mailto:|tel:|contact|checkout|addToCart|add-to-cart/gi.test(source),
    {
      page,
      title: "Create a low-friction contact path",
      description: "No clear form, contact, booking or purchase path was detected.",
      impact: "Visitors need an obvious way to act when they are ready.",
      priority: "high",
      actionLabel: "Add a conversion path",
      fixPrompt: `Add the most relevant low-friction conversion path to the “${page.title}” page, such as contact, booking, enquiry, add-to-cart or checkout. Include clear success and error states.`,
    },
  );
  check(
    checks,
    "conversion",
    /\b(testimonial|review|trusted|customer|client|rating|case stud)/gi.test(source),
    {
      page,
      title: "Add credible proof",
      description: "No strong customer proof or trust evidence was detected.",
      impact: "Specific, truthful proof reduces uncertainty near important decisions.",
      priority: "medium",
      actionLabel: "Add social proof",
      fixPrompt: `Add a credible proof section to the “${page.title}” page using real reviews, outcomes, clients, certifications, or guarantees available in the project. Do not invent claims.`,
    },
  );
  check(checks, "conversion", analyticsConnected, {
    page,
    title: "Measure key actions",
    description: "Conversion analytics or event tracking was not detected.",
    impact: "Tracked actions show which pages and offers actually generate results.",
    priority: "medium",
    actionLabel: "Add event tracking",
    fixPrompt: `Add privacy-aware analytics events for the primary calls to action on the “${page.title}” page. Use the project’s existing analytics integration when available.`,
  });

  check(
    checks,
    "best-practices",
    !/target\s*=\s*["']_blank["']/gi.test(source) ||
      /rel\s*=\s*["'][^"']*(noopener|noreferrer)/gi.test(source),
    {
      page,
      title: "Harden external links",
      description: "A new-tab link may be missing rel=\"noopener noreferrer\".",
      impact: "Safe link attributes prevent the opened page from controlling the original tab.",
      priority: "medium",
      actionLabel: "Secure external links",
      fixPrompt: `Secure every external new-tab link on the “${page.title}” page with appropriate rel attributes and keep internal navigation unchanged.`,
    },
  );
  check(
    checks,
    "best-practices",
    !/console\.(log|debug)\(/g.test(source),
    {
      page,
      title: "Remove production debug logs",
      description: "Debug logging was detected in page source.",
      impact: "Removing noisy logs protects implementation details and keeps production diagnostics useful.",
      priority: "low",
      actionLabel: "Clean debug output",
      fixPrompt: `Remove nonessential console.log and console.debug statements from the “${page.title}” page while preserving intentional error reporting.`,
    },
  );
  check(
    checks,
    "best-practices",
    /privacy|cookie|consent/i.test(source) ||
      Boolean(stringValue(siteSettings.privacyPolicyUrl)),
    {
      page,
      title: "Add privacy guidance",
      description: "No privacy policy or consent path was detected.",
      impact: "Clear privacy information builds trust and supports responsible data collection.",
      priority: "medium",
      actionLabel: "Add privacy link",
      fixPrompt: `Add a clear privacy-policy path to the “${page.title}” page and ensure analytics or marketing forms do not imply consent. Do not generate legal claims.`,
    },
  );

  return checks;
}

function categoryScore(checks: Check[], category: InsightCategoryId) {
  const categoryChecks = checks.filter((item) => item.category === category);
  const penalty = categoryChecks
    .filter((item) => !item.passed)
    .reduce((sum, item) => sum + priorityPenalty[item.priority], 0);
  return clamp(100 - penalty, 18, 100);
}

function findingId(checkItem: Check, index: number) {
  const pagePart = checkItem.page?.id ?? "site";
  return `${checkItem.category}-${pagePart}-${index}`;
}

function modeledVitals(source: string, performanceScore: number): WebVitalMetric[] {
  const images = countMatches(source, /<(?:img|Image)\b/gi);
  const eagerMedia = Math.max(
    0,
    images - countMatches(source, /loading\s*=\s*["']lazy["']/gi),
  );
  const animations = countMatches(
    source,
    /animation|transition|framer-motion|requestAnimationFrame/gi,
  );
  const handlers = countMatches(
    source,
    /\bon(?:Click|Change|Input|Scroll|MouseMove|PointerMove)\s*=/g,
  );
  const missingDimensions = Math.max(
    0,
    images -
      Math.round(
        countMatches(source, /\b(?:width|height)\s*=/gi) / 2,
      ),
  );
  const sizeKb = new TextEncoder().encode(source).length / 1024;

  const lcp = clamp(
    1.35 + eagerMedia * 0.22 + sizeKb / 650 + Math.max(0, 75 - performanceScore) / 38,
    0.9,
    6.8,
  );
  const inp = clamp(70 + handlers * 5 + animations * 2.5, 65, 620);
  const cls = clamp(0.02 + missingDimensions * 0.025, 0.01, 0.42);
  const fcp = clamp(lcp * 0.68, 0.7, 4.5);
  const tbt = clamp(45 + handlers * 7 + animations * 4 + sizeKb / 2.5, 30, 920);
  const speedIndex = clamp(lcp * 1.18 + eagerMedia * 0.08, 1, 7.5);

  return [
    {
      id: "lcp",
      label: "Largest Contentful Paint",
      value: round(lcp, 2),
      displayValue: `${round(lcp, 1)} s`,
      rating: rating(lcp, 2.5, 4),
      description: "How quickly the main content becomes visible",
      source: "modeled",
    },
    {
      id: "inp",
      label: "Interaction to Next Paint",
      value: Math.round(inp),
      displayValue: `${Math.round(inp)} ms`,
      rating: rating(inp, 200, 500),
      description: "How quickly the page responds to interactions",
      source: "modeled",
    },
    {
      id: "cls",
      label: "Cumulative Layout Shift",
      value: round(cls, 3),
      displayValue: round(cls, 2).toFixed(2),
      rating: rating(cls, 0.1, 0.25),
      description: "How visually stable the layout remains while loading",
      source: "modeled",
    },
    {
      id: "fcp",
      label: "First Contentful Paint",
      value: round(fcp, 2),
      displayValue: `${round(fcp, 1)} s`,
      rating: rating(fcp, 1.8, 3),
      description: "When the first visible content appears",
      source: "modeled",
    },
    {
      id: "tbt",
      label: "Total Blocking Time",
      value: Math.round(tbt),
      displayValue: `${Math.round(tbt)} ms`,
      rating: rating(tbt, 200, 600),
      description: "Main-thread time that may delay input",
      source: "modeled",
    },
    {
      id: "speed-index",
      label: "Speed Index",
      value: round(speedIndex, 2),
      displayValue: `${round(speedIndex, 1)} s`,
      rating: rating(speedIndex, 3.4, 5.8),
      description: "How quickly visible page content fills in",
      source: "modeled",
    },
  ];
}

function summaryForScore(score: number, findingCount: number) {
  if (score >= 90) {
    return `Strong foundation. ${findingCount} focused improvement${findingCount === 1 ? "" : "s"} can make the experience even better.`;
  }
  if (score >= 75) {
    return `Healthy overall, with ${findingCount} practical opportunities to improve discovery, speed and conversion.`;
  }
  if (score >= 55) {
    return `${findingCount} opportunities are holding back visibility or visitor experience. Start with the high-impact fixes.`;
  }
  return `The site needs attention in a few foundational areas. The prioritized actions below provide a clear recovery path.`;
}

export function buildInsightReport(input: InsightEngineInput): InsightReport {
  const selectedPage = input.pageId
    ? input.pages.find((page) => page.id === input.pageId)
    : undefined;
  const auditedPages = selectedPage
    ? [selectedPage]
    : input.pages.length
      ? input.pages
      : [
          {
            id: "project-home",
            title: "Website",
            slug: "home",
            status: "DRAFT" as const,
            metadata: {},
          },
        ];
  const settings = asSettings(input.site.settings);
  const checks = auditedPages.flatMap((page) =>
    pageChecks(page, pageSource(input.files, page), settings),
  );
  const categories = (Object.keys(CATEGORY_META) as InsightCategoryId[]).map(
    (id): InsightCategory => {
      const categoryChecks = checks.filter((item) => item.category === id);
      return {
        id,
        ...CATEGORY_META[id],
        score: categoryScore(checks, id),
        checksPassed: categoryChecks.filter((item) => item.passed).length,
        checksTotal: categoryChecks.length,
      };
    },
  );
  const findings: InsightFinding[] = checks
    .filter((item) => !item.passed)
    .map((item, index) => ({
      id: findingId(item, index),
      category: item.category,
      title: item.title,
      description: item.description,
      impact: item.impact,
      priority: item.priority,
      pageId: item.page?.id,
      pageTitle: item.page?.title,
      actionLabel: item.actionLabel,
      fixPrompt: item.fixPrompt,
    }))
    .sort(
      (a, b) =>
        priorityPenalty[b.priority] - priorityPenalty[a.priority],
    );
  const score = Math.round(
    categories.reduce((sum, category) => sum + category.score, 0) /
      Math.max(categories.length, 1),
  );
  const pageSummaries: InsightPageSummary[] = input.pages.map((page) => {
    const perPageChecks = pageChecks(
      page,
      pageSource(input.files, page),
      settings,
    );
    const pageScore = Math.round(
      (Object.keys(CATEGORY_META) as InsightCategoryId[]).reduce(
        (sum, category) => sum + categoryScore(perPageChecks, category),
        0,
      ) / Object.keys(CATEGORY_META).length,
    );
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      score: pageScore,
      issueCount: perPageChecks.filter((item) => !item.passed).length,
    };
  });
  const checksPassed = checks.filter((item) => item.passed).length;
  const combinedSource = pageSource(input.files, selectedPage);

  return {
    generatedAt: new Date().toISOString(),
    source: "source-audit",
    scope: selectedPage ? "page" : "site",
    site: {
      id: input.site.id,
      name: input.site.name,
      slug: input.site.slug,
      status: input.site.status,
    },
    page: selectedPage
      ? {
          id: selectedPage.id,
          title: selectedPage.title,
          slug: selectedPage.slug,
          status: selectedPage.status,
        }
      : undefined,
    score,
    summary: summaryForScore(score, findings.length),
    categories,
    findings,
    quickWins: findings
      .filter((item) => item.priority !== "low")
      .slice(0, 5),
    vitals: modeledVitals(
      combinedSource,
      categories.find((category) => category.id === "performance")?.score ??
        70,
    ),
    pages: pageSummaries,
    stats: {
      highPriority: findings.filter((item) => item.priority === "high").length,
      opportunities: findings.length,
      pagesAudited: auditedPages.length,
      checksPassed,
      checksTotal: checks.length,
    },
  };
}

const AGENT_META = [
  {
    id: "seo-agent",
    name: "Search Optimizer",
    role: "SEO agent",
    description: "Improves search previews, headings, crawlability and on-page relevance.",
    category: "seo",
  },
  {
    id: "geo-agent",
    name: "Answer Engine",
    role: "GEO agent",
    description: "Makes content structured, credible and easier for AI search to cite.",
    category: "geo",
  },
  {
    id: "speed-agent",
    name: "Speed Engineer",
    role: "Performance agent",
    description: "Monitors Core Web Vitals, media loading and interaction responsiveness.",
    category: "performance",
  },
  {
    id: "accessibility-agent",
    name: "Inclusive Design",
    role: "Accessibility agent",
    description: "Finds barriers in labels, keyboard navigation, landmarks and media.",
    category: "accessibility",
  },
  {
    id: "conversion-agent",
    name: "Growth Analyst",
    role: "Conversion agent",
    description: "Strengthens calls to action, trust, contact paths and measurement.",
    category: "conversion",
  },
  {
    id: "quality-agent",
    name: "Quality Monitor",
    role: "Best-practices agent",
    description: "Checks privacy, safe links, production hygiene and visitor trust.",
    category: "best-practices",
  },
  {
    id: "business-agent",
    name: "Business Intelligence",
    role: "Business agent",
    description: "Connects website activity, leads and content gaps to practical business decisions.",
    category: "business",
  },
  {
    id: "marketing-agent",
    name: "Marketing Strategist",
    role: "Marketing agent",
    description: "Finds audience, campaign, content and conversion opportunities across the website.",
    category: "marketing",
  },
  {
    id: "whatsapp-agent",
    name: "WhatsApp Concierge",
    role: "WhatsApp agent",
    description: "Designs an on-brand WhatsApp journey for questions, qualification and handoff.",
    category: "whatsapp",
  },
  {
    id: "chatbot-agent",
    name: "Website Concierge",
    role: "Website chatbot agent",
    description: "Builds a helpful website assistant grounded in the site's pages and business details.",
    category: "chatbot",
  },
] as const;

const AGENT_CATEGORY_SOURCES = {
  business: ["conversion", "best-practices"],
  marketing: ["seo", "geo", "conversion"],
  whatsapp: ["conversion"],
  chatbot: ["accessibility", "conversion", "best-practices"],
} as const;

export function getAgentMeta(agentId: InsightAgentId) {
  return AGENT_META.find((meta) => meta.id === agentId);
}

export function getAgentSourceCategories(agentId: InsightAgentId) {
  const meta = getAgentMeta(agentId);
  if (!meta) return [];
  return meta.category in AGENT_CATEGORY_SOURCES
    ? AGENT_CATEGORY_SOURCES[meta.category as keyof typeof AGENT_CATEGORY_SOURCES]
    : [meta.category];
}

// True for agents whose category maps 1:1 onto a real audit category
// (seo, geo, performance, accessibility, conversion, best-practices).
// business/marketing/whatsapp/chatbot agents borrow findings from other
// categories purely for scoring — those borrowed findings should not be
// displayed verbatim as e.g. "SEO findings" under a different agent.
export function agentHasOwnFindings(agentId: InsightAgentId) {
  const meta = getAgentMeta(agentId);
  if (!meta) return false;
  return !(meta.category in AGENT_CATEGORY_SOURCES);
}

export function getAgentFindings(report: InsightReport, agentId: InsightAgentId) {
  const sourceCategories = getAgentSourceCategories(agentId);
  return report.findings.filter((finding) =>
    sourceCategories.includes(finding.category as never),
  );
}

export type GroupedFinding = {
  key: string;
  title: string;
  description: string;
  impact: string;
  priority: InsightFinding["priority"];
  category: InsightFinding["category"];
  actionLabel: string;
  pages: { pageId?: string; pageTitle?: string; fixPrompt: string; id: string }[];
};

export function groupFindings(findings: InsightFinding[]): GroupedFinding[] {
  const groups = new Map<string, GroupedFinding>();
  for (const finding of findings) {
    const key = `${finding.category}:${finding.title}`;
    const existing = groups.get(key);
    const page = {
      id: finding.id,
      pageId: finding.pageId,
      pageTitle: finding.pageTitle,
      fixPrompt: finding.fixPrompt,
    };
    if (existing) {
      existing.pages.push(page);
    } else {
      groups.set(key, {
        key,
        title: finding.title,
        description: finding.description,
        impact: finding.impact,
        priority: finding.priority,
        category: finding.category,
        actionLabel: finding.actionLabel,
        pages: [page],
      });
    }
  }
  const priorityRank = { high: 0, medium: 1, low: 2 };
  return [...groups.values()].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}

export function buildInsightAgents(report: InsightReport): InsightAgent[] {
  return AGENT_META.map((meta) => {
    const sourceCategories =
      meta.category in AGENT_CATEGORY_SOURCES
        ? AGENT_CATEGORY_SOURCES[meta.category as keyof typeof AGENT_CATEGORY_SOURCES]
        : [meta.category];
    const scores = sourceCategories
      .map((source) => report.categories.find((category) => category.id === source)?.score)
      .filter((value): value is number => typeof value === "number");
    const score = scores.length
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : 0;
    const opportunityCount = report.findings.filter(
      (finding) => sourceCategories.includes(finding.category as never),
    ).length;
    return {
      ...meta,
      status:
        score >= 90 ? "ready" : score >= 72 ? "monitoring" : "attention",
      score,
      opportunityCount,
      lastRunAt: report.generatedAt,
    };
  });
}
