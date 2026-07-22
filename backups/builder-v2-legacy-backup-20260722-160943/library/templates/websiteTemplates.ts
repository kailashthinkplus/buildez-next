import type { TemplateDefinition } from "../types";

export const serviceBusinessHomeTemplate: TemplateDefinition = {
  id: "service-business-home",
  name: "Service Business Home",
  pageType: "home",
  description: "A focused homepage for local or professional service businesses.",
  themePatch: {
    spacing: {
      sectionY: 88,
      contentGap: 28,
    },
  },
  sections: [
    {
      sectionId: "hero.split",
      input: {
        eyebrow: "AI Business Platform",
        headline: "Build, launch, and grow from one intelligent workspace",
        body:
          "Create your website, capture leads, sell online, and understand performance without stitching tools together.",
        primaryCta: "Start building",
        secondaryCta: "Explore features",
      },
    },
    {
      sectionId: "features.grid-3",
      input: {
        headline: "The website is only the beginning",
        items: [
          {
            title: "Editable pages",
            body: "Every AI-created section becomes normal builder nodes that can be edited visually.",
          },
          {
            title: "Brand consistency",
            body: "Global theme tokens keep buttons, cards, typography, and colors aligned.",
          },
          {
            title: "Business-ready",
            body: "The same foundation can connect CRM, ShopEZ, analytics, and business intelligence.",
          },
        ],
      },
    },
    {
      sectionId: "cta.band",
      input: {
        headline: "Launch a better business website today",
        body: "Start with a consistent theme and reusable sections, then let AI help refine the details.",
        primaryCta: "Create my site",
      },
    },
  ],
};

export const firstPartyTemplates = [serviceBusinessHomeTemplate];
