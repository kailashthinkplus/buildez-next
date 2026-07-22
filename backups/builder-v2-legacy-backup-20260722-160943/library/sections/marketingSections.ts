import type { SectionDefinition, SectionInput } from "../types";

function fallback(input: SectionInput | undefined, key: keyof SectionInput, value: string) {
  const next = input?.[key];
  return typeof next === "string" && next.trim() ? next : value;
}

export const heroSplitSection: SectionDefinition = {
  id: "hero.split",
  name: "Split Hero",
  category: "hero",
  description: "A two-column hero with headline, copy, CTAs, and visual media.",
  tags: ["landing", "home", "cta", "media"],
  allowedParents: ["page"],
  aiContract: {
    purpose: "Open the page with the core offer and primary action.",
    requiredContent: ["headline", "body", "primaryCta"],
    optionalContent: ["eyebrow", "secondaryCta", "imagePrompt"],
  },
  create(input) {
    const headline = fallback(input, "headline", "Build a sharper business online");
    const body = fallback(
      input,
      "body",
      "Launch a polished website, manage customers, and grow from one connected workspace."
    );
    const primaryCta = fallback(input, "primaryCta", "Start building");
    const secondaryCta = fallback(input, "secondaryCta", "View demo");

    return {
      type: "section",
      name: "Hero",
      props: { sectionId: "hero", variant: "split" },
      style: {
        paddingTop: "theme.spacing.sectionY",
        paddingBottom: "theme.spacing.sectionY",
        backgroundColor: "theme.colors.surface",
      },
      children: [
        {
          type: "container",
          name: "Hero Content",
          props: { layout: "flex", direction: "row", align: "center" },
          style: {
            maxWidth: "1180px",
            margin: "0 auto",
            paddingLeft: "theme.spacing.containerX",
            paddingRight: "theme.spacing.containerX",
            gap: 48,
          },
          children: [
            {
              type: "container",
              name: "Hero Copy",
              props: { layout: "flex", direction: "column" },
              style: { gap: 18, width: "52%" },
              children: [
                {
                  type: "text",
                  name: "Eyebrow",
                  props: {
                    html: fallback(input, "eyebrow", "AI Business Platform"),
                  },
                  style: {
                    color: "theme.colors.primary",
                    fontSize: 14,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  },
                },
                {
                  type: "heading",
                  name: "Headline",
                  props: { text: headline, level: "h1" },
                  style: {
                    color: "theme.colors.textPrimary",
                    fontSize: "theme.typography.scale.h1",
                    fontWeight: 800,
                    lineHeight: 1.05,
                  },
                },
                {
                  type: "text",
                  name: "Body",
                  props: { html: body },
                  style: {
                    color: "theme.colors.textSecondary",
                    fontSize: 18,
                    lineHeight: 1.7,
                  },
                },
                {
                  type: "container",
                  name: "CTA Row",
                  props: { layout: "flex", direction: "row" },
                  style: { gap: 12, marginTop: 10 },
                  children: [
                    {
                      type: "button",
                      name: "Primary CTA",
                      props: { text: primaryCta, url: "#contact", variant: "primary" },
                      style: {
                        backgroundColor: "theme.buttons.primary.backgroundColor",
                        color: "theme.buttons.primary.color",
                        borderRadius: "theme.buttons.primary.borderRadius",
                      },
                    },
                    {
                      type: "button",
                      name: "Secondary CTA",
                      props: { text: secondaryCta, url: "#services", variant: "secondary" },
                      style: {
                        backgroundColor: "theme.buttons.secondary.backgroundColor",
                        color: "theme.buttons.secondary.color",
                        border: "1px solid theme.buttons.secondary.borderColor",
                        borderRadius: "theme.buttons.secondary.borderRadius",
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: "image",
              name: "Hero Visual",
              props: {
                src: "/default_image.png",
                alt: fallback(input, "imagePrompt", "Business dashboard visual"),
                aiPrompt: fallback(
                  input,
                  "imagePrompt",
                  "modern business dashboard interface with website, leads, and analytics"
                ),
              },
              style: {
                width: "48%",
                aspectRatio: "4 / 3",
                borderRadius: "theme.radius.media",
                boxShadow: "theme.shadow.media",
                objectFit: "cover",
              },
            },
          ],
        },
      ],
    };
  },
};

export const featureGridSection: SectionDefinition = {
  id: "features.grid-3",
  name: "Three Feature Grid",
  category: "content",
  description: "A compact three-card feature grid for benefits or services.",
  tags: ["features", "services", "cards"],
  allowedParents: ["page"],
  aiContract: {
    purpose: "Explain the main benefits or services.",
    requiredContent: ["headline", "items"],
    optionalContent: ["body"],
  },
  create(input) {
    const items = input?.items?.length
      ? input.items.slice(0, 3)
      : [
          {
            title: "Website Builder",
            body: "Create editable pages with reusable sections and brand-safe styling.",
          },
          {
            title: "CRM Ready",
            body: "Capture leads and keep customer context connected to every page.",
          },
          {
            title: "Analytics",
            body: "Understand visits, clicks, conversions, and business performance.",
          },
        ];

    return {
      type: "section",
      name: "Features",
      props: { sectionId: "features", variant: "grid-3" },
      style: {
        paddingTop: "theme.spacing.sectionY",
        paddingBottom: "theme.spacing.sectionY",
        backgroundColor: "theme.colors.background",
      },
      children: [
        {
          type: "container",
          name: "Features Container",
          props: { layout: "flex", direction: "column" },
          style: {
            maxWidth: "1120px",
            margin: "0 auto",
            paddingLeft: "theme.spacing.containerX",
            paddingRight: "theme.spacing.containerX",
            gap: 28,
          },
          children: [
            {
              type: "heading",
              name: "Section Heading",
              props: {
                text: fallback(input, "headline", "Everything your business website needs"),
                level: "h2",
              },
              style: {
                color: "theme.colors.textPrimary",
                fontSize: "theme.typography.scale.h2",
                textAlign: "center",
              },
            },
            {
              type: "container",
              name: "Feature Cards",
              props: { layout: "grid", columns: 3 },
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "theme.spacing.cardGap",
              },
              children: items.map((item) => ({
                type: "container",
                name: item.title,
                props: { layout: "flex", direction: "column" },
                style: {
                  backgroundColor: "theme.colors.surface",
                  border: "1px solid theme.colors.border",
                  borderRadius: "theme.radius.card",
                  boxShadow: "theme.shadow.card",
                  padding: 24,
                  gap: 10,
                },
                children: [
                  {
                    type: "heading",
                    name: `${item.title} Title`,
                    props: { text: item.title, level: "h3" },
                    style: {
                      color: "theme.colors.textPrimary",
                      fontSize: "theme.typography.scale.h3",
                    },
                  },
                  {
                    type: "text",
                    name: `${item.title} Body`,
                    props: { html: item.body },
                    style: {
                      color: "theme.colors.textSecondary",
                      lineHeight: 1.65,
                    },
                  },
                ],
              })),
            },
          ],
        },
      ],
    };
  },
};

export const ctaBandSection: SectionDefinition = {
  id: "cta.band",
  name: "CTA Band",
  category: "conversion",
  description: "A focused conversion band with headline, copy, and one action.",
  tags: ["cta", "conversion", "footer"],
  allowedParents: ["page"],
  aiContract: {
    purpose: "Prompt the visitor to take the next step.",
    requiredContent: ["headline", "primaryCta"],
    optionalContent: ["body"],
  },
  create(input) {
    return {
      type: "section",
      name: "CTA",
      props: { sectionId: "cta", variant: "band" },
      style: {
        paddingTop: 72,
        paddingBottom: 72,
        backgroundColor: "theme.colors.primary",
      },
      children: [
        {
          type: "container",
          name: "CTA Content",
          props: { layout: "flex", direction: "column", align: "center" },
          style: {
            maxWidth: "820px",
            margin: "0 auto",
            paddingLeft: "theme.spacing.containerX",
            paddingRight: "theme.spacing.containerX",
            gap: 18,
            textAlign: "center",
          },
          children: [
            {
              type: "heading",
              name: "CTA Heading",
              props: {
                text: fallback(input, "headline", "Ready to build your business online?"),
                level: "h2",
              },
              style: {
                color: "theme.colors.primaryContrast",
                fontSize: "theme.typography.scale.h2",
              },
            },
            {
              type: "text",
              name: "CTA Body",
              props: {
                html: fallback(
                  input,
                  "body",
                  "Start with a professional website and grow into a full business operating system."
                ),
              },
              style: {
                color: "theme.colors.primaryContrast",
                opacity: 0.86,
                fontSize: 18,
              },
            },
            {
              type: "button",
              name: "CTA Button",
              props: {
                text: fallback(input, "primaryCta", "Start building"),
                url: "#contact",
              },
              style: {
                backgroundColor: "theme.colors.surface",
                color: "theme.colors.primary",
                borderRadius: "theme.radius.button",
              },
            },
          ],
        },
      ],
    };
  },
};

export const firstPartySections = [
  heroSplitSection,
  featureGridSection,
  ctaBandSection,
];
