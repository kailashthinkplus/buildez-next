// -------------------------------------------------------------
// BuildEZ BLUEPRINT PRESETS — FOOTER & FINAL SECTIONS
// File: /modules/builder/blueprint/presets-footer.ts
// -------------------------------------------------------------

import {
  NodeType,
  FooterSectionNode,
  BlueprintPreset,
} from "@/modules/builder/blueprint/types";

import {
  HeadingPreset,
  ParagraphPreset,
  ContainerPreset,
  TextPreset,
} from "./presets-blocks"; // Importing common block presets

/* ----------------------------------------------
   Base Safe Spacing
---------------------------------------------- */
const spacingZero = { top: 0, right: 0, bottom: 0, left: 0 };

// -------------------------------------------------------------
// 🟣 FOOTER SECTION (SaaS footer)
// -------------------------------------------------------------
export const FooterSectionPreset: BlueprintPreset<FooterSectionNode> = {
  type: NodeType.SectionFooter,
  create: () => ({
    id: "",
    type: NodeType.SectionFooter,
    props: {
      containerWidth: "full",
      spacing: {
        padding: { top: 60, right: 24, bottom: 60, left: 24 },
        margin: { ...spacingZero },
      },
      layout: {
        display: "flex",
        direction: "column",
        align: "center",
        justify: "start",
        gap: 40,
      },
      style: {
        backgroundColor: "#0F172A",
      },
      effects: {},
      responsive: {},
    },

    children: [
      // =========================================================
      // TOP ROW (3 columns)
      // =========================================================
      {
        ...ContainerPreset.create(),
        id: "footer-grid",
        props: {
          ...ContainerPreset.create().props,
          layout: {
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 32,
          },
        },
        children: [
          // ---------------------------------------------
          // COLUMN 1 — Brand Info
          // ---------------------------------------------
          {
            ...ContainerPreset.create(),
            id: "footer-col-brand",
            props: {
              ...ContainerPreset.create().props,
              layout: {
                display: "flex",
                direction: "column",
                align: "start",
                justify: "start",
                gap: 12,
              },
            },
            children: [
              {
                ...HeadingPreset.create(),
                id: "footer-brand-title",
                props: {
                  ...HeadingPreset.create().props,
                  content: { text: "BuildEZ" },
                  style: {
                    ...HeadingPreset.create().props.style,
                    textColor: "#FFFFFF",
                    fontSize: 28,
                    fontWeight: 800,
                  },
                },
              },

              {
                ...ParagraphPreset.create(),
                id: "footer-brand-desc",
                props: {
                  ...ParagraphPreset.create().props,
                  content: {
                    text: "The AI-powered website builder for creators, businesses, and ambitious teams.",
                  },
                  style: {
                    ...ParagraphPreset.create().props.style,
                    textColor: "#CBD5E1",
                    fontSize: 16,
                    lineHeight: 1.6,
                  },
                },
              },
            ],
          },

          // ---------------------------------------------
          // COLUMN 2 — Product Links
          // ---------------------------------------------
          {
            ...ContainerPreset.create(),
            id: "footer-col-product",
            props: {
              ...ContainerPreset.create().props,
              layout: {
                display: "flex",
                direction: "column",
                align: "start",
                justify: "start",
                gap: 10,
              },
            },
            children: [
              {
                ...HeadingPreset.create(),
                id: "footer-product-title",
                props: {
                  ...HeadingPreset.create().props,
                  content: { text: "Product" },
                  style: {
                    ...HeadingPreset.create().props.style,
                    textColor: "#FFFFFF",
                    fontSize: 18,
                  },
                },
              },

              ...["AI Builder", "Templates", "Integrations", "Hosting"].map(
                (label, i) => ({
                  ...TextPreset.create(),
                  id: `footer-product-link-${i + 1}`,
                  props: {
                    ...TextPreset.create().props,
                    content: { text: label },
                    style: { textColor: "#CBD5E1" },
                  },
                })
              ),
            ],
          },

          // ---------------------------------------------
          // COLUMN 3 — Company Links
          // ---------------------------------------------
          {
            ...ContainerPreset.create(),
            id: "footer-col-company",
            props: {
              ...ContainerPreset.create().props,
              layout: {
                display: "flex",
                direction: "column",
                align: "start",
                justify: "start",
                gap: 10,
              },
            },
            children: [
              {
                ...HeadingPreset.create(),
                id: "footer-company-title",
                props: {
                  ...HeadingPreset.create().props,
                  content: { text: "Company" },
                  style: {
                    ...HeadingPreset.create().props.style,
                    textColor: "#FFFFFF",
                    fontSize: 18,
                  },
                },
              },

              ...["About Us", "Careers", "Blog", "Press"].map((label, i) => ({
                ...TextPreset.create(),
                id: `footer-company-link-${i + 1}`,
                props: {
                  ...TextPreset.create().props,
                  content: { text: label },
                  style: { textColor: "#CBD5E1" },
                },
              })),
            ],
          },

          // ---------------------------------------------
          // COLUMN 4 — Legal Links
          // ---------------------------------------------
          {
            ...ContainerPreset.create(),
            id: "footer-col-legal",
            props: {
              ...ContainerPreset.create().props,
              layout: {
                display: "flex",
                direction: "column",
                align: "start",
                justify: "start",
                gap: 10,
              },
            },
            children: [
              {
                ...HeadingPreset.create(),
                id: "footer-legal-title",
                props: {
                  ...HeadingPreset.create().props,
                  content: { text: "Legal" },
                  style: {
                    ...HeadingPreset.create().props.style,
                    textColor: "#FFFFFF",
                    fontSize: 18,
                  },
                },
              },

              ...[
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
                "Licenses",
              ].map((label, i) => ({
                ...TextPreset.create(),
                id: `footer-legal-link-${i + 1}`,
                props: {
                  ...TextPreset.create().props,
                  content: { text: label },
                  style: { textColor: "#CBD5E1" },
                },
              })),
            ],
          },
        ],
      },

      // =========================================================
      // BOTTOM COPYRIGHT ROW
      // =========================================================
      {
        ...ContainerPreset.create(),
        id: "footer-bottom",
        props: {
          ...ContainerPreset.create().props,
          layout: {
            display: "flex",
            direction: "row",
            align: "space-between",
            justify: "space-between",
            gap: 16,
          },
          spacing: {
            padding: { top: 24, right: 0, bottom: 0, left: 0 },
            margin: { ...spacingZero },
          },
          style: {
            borderTopWidth: 1,
            borderColor: "#1E293B",
          },
        },
        children: [
          {
            ...TextPreset.create(),
            id: "footer-copyright",
            props: {
              ...TextPreset.create().props,
              content: {
                text: "© 2026 BuildEZ. All rights reserved.",
              },
              style: {
                textColor: "#64748B",
              },
            },
          },
          {
            ...ContainerPreset.create(),
            id: "footer-social",
            props: {
              ...ContainerPreset.create().props,
              layout: {
                display: "flex",
                direction: "row",
                align: "center",
                justify: "end",
                gap: 16,
              },
            },
            children: [
              ...["🐦", "📘", "💼"].map((icon, i) => ({
                ...TextPreset.create(),
                id: `footer-social-${i + 1}`,
                props: {
                  ...TextPreset.create().props,
                  content: { text: icon },
                  style: { textColor: "#CBD5E1", fontSize: 20 },
                },
              })),
            ],
          },
        ],
      },
    ],
  }),
};

// -------------------------------------------------------------
// PRESET REGISTRY EXPORTS
// -------------------------------------------------------------
export const FOOTER_PRESETS = {
  [NodeType.SectionFooter]: FooterSectionPreset,
};

export default FOOTER_PRESETS;
