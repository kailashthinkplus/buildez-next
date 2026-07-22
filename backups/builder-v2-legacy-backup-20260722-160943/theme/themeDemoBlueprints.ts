import type {
  BuilderBlueprint,
  BuilderNode,
  BuilderStyle,
  NodeType,
} from "../types/blueprint";
import type { ThemePreset } from "./theme.types";

type DemoBlueprintInput = {
  preset: ThemePreset;
  pageTitle: string;
  siteName: string;
  pageSeed?: ThemeDemoPageSeed;
};

export type ThemeDemoPageSeed = {
  title: string;
  slug: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

type DemoSpec = {
  category: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  imageAlt: string;
  metrics: Array<{ value: string; label: string }>;
  features: Array<{ title: string; body: string }>;
  ctaTitle: string;
  ctaBody: string;
  layout: "saas" | "studio" | "local" | "launch" | "editorial" | "business";
};

const demoSpecs: Record<string, DemoSpec> = {
  "buildez-default": {
    category: "Business starter",
    eyebrow: "Business Starter",
    headline: "A clear home base for your growing team",
    subhead:
      "Strategy calls, service pages, proof sections, and a focused inquiry path are ready to shape for your brand.",
    primaryCta: "Explore services",
    secondaryCta: "View process",
    image: "/theme-previews/demo-images/buildez-default.jpg",
    imageAlt: "Modern workspace with laptop and meeting table",
    metrics: [
      { value: "18", label: "page blocks" },
      { value: "4", label: "service paths" },
      { value: "92%", label: "trust score" },
    ],
    features: [
      {
        title: "Consulting-ready hero",
        body: "A direct headline, service proof, and primary action for a professional first impression.",
      },
      {
        title: "Proof-led services",
        body: "Use the cards for packages, team strengths, case studies, or client outcomes.",
      },
      {
        title: "Flexible business CTA",
        body: "A simple conversion section works for booking, contact, quotes, or discovery calls.",
      },
    ],
    ctaTitle: "Turn this into your operating website.",
    ctaBody: "Swap the demo copy, keep the structure, and launch a site that feels already organized.",
    layout: "business",
  },
  "modern-saas": {
    category: "SaaS dashboard",
    eyebrow: "SaaS Dashboard",
    headline: "Ship analytics your customers understand",
    subhead:
      "A product-led SaaS page with dashboard proof, KPI cards, feature explainers, and a trial-ready conversion path.",
    primaryCta: "Start trial",
    secondaryCta: "Watch demo",
    image: "/theme-previews/demo-images/modern-saas.jpg",
    imageAlt: "Analytics dashboard interface with charts",
    metrics: [
      { value: "42k", label: "events tracked" },
      { value: "+18%", label: "MRR lift" },
      { value: "7", label: "cohort views" },
    ],
    features: [
      {
        title: "Activation reports",
        body: "Show onboarding, retention, and account health in language buyers can understand.",
      },
      {
        title: "Pipeline dashboard",
        body: "Frame your product UI beside proof points, integrations, and enterprise-ready metrics.",
      },
      {
        title: "Trial conversion flow",
        body: "Clear CTAs and compact feature cards keep the page sharp for product-led growth.",
      },
    ],
    ctaTitle: "Give every product page a cleaner growth story.",
    ctaBody: "Use the demo sections for launch pages, feature pages, comparison pages, and webinars.",
    layout: "saas",
  },
  "premium-studio": {
    category: "Portfolio studio",
    eyebrow: "Portfolio Studio",
    headline: "Quiet rooms, crafted details",
    subhead:
      "An editorial studio page with oversized project imagery, refined service copy, and a calm inquiry path.",
    primaryCta: "Book consult",
    secondaryCta: "View projects",
    image: "/theme-previews/demo-images/premium-studio.jpg",
    imageAlt: "Warm interior design portfolio collage",
    metrics: [
      { value: "24", label: "projects" },
      { value: "3", label: "studio services" },
      { value: "1:1", label: "private consults" },
    ],
    features: [
      {
        title: "Editorial project lead",
        body: "Let large imagery carry the tone while concise copy introduces your creative point of view.",
      },
      {
        title: "Service story cards",
        body: "Position interiors, styling, photography, branding, or bespoke client packages.",
      },
      {
        title: "Quiet luxury spacing",
        body: "Serif headings and warm surfaces create a premium feel without visual clutter.",
      },
    ],
    ctaTitle: "Invite better-fit clients into the studio.",
    ctaBody: "Use the demo flow for portfolios, lookbooks, case studies, and project inquiry pages.",
    layout: "studio",
  },
  "local-business": {
    category: "Local storefront",
    eyebrow: "Local Storefront",
    headline: "Fresh arrivals, friendly visits",
    subhead:
      "A warm local business page with storefront imagery, opening details, offers, reviews, and direct booking actions.",
    primaryCta: "Book a visit",
    secondaryCta: "See offers",
    image: "/theme-previews/demo-images/local-business.jpg",
    imageAlt: "Neighborhood storefront with flowers and warm lights",
    metrics: [
      { value: "Open", label: "8 AM to 6 PM" },
      { value: "4.9", label: "local rating" },
      { value: "Today", label: "same-day pickup" },
    ],
    features: [
      {
        title: "Seasonal picks",
        body: "Feature daily specials, bouquets, menus, services, or appointment availability.",
      },
      {
        title: "Neighborhood trust",
        body: "Reviews, hours, and location details stay close to the action so visitors can decide quickly.",
      },
      {
        title: "Simple bookings",
        body: "Built for cafes, florists, salons, clinics, instructors, and service shops.",
      },
    ],
    ctaTitle: "Make it easy for local customers to show up.",
    ctaBody: "Keep the friendly structure and swap in your own offers, hours, and booking details.",
    layout: "local",
  },
  "bold-launch": {
    category: "Launch campaign",
    eyebrow: "Launch Campaign",
    headline: "The drop goes live in 48 hours",
    subhead:
      "A high-energy launch page with dramatic hero art, countdown-style proof, benefit cards, and a waitlist CTA.",
    primaryCta: "Join waitlist",
    secondaryCta: "See perks",
    image: "/theme-previews/demo-images/bold-launch.jpg",
    imageAlt: "Dramatic neon launch scene",
    metrics: [
      { value: "48h", label: "until reveal" },
      { value: "12k", label: "waitlist" },
      { value: "3", label: "launch bonuses" },
    ],
    features: [
      {
        title: "High-contrast hero",
        body: "Lead with urgency and a campaign visual that feels unmistakably launch-ready.",
      },
      {
        title: "Offer stack",
        body: "Use compact blocks for perks, modules, event speakers, bonuses, or product benefits.",
      },
      {
        title: "Momentum CTA",
        body: "The page is tuned for waitlists, drops, creator launches, courses, and live events.",
      },
    ],
    ctaTitle: "Convert attention while the launch window is hot.",
    ctaBody: "Keep the bold rhythm for product drops, event registration, and early-access campaigns.",
    layout: "launch",
  },
  "editorial-minimal": {
    category: "Editorial publication",
    eyebrow: "Editorial Publication",
    headline: "Issue 04: Structure and silence",
    subhead:
      "A restrained publication page with a magazine lead story, article rail, issue notes, and a subscriber module.",
    primaryCta: "Read issue",
    secondaryCta: "Browse archive",
    image: "/theme-previews/demo-images/editorial-minimal.jpg",
    imageAlt: "Black and white editorial architecture collage",
    metrics: [
      { value: "8", label: "essays" },
      { value: "3", label: "features" },
      { value: "Monthly", label: "publishing rhythm" },
    ],
    features: [
      {
        title: "Feature story grid",
        body: "Use the asymmetry for essays, interviews, reports, research, and cultural projects.",
      },
      {
        title: "Article rail",
        body: "Support a lead piece with secondary stories, issue notes, and archive links.",
      },
      {
        title: "Measured typography",
        body: "Minimal spacing and serif headlines make long-form content feel intentional.",
      },
    ],
    ctaTitle: "Publish the next issue with restraint and clarity.",
    ctaBody: "The demo structure works for magazines, writers, researchers, and cultural teams.",
    layout: "editorial",
  },
};

function token(path: string) {
  return `{theme.${path}}`;
}

function node(
  nodes: Record<string, BuilderNode>,
  parent: BuilderNode | null,
  id: string,
  type: NodeType,
  props: Record<string, unknown> = {},
  style: BuilderStyle = {},
  name?: string
) {
  const item: BuilderNode = {
    id,
    type,
    name,
    parentId: parent?.id ?? null,
    children: [],
    props,
    style,
  };

  nodes[id] = item;
  parent?.children.push(id);
  return item;
}

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

function createDemoTokens(preset: ThemePreset) {
  return {
    themePresetId: preset.id,
    themeName: preset.name,
    themeVersion: 1,
    ...preset.tokens,
  };
}

function createFeatureSection(
  nodes: Record<string, BuilderNode>,
  root: BuilderNode,
  spec: DemoSpec,
  preset: ThemePreset
) {
  const section = node(
    nodes,
    root,
    "theme-demo-features",
    "section",
    {},
    { backgroundColor: token("colors.background") },
    "Demo Features"
  );
  const wrap = node(
    nodes,
    section,
    "theme-demo-features-wrap",
    "container",
    { layout: "flex", direction: "column", gap: 28 },
    {
      maxWidth: 1120,
      margin: "0 auto",
      padding: { desktop: "72px 32px", mobile: "48px 20px" },
    }
  );
  node(
    nodes,
    wrap,
    "theme-demo-features-eyebrow",
    "text",
    { text: "Built into this template" },
    {
      color: token("colors.primary"),
      fontSize: 14,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: 0,
      marginBottom: 0,
    }
  );
  node(
    nodes,
    wrap,
    "theme-demo-features-heading",
    "heading",
    { text: preset.demoData?.highlights?.[0] ?? "Category-specific sections", level: "h2" },
    {
      color: token("colors.textPrimary"),
      fontFamily: token("typography.headingFont"),
      fontSize: { desktop: 42, mobile: 31 },
      fontWeight: spec.layout === "editorial" || spec.layout === "studio" ? 500 : 800,
      lineHeight: 1.08,
      marginBottom: 0,
    }
  );
  const grid = node(
    nodes,
    wrap,
    "theme-demo-features-grid",
    "container",
    { layout: "grid", direction: "row", gap: 18 },
    {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 18,
      width: "100%",
    }
  );

  spec.features.forEach((feature, index) => {
    const card = node(
      nodes,
      grid,
      `theme-demo-feature-card-${index + 1}`,
      "container",
      { layout: "flex", direction: "column", gap: 12 },
      {
        backgroundColor:
          spec.layout === "launch"
            ? token("colors.surface")
            : index === 0
              ? token("colors.surfaceAlt")
              : token("colors.surface"),
        border: `1px solid ${preset.tokens.colors.border}`,
        borderRadius: preset.tokens.radius.card,
        padding: "24px",
        minHeight: 190,
      },
      feature.title
    );
    node(
      nodes,
      card,
      `theme-demo-feature-title-${index + 1}`,
      "heading",
      { text: feature.title, level: "h3" },
      {
        color: token("colors.textPrimary"),
        fontFamily: token("typography.headingFont"),
        fontSize: 22,
        fontWeight: 800,
        lineHeight: 1.15,
        marginBottom: 0,
      }
    );
    node(
      nodes,
      card,
      `theme-demo-feature-body-${index + 1}`,
      "text",
      { text: feature.body },
      {
        color: token("colors.textSecondary"),
        fontSize: 15,
        lineHeight: 1.65,
        marginBottom: 0,
      }
    );
  });
}

function createCtaSection(
  nodes: Record<string, BuilderNode>,
  root: BuilderNode,
  spec: DemoSpec,
  preset: ThemePreset
) {
  const section = node(
    nodes,
    root,
    "theme-demo-cta",
    "section",
    {},
    { backgroundColor: token("colors.background") },
    "Demo CTA"
  );
  const wrap = node(
    nodes,
    section,
    "theme-demo-cta-wrap",
    "container",
    { layout: "flex", direction: "column", align: "center", gap: 18 },
    {
      maxWidth: 1040,
      margin: "0 auto",
      padding: { desktop: "56px 32px 80px", mobile: "36px 20px 56px" },
      backgroundColor: spec.layout === "launch" ? token("colors.surface") : token("colors.surfaceAlt"),
      borderRadius: Math.max(preset.tokens.radius.card, 8),
      textAlign: "center",
    }
  );
  node(
    nodes,
    wrap,
    "theme-demo-cta-heading",
    "heading",
    { text: spec.ctaTitle, level: "h2" },
    {
      color: token("colors.textPrimary"),
      fontFamily: token("typography.headingFont"),
      fontSize: { desktop: 38, mobile: 30 },
      fontWeight: spec.layout === "editorial" || spec.layout === "studio" ? 500 : 850,
      lineHeight: 1.12,
      textAlign: "center",
      marginBottom: 0,
    }
  );
  node(
    nodes,
    wrap,
    "theme-demo-cta-body",
    "text",
    { text: spec.ctaBody },
    {
      color: token("colors.textSecondary"),
      fontSize: 17,
      lineHeight: 1.7,
      textAlign: "center",
      maxWidth: 680,
      marginBottom: 0,
    }
  );
  node(
    nodes,
    wrap,
    "theme-demo-cta-button",
    "button",
    { text: spec.primaryCta, label: spec.primaryCta, href: "#", url: "#" },
    {
      backgroundColor: token("buttons.primary.backgroundColor"),
      color: token("buttons.primary.color"),
      borderRadius: token("buttons.primary.borderRadius"),
      padding: "13px 20px",
      paddingX: 20,
      paddingY: 13,
      fontSize: 15,
      fontWeight: 800,
      marginTop: 8,
    }
  );
}

function createMetricCards(
  nodes: Record<string, BuilderNode>,
  parent: BuilderNode,
  spec: DemoSpec,
  preset: ThemePreset,
  dark = false
) {
  const metrics = node(
    nodes,
    parent,
    "theme-demo-metrics",
    "container",
    { layout: "grid", direction: "row", gap: 14 },
    {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 14,
      width: "100%",
    }
  );

  spec.metrics.forEach((metric, index) => {
    const card = node(
      nodes,
      metrics,
      `theme-demo-metric-card-${index + 1}`,
      "container",
      { layout: "flex", direction: "column", gap: 4 },
      {
        backgroundColor: dark ? withAlpha(preset.tokens.colors.surface, "d9") : token("colors.surface"),
        border: `1px solid ${dark ? withAlpha(preset.tokens.colors.border, "99") : preset.tokens.colors.border}`,
        borderRadius: preset.tokens.radius.card,
        padding: "18px",
      }
    );
    node(
      nodes,
      card,
      `theme-demo-metric-value-${index + 1}`,
      "heading",
      { text: metric.value, level: "h3" },
      {
        color: token("colors.textPrimary"),
        fontFamily: token("typography.headingFont"),
        fontSize: 26,
        fontWeight: 900,
        lineHeight: 1,
        marginBottom: 0,
      }
    );
    node(
      nodes,
      card,
      `theme-demo-metric-label-${index + 1}`,
      "text",
      { text: metric.label },
      {
        color: token("colors.textSecondary"),
        fontSize: 13,
        lineHeight: 1.4,
        marginBottom: 0,
      }
    );
  });
}

function createHero(nodes: Record<string, BuilderNode>, root: BuilderNode, spec: DemoSpec, preset: ThemePreset) {
  const launch = spec.layout === "launch";
  const studio = spec.layout === "studio";
  const editorial = spec.layout === "editorial";
  const imageFirst = studio || editorial;
  const section = node(
    nodes,
    root,
    "theme-demo-hero",
    "section",
    {},
    { backgroundColor: token("colors.background") },
    "Demo Hero"
  );
  const wrap = node(
    nodes,
    section,
    "theme-demo-hero-wrap",
    "container",
    {
      layout: "flex",
      direction: imageFirst ? "row-reverse" : "row",
      align: "center",
      gap: launch ? 40 : 44,
      wrap: true,
    },
    {
      maxWidth: 1180,
      margin: "0 auto",
      padding: { desktop: "92px 32px 72px", mobile: "56px 20px 44px" },
      backgroundColor: launch ? token("colors.surface") : "transparent",
      borderRadius: launch ? 16 : 0,
    }
  );
  const copy = node(
    nodes,
    wrap,
    "theme-demo-hero-copy",
    "container",
    { layout: "flex", direction: "column", gap: 20 },
    {
      flex: "1 1 430px",
      minWidth: 320,
      maxWidth: editorial ? 480 : 560,
    }
  );
  node(
    nodes,
    copy,
    "theme-demo-eyebrow",
    "text",
    { text: spec.eyebrow },
    {
      color: token("colors.primary"),
      fontSize: 14,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: 0,
      marginBottom: 0,
    }
  );
  node(
    nodes,
    copy,
    "theme-demo-headline",
    "heading",
    { text: spec.headline, level: "h1" },
    {
      color: token("colors.textPrimary"),
      fontFamily: token("typography.headingFont"),
      fontSize: { desktop: launch ? 64 : editorial || studio ? 58 : 56, mobile: 38 },
      fontWeight: editorial || studio ? 500 : 900,
      lineHeight: 1.02,
      marginBottom: 0,
    }
  );
  node(
    nodes,
    copy,
    "theme-demo-subhead",
    "text",
    { text: spec.subhead },
    {
      color: token("colors.textSecondary"),
      fontSize: { desktop: 18, mobile: 16 },
      lineHeight: 1.7,
      maxWidth: 620,
      marginBottom: 0,
    }
  );
  const actions = node(
    nodes,
    copy,
    "theme-demo-actions",
    "container",
    { layout: "flex", direction: "row", gap: 12, wrap: true },
    { alignItems: "center", marginTop: 4 }
  );
  node(
    nodes,
    actions,
    "theme-demo-primary-button",
    "button",
    { text: spec.primaryCta, label: spec.primaryCta, href: "#", url: "#" },
    {
      backgroundColor: token("buttons.primary.backgroundColor"),
      color: token("buttons.primary.color"),
      borderRadius: token("buttons.primary.borderRadius"),
      padding: "13px 20px",
      paddingX: 20,
      paddingY: 13,
      fontSize: 15,
      fontWeight: 800,
    }
  );
  node(
    nodes,
    actions,
    "theme-demo-secondary-button",
    "button",
    { text: spec.secondaryCta, label: spec.secondaryCta, href: "#", url: "#" },
    {
      backgroundColor: token("buttons.secondary.backgroundColor"),
      color: token("buttons.secondary.color"),
      border: `1px solid ${preset.tokens.colors.border}`,
      borderRadius: token("buttons.secondary.borderRadius"),
      padding: "13px 20px",
      paddingX: 20,
      paddingY: 13,
      fontSize: 15,
      fontWeight: 800,
    }
  );

  if (!editorial && !studio) {
    createMetricCards(nodes, copy, spec, preset, launch);
  }

  const media = node(
    nodes,
    wrap,
    "theme-demo-hero-media",
    "container",
    { layout: "flex", direction: "column", gap: 16 },
    {
      flex: "1 1 420px",
      minWidth: 320,
      backgroundColor: studio || editorial ? "transparent" : token("colors.surface"),
      border: studio || editorial ? "0" : `1px solid ${preset.tokens.colors.border}`,
      borderRadius: preset.tokens.radius.media,
      padding: studio || editorial ? 0 : 14,
      boxShadow: studio || editorial || launch ? preset.tokens.shadow.media : preset.tokens.shadow.card,
    }
  );
  node(
    nodes,
    media,
    "theme-demo-hero-image",
    "image",
    { src: spec.image, alt: spec.imageAlt },
    {
      width: "100%",
      maxWidth: "100%",
      height: { desktop: studio ? 430 : editorial ? 380 : 360, mobile: 260 },
      borderRadius: preset.tokens.radius.media,
      objectFit: "cover",
    }
  );

  if (studio || editorial) {
    createMetricCards(nodes, media, spec, preset);
  }
}

export function getThemeDemoPageSeeds(preset: ThemePreset): ThemeDemoPageSeed[] {
  const commonContact = {
    title: "Contact",
    slug: "contact",
    eyebrow: "Get in touch",
    headline: preset.id === "local-business"
      ? "Plan your next visit"
      : preset.id === "bold-launch"
        ? "Reserve your launch spot"
        : "Start the conversation",
    subhead:
      "Use this page for booking, inquiries, lead capture, support requests, or consultation calls.",
    primaryCta: preset.id === "local-business" ? "Book a visit" : "Send inquiry",
    secondaryCta: "View details",
  };

  if (preset.id === "modern-saas") {
    return [
      { title: "Home", slug: "home" },
      {
        title: "Features",
        slug: "features",
        eyebrow: "Product Features",
        headline: "Every metric your users need in one focused workspace",
        subhead:
          "Show dashboards, activation reports, segmentation, and team workflows with SaaS-ready demo copy.",
        primaryCta: "Explore features",
        secondaryCta: "See integrations",
      },
      {
        title: "Pricing",
        slug: "pricing",
        eyebrow: "Plans",
        headline: "Simple plans for teams ready to grow",
        subhead:
          "Use this page to explain packages, trial details, onboarding, and upgrade paths.",
        primaryCta: "Start trial",
        secondaryCta: "Compare plans",
      },
      commonContact,
    ];
  }

  if (preset.id === "premium-studio") {
    return [
      { title: "Home", slug: "home" },
      {
        title: "Portfolio",
        slug: "portfolio",
        eyebrow: "Selected Work",
        headline: "A quiet gallery for your most considered work",
        subhead:
          "Use this page for project stories, lookbooks, editorial galleries, and premium case studies.",
        primaryCta: "View portfolio",
        secondaryCta: "Read notes",
      },
      {
        title: "Services",
        slug: "services",
        eyebrow: "Studio Services",
        headline: "Creative direction, styling, and project support",
        subhead:
          "Present high-touch packages with elegant service cards and a clear inquiry path.",
        primaryCta: "Book consult",
        secondaryCta: "View packages",
      },
      commonContact,
    ];
  }

  if (preset.id === "local-business") {
    return [
      { title: "Home", slug: "home" },
      {
        title: "Menu",
        slug: "menu",
        eyebrow: "Seasonal Picks",
        headline: "Fresh favorites, local specials, and daily offers",
        subhead:
          "Use this page for menus, services, seasonal products, packages, or appointment options.",
        primaryCta: "See offers",
        secondaryCta: "Order ahead",
      },
      {
        title: "Reviews",
        slug: "reviews",
        eyebrow: "Local Trust",
        headline: "Loved by regulars and first-time visitors",
        subhead:
          "Show customer proof, neighborhood stories, ratings, and service highlights.",
        primaryCta: "Read reviews",
        secondaryCta: "Visit us",
      },
      commonContact,
    ];
  }

  if (preset.id === "bold-launch") {
    return [
      { title: "Home", slug: "home" },
      {
        title: "Launch",
        slug: "launch",
        eyebrow: "Launch Details",
        headline: "Everything buyers need before the drop",
        subhead:
          "Use this page for the offer stack, timing, bonuses, countdown details, and event agenda.",
        primaryCta: "Join waitlist",
        secondaryCta: "See bonuses",
      },
      {
        title: "Benefits",
        slug: "benefits",
        eyebrow: "Why Join",
        headline: "Perks, proof, and momentum in one bold page",
        subhead:
          "Frame the key benefits, audience fit, testimonials, and urgency behind the campaign.",
        primaryCta: "Claim access",
        secondaryCta: "Read proof",
      },
      commonContact,
    ];
  }

  if (preset.id === "editorial-minimal") {
    return [
      { title: "Home", slug: "home" },
      {
        title: "Articles",
        slug: "articles",
        eyebrow: "Archive",
        headline: "Essays, interviews, and field notes",
        subhead:
          "Use this page for issue archives, article collections, research, interviews, and essays.",
        primaryCta: "Read archive",
        secondaryCta: "Browse issues",
      },
      {
        title: "Subscribe",
        slug: "subscribe",
        eyebrow: "Membership",
        headline: "Receive the next issue with less noise",
        subhead:
          "A focused subscriber page for newsletters, memberships, journals, and publication updates.",
        primaryCta: "Subscribe",
        secondaryCta: "Preview issue",
      },
      commonContact,
    ];
  }

  return [
    { title: "Home", slug: "home" },
    {
      title: "Services",
      slug: "services",
      eyebrow: "Services",
      headline: "Organized offers for serious client work",
      subhead:
        "Use this page for consulting packages, deliverables, process details, and client outcomes.",
      primaryCta: "Explore services",
      secondaryCta: "View process",
    },
    {
      title: "About",
      slug: "about",
      eyebrow: "About",
      headline: "A capable team with a clear way of working",
      subhead:
        "Introduce your story, team, operating principles, proof points, and customer fit.",
      primaryCta: "Meet the team",
      secondaryCta: "See proof",
    },
    commonContact,
  ];
}

export function createThemeDemoBlueprint({
  preset,
  pageTitle,
  siteName,
  pageSeed,
}: DemoBlueprintInput): BuilderBlueprint {
  const now = new Date().toISOString();
  const baseSpec = demoSpecs[preset.id] ?? demoSpecs["buildez-default"];
  const spec = {
    ...baseSpec,
    eyebrow: pageSeed?.eyebrow ?? baseSpec.eyebrow,
    headline: pageSeed?.headline ?? baseSpec.headline,
    subhead: pageSeed?.subhead ?? baseSpec.subhead,
    primaryCta: pageSeed?.primaryCta ?? baseSpec.primaryCta,
    secondaryCta: pageSeed?.secondaryCta ?? baseSpec.secondaryCta,
  };
  const nodes: Record<string, BuilderNode> = {};
  const root = node(
    nodes,
    null,
    "theme-demo-page",
    "page",
    {
      title: pageTitle,
      siteName,
      designTokens: createDemoTokens(preset),
    },
    {
      backgroundColor: token("colors.background"),
      color: token("colors.textPrimary"),
      fontFamily: token("typography.bodyFont"),
    },
    "Theme Demo Page"
  );

  createHero(nodes, root, spec, preset);
  createFeatureSection(nodes, root, spec, preset);
  createCtaSection(nodes, root, spec, preset);

  return {
    metadata: {
      version: 2,
      title: pageTitle,
      createdAt: now,
      updatedAt: now,
      template: `theme-demo:${preset.id}`,
      industry: spec.category,
      themeDemo: {
        presetId: preset.id,
        category: spec.category,
        seededAt: now,
      },
    },
    theme: {
      id: preset.id,
      name: preset.name,
      preset: preset.id,
      tokens: createDemoTokens(preset),
    },
    root: root.id,
    nodes,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isThemeDemoBlueprint(value: unknown): boolean {
  if (!isObject(value)) return false;
  const metadata = value.metadata;
  if (!isObject(metadata)) return false;

  return (
    typeof metadata.template === "string" &&
    metadata.template.startsWith("theme-demo:")
  );
}

export function isBlankBlueprint(value: unknown): boolean {
  if (!value) return true;
  if (!isObject(value)) return false;

  if (typeof value.root === "string" && isObject(value.nodes)) {
    const root = value.nodes[value.root];
    return isObject(root) && Array.isArray(root.children) && root.children.length === 0;
  }

  if (isObject(value.page)) {
    const pageChildren = value.page.children;
    return Array.isArray(pageChildren) && pageChildren.length === 0;
  }

  if (value.type === "page") {
    return Array.isArray(value.children) && value.children.length === 0;
  }

  return false;
}

export function canSeedThemeDemoBlueprint(value: unknown): boolean {
  return isBlankBlueprint(value) || isThemeDemoBlueprint(value);
}
