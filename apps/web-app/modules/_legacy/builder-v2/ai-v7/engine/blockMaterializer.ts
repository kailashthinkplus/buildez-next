// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/blockMaterializer.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { createId } from "@/modules/builder/utils/createId";

/* ============================================================
   DESIGN TOKEN HELPERS
============================================================ */

/**
 * Get design tokens from page (if available)
 */
function getTokens(page: BlueprintNode): {
  spacing: any;
  radius: any;
  typography: any;
  colors: any;
} {
  const tokens = page.props?.designTokens || {};
  return {
    spacing: tokens.spacing || {},
    radius: tokens.radius || {},
    typography: tokens.typography || {},
    colors: tokens.colors || {},
  };
}

/* ============================================================
   BLOCK FACTORIES (WITH RICH DEFAULT STYLES)
============================================================ */

interface BlockOptions {
  variant?: "primary" | "secondary" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  emphasis?: "normal" | "bold" | "gradient" | "light";
  style?: Record<string, any>;
}

/* ----------------------------------------------------------
   HEADING
---------------------------------------------------------- */

function heading(
  level: "h1" | "h2" | "h3" | "h4" = "h2",
  options?: BlockOptions
): BlueprintNode {
  const sizes: Record<string, Record<string, any>> = {
    h1: { fontSize: 48, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: 36, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontSize: 24, lineHeight: 1.3, fontWeight: 600, letterSpacing: "0" },
    h4: { fontSize: 20, lineHeight: 1.4, fontWeight: 600, letterSpacing: "0" },
  };

  const sizeStyle = sizes[level] || sizes.h2;

  return {
    id: createId("heading"),
    type: "heading",
    props: {
      level,
      text: "",
      emphasis: options?.emphasis,
      style: {
        margin: 0,
        marginBottom: level === "h1" ? 24 : 16,
        ...sizeStyle,
        ...options?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   SUBHEADING (Tagline/Kicker)
---------------------------------------------------------- */

function subheading(options?: BlockOptions): BlueprintNode {
  return {
    id: createId("text"),
    type: "text",
    props: {
      text: "",
      role: "subheading",
      style: {
        margin: 0,
        marginBottom: 12,
        fontSize: 14,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        opacity: 0.7,
        ...options?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   TEXT / PARAGRAPH
---------------------------------------------------------- */

function text(options?: BlockOptions & { role?: "body" | "lead" | "caption" }): BlueprintNode {
  const roleStyles: Record<string, Record<string, any>> = {
    body: { fontSize: 16, lineHeight: 1.7, opacity: 0.85 },
    lead: { fontSize: 20, lineHeight: 1.6, opacity: 0.9 },
    caption: { fontSize: 14, lineHeight: 1.5, opacity: 0.7 },
  };

  const roleStyle = roleStyles[options?.role ?? "body"];

  return {
    id: createId("text"),
    type: "text",
    props: {
      text: "",
      role: options?.role ?? "body",
      style: {
        margin: 0,
        marginBottom: 16,
        maxWidth: 600,
        ...roleStyle,
        ...options?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   BUTTON
---------------------------------------------------------- */

function button(
  variant: "primary" | "secondary" | "ghost" | "gradient" = "primary",
  options?: BlockOptions
): BlueprintNode {
  const variantStyles: Record<string, Record<string, any>> = {
    primary: {
      padding: "14px 28px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    secondary: {
      padding: "14px 28px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      background: "transparent",
      borderWidth: 2,
      borderStyle: "solid",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    ghost: {
      padding: "14px 28px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    gradient: {
      padding: "14px 28px",
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 16,
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    },
  };

  return {
    id: createId("button"),
    type: "button",
    props: {
      label: "Get Started",
      href: "#",
      variant,
      style: {
        ...variantStyles[variant],
        ...options?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   IMAGE
---------------------------------------------------------- */

function image(opts?: {
  aspectRatio?: string;
  radius?: number;
  effect?: "none" | "shadow" | "border" | "glow";
  style?: Record<string, any>;
}): BlueprintNode {
  const effectStyles: Record<string, Record<string, any>> = {
    none: {},
    shadow: {
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    },
    border: {
      border: "4px solid rgba(255,255,255,0.9)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    },
    glow: {
      boxShadow: "0 0 60px rgba(99,102,241,0.3)",
    },
  };

  return {
    id: createId("image"),
    type: "image",
    props: {
      src: null, // Will be filled by imageApplier
      alt: "",
      aspectRatio: opts?.aspectRatio ?? "16/10",
      radius: opts?.radius ?? 16,
      effect: opts?.effect ?? "shadow",
      style: {
        width: "100%",
        height: "auto",
        objectFit: "cover",
        borderRadius: opts?.radius ?? 16,
        ...effectStyles[opts?.effect ?? "shadow"],
        ...opts?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   ICON (LUCIDE ICONS)
---------------------------------------------------------- */

function icon(opts?: {
  name?: string;
  size?: number;
  variant?: "default" | "filled" | "outlined" | "soft" | "gradient";
  style?: Record<string, any>;
}): BlueprintNode {
  return {
    id: createId("icon"),
    type: "icon",
    props: {
      icon: opts?.name ?? "Sparkles",
      size: opts?.size ?? 40,
      variant: opts?.variant ?? "soft",
      style: {
        marginBottom: 16,
        ...opts?.style,
      },
    },
    children: [],
  };
}

/* ----------------------------------------------------------
   SPACER
---------------------------------------------------------- */

function spacer(height: number = 32): BlueprintNode {
  return {
    id: createId("spacer"),
    type: "spacer",
    props: {
      height,
      style: { height },
    },
    children: [],
  };
}

/* ============================================================
   CARD FACTORIES (COMPOSITE BLOCKS)
============================================================ */

/* ----------------------------------------------------------
   FEATURE CARD
---------------------------------------------------------- */

function featureCard(iconName?: string): BlueprintNode[] {
  return [
    icon({ name: iconName ?? "Zap", size: 32, variant: "soft" }),
    heading("h3", { style: { marginBottom: 12, fontSize: 20 } }),
    text({ role: "body", style: { opacity: 0.75, marginBottom: 0 } }),
  ];
}

/* ----------------------------------------------------------
   TESTIMONIAL CARD
---------------------------------------------------------- */

function testimonialCard(): BlueprintNode[] {
  return [
    icon({ name: "Quote", size: 32, variant: "soft", style: { marginBottom: 16 } }),
    text({ role: "lead", style: { fontStyle: "italic", marginBottom: 24, fontSize: 18 } }),
    {
      id: createId("container"),
      type: "container",
      props: {
        layout: "columns",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
        },
      },
      children: [
        {
          id: createId("column"),
          type: "column",
          props: { style: { flex: "0 0 auto" } },
          children: [
            image({ 
              aspectRatio: "1/1", 
              radius: 100, 
              effect: "none", 
              style: { width: 48, height: 48 } 
            }),
          ],
        },
        {
          id: createId("column"),
          type: "column",
          props: { style: { flex: "1 1 auto" } },
          children: [
            heading("h4", { style: { fontSize: 16, marginBottom: 4 } }),
            text({ role: "caption", style: { marginBottom: 0 } }),
          ],
        },
      ],
    },
  ];
}

/* ----------------------------------------------------------
   PRICING CARD
---------------------------------------------------------- */

function pricingCard(): BlueprintNode[] {
  return [
    heading("h3", { style: { marginBottom: 8, fontSize: 20 } }),
    text({ role: "caption", style: { marginBottom: 16 } }),
    heading("h2", { style: { fontSize: 48, marginBottom: 24, fontWeight: 700 } }),
    text({ role: "body", style: { marginBottom: 24 } }),
    button("primary"),
  ];
}

/* ----------------------------------------------------------
   STAT CARD
---------------------------------------------------------- */

function statCard(): BlueprintNode[] {
  return [
    heading("h2", { 
      emphasis: "gradient",
      style: { fontSize: 56, fontWeight: 700, marginBottom: 8, lineHeight: 1 } 
    }),
    text({ role: "body", style: { fontWeight: 500, marginBottom: 0 } }),
  ];
}

/* ============================================================
   WRAPPER HELPER
============================================================ */

/**
 * Wrap content in a card container (for visual effects)
 */
function wrapInCard(
  children: BlueprintNode[],
  visual: "card" | "glass" | "gradient" | "plain" = "card",
  tokens: any,
  extraStyle?: Record<string, any>
): BlueprintNode {
  return {
    id: createId("container"),
    type: "container",
    props: {
      visual,
      style: {
        padding: tokens.spacing?.[8] || 32,
        borderRadius: tokens.radius?.lg || 16,
        ...extraStyle,
      },
    },
    children,
  };
}

/* ============================================================
   SEMANTIC HELPERS
============================================================ */

function inferIntent(section: BlueprintNode): string {
  const raw =
    section.props?.sectionName ??
    section.props?.intent ??
    "";

  return raw.toLowerCase();
}

function isEmpty(column?: BlueprintNode): boolean {
  return !column?.children || column.children.length === 0;
}

/* ============================================================
   MATERIALIZER (AUTHORITATIVE)
============================================================ */

export function materializeBlocks(page: BlueprintNode): BlueprintNode {
  if (!page.children) return page;

  // Extract design tokens
  const tokens = getTokens(page);
  const sp = (key: string | number, fallback: number) => tokens.spacing?.[key] || fallback;
  const rd = (key: string, fallback: number) => tokens.radius?.[key] || fallback;
  const fs = (key: string, fallback: number) => tokens.typography?.fontSize?.[key] || fallback;

  console.log("[Materializer] Starting block materialization with tokens:", {
    hasSpacing: !!tokens.spacing,
    hasRadius: !!tokens.radius,
    hasTypography: !!tokens.typography,
  });

  page.children.forEach((section) => {
    if (section.type !== "section") return;

    const intent = inferIntent(section);
    console.log(`[Materializer] Processing section: ${intent}`);

    const container = section.children?.find((c) => c.type === "container");
    if (!container) return;

    const columns = container.children?.filter((c) => c.type === "column") ?? [];
    if (!columns.length) return;

    /* ========================================================
       HERO
    ======================================================== */

    if (intent.includes("hero")) {
      const left = columns[0];
      const right = columns[1];

      if (isEmpty(left)) {
        left.children = [
          subheading(),
          heading("h1", { 
            emphasis: "bold",
            style: {
              fontSize: fs("6xl", 60),
              marginBottom: sp(6, 24),
              fontWeight: 800,
            }
          }),
          text({ 
            role: "lead", 
            style: { 
              maxWidth: 500,
              fontSize: fs("lg", 18),
              marginBottom: sp(8, 32),
            } 
          }),
          {
            id: createId("container"),
            type: "container",
            props: {
              layout: "columns",
              style: {
                display: "flex",
                flexDirection: "row",
                gap: sp(4, 16),
                marginTop: sp(2, 8),
              },
            },
            children: [
              {
                id: createId("column"),
                type: "column",
                props: { style: { flex: "0 0 auto" } },
                children: [
                  button("primary", {
                    style: {
                      borderRadius: rd("md", 12),
                      paddingTop: sp(3, 14),
                      paddingBottom: sp(3, 14),
                      paddingLeft: sp(8, 32),
                      paddingRight: sp(8, 32),
                    }
                  }),
                ],
              },
              {
                id: createId("column"),
                type: "column",
                props: { style: { flex: "0 0 auto" } },
                children: [
                  button("secondary", {
                    style: {
                      borderRadius: rd("md", 12),
                      paddingTop: sp(3, 14),
                      paddingBottom: sp(3, 14),
                      paddingLeft: sp(8, 32),
                      paddingRight: sp(8, 32),
                    }
                  }),
                ],
              },
            ],
          },
        ];

        left.props = {
          ...left.props,
          style: {
            ...(left.props?.style ?? {}),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
        };
      }

      if (right && isEmpty(right)) {
        right.children = [
          image({ 
            aspectRatio: "4/3", 
            radius: rd("xl", 20), 
            effect: "shadow" 
          }),
        ];

        right.props = {
          ...right.props,
          style: {
            ...(right.props?.style ?? {}),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        };
      }

      return;
    }

    /* ========================================================
       FEATURES
    ======================================================== */

    if (intent.includes("feature")) {
      const featureIcons = ["Zap", "Shield", "Target", "TrendingUp", "Lightbulb", "Rocket"];
      const isGridLayout = columns.length >= 3;

      if (isGridLayout) {
        columns.forEach((col, index) => {
          if (!isEmpty(col)) return;

          // ✅ Wrap in card container
          col.children = [
            wrapInCard(
              featureCard(featureIcons[index % featureIcons.length]),
              "card",
              tokens,
              {
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }
            ),
          ];
        });
      } else {
        // Split layout
        const left = columns[0];
        const right = columns[1];

        if (left && isEmpty(left)) {
          left.children = [
            subheading(),
            heading("h2", { style: { fontSize: fs("4xl", 36) } }),
            text({ role: "body" }),
            ...featureCard(featureIcons[0]),
          ];
        }

        if (right && isEmpty(right)) {
          right.children = [
            image({ aspectRatio: "1/1", radius: rd("xl", 24), effect: "shadow" }),
          ];
        }
      }

      return;
    }

    /* ========================================================
       SERVICES
    ======================================================== */

    if (intent.includes("service")) {
      const serviceIcons = ["Wrench", "BarChart3", "Palette", "Briefcase", "Settings", "Smartphone"];
      
      columns.forEach((col, index) => {
        if (!isEmpty(col)) return;

        col.children = [
          wrapInCard(
            [
              icon({ name: serviceIcons[index % serviceIcons.length], size: 32, variant: "soft" }),
              heading("h3", { style: { fontSize: 20 } }),
              text({ role: "body", style: { marginBottom: sp(4, 16) } }),
              button("ghost", { style: { padding: "8px 0" } }),
            ],
            "card",
            tokens
          ),
        ];
      });

      return;
    }

    /* ========================================================
       PROJECTS / PORTFOLIO / GALLERY
    ======================================================== */

    if (
      intent.includes("project") ||
      intent.includes("portfolio") ||
      intent.includes("gallery") ||
      intent.includes("listing")
    ) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            overflow: "hidden",
            borderRadius: rd("lg", 16),
          },
        };

        col.children = [
          image({ aspectRatio: "4/3", radius: rd("lg", 16), effect: "shadow" }),
          spacer(sp(4, 16)),
          heading("h3", { style: { marginBottom: 8, fontSize: 20 } }),
          text({ role: "caption", style: { marginBottom: 0 } }),
        ];
      });

      return;
    }

    /* ========================================================
       TESTIMONIALS
    ======================================================== */

    if (
      intent.includes("testimonial") ||
      intent.includes("review") ||
      intent.includes("client")
    ) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.children = [
          wrapInCard(
            testimonialCard(),
            "card",
            tokens,
            {
              padding: sp(8, 32),
              borderRadius: rd("xl", 20),
            }
          ),
        ];
      });

      return;
    }

    /* ========================================================
       PRICING
    ======================================================== */

    if (intent.includes("pricing") || intent.includes("plan")) {
      columns.forEach((col, index) => {
        if (!isEmpty(col)) return;

        const isHighlighted = columns.length === 3 && index === 1;

        col.children = [
          wrapInCard(
            pricingCard(),
            isHighlighted ? "gradient" : "card",
            tokens,
            {
              padding: sp(8, 32),
              borderRadius: rd("xl", 20),
              textAlign: "center",
              ...(isHighlighted ? {
                transform: "scale(1.05)",
                zIndex: 1,
              } : {}),
            }
          ),
        ];
      });

      return;
    }

    /* ========================================================
       STATS
    ======================================================== */

    if (intent.includes("stat") || intent.includes("number") || intent.includes("metric")) {
      const statIcons = ["TrendingUp", "Users", "Trophy", "Star", "DollarSign", "Globe"];
      
      columns.forEach((col, index) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            textAlign: "center",
            padding: sp(6, 24),
          },
        };

        col.children = [
          icon({ name: statIcons[index % statIcons.length], size: 32, variant: "soft" }),
          ...statCard(),
        ];
      });

      return;
    }

    /* ========================================================
       ABOUT / WHY / STORY
    ======================================================== */

    if (
      intent.includes("about") ||
      intent.includes("why") ||
      intent.includes("story")
    ) {
      const left = columns[0];
      const right = columns[1];

      if (left && isEmpty(left)) {
        left.children = [
          subheading(),
          heading("h2", { style: { fontSize: fs("4xl", 36) } }),
          text({ role: "lead", style: { fontSize: fs("lg", 18) } }),
          text({ role: "body" }),
        ];

        left.props = {
          ...left.props,
          style: {
            ...(left.props?.style ?? {}),
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
        };
      }

      if (right && isEmpty(right)) {
        right.children = [
          image({ aspectRatio: "4/5", radius: rd("xl", 24), effect: "shadow" }),
        ];
      }

      return;
    }

    /* ========================================================
       TEAM
    ======================================================== */

    if (intent.includes("team") || intent.includes("people")) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            textAlign: "center",
          },
        };

        col.children = [
          image({ 
            aspectRatio: "1/1", 
            radius: rd("full", 100), 
            effect: "border", 
            style: { maxWidth: 160, margin: "0 auto" } 
          }),
          spacer(sp(4, 16)),
          heading("h3", { style: { marginBottom: 4, fontSize: 18 } }),
          text({ role: "caption", style: { marginBottom: 0 } }),
        ];
      });

      return;
    }

    /* ========================================================
       FAQ
    ======================================================== */

    if (intent.includes("faq") || intent.includes("question")) {
      const col = columns[0];

      if (col && isEmpty(col)) {
        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            maxWidth: 800,
            margin: "0 auto",
          },
        };

        col.children = [
          heading("h2", { 
            style: { 
              textAlign: "center", 
              marginBottom: sp(12, 48),
              fontSize: fs("4xl", 36),
            } 
          }),
          ...Array.from({ length: 4 }).flatMap(() => [
            wrapInCard(
              [
                heading("h3", { style: { fontSize: 18, marginBottom: 12 } }),
                text({ role: "body", style: { marginBottom: 0, opacity: 0.75 } }),
              ],
              "card",
              tokens,
              {
                padding: sp(6, 24),
                borderRadius: rd("md", 12),
                marginBottom: sp(4, 16),
              }
            ),
          ]),
        ];
      }

      return;
    }

    /* ========================================================
       CTA / CONTACT
    ======================================================== */

    if (
      intent.includes("cta") ||
      intent.includes("contact") ||
      intent.includes("get") ||
      intent.includes("start") ||
      intent.includes("action")
    ) {
      const col = columns[0];

      if (col && isEmpty(col)) {
        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto",
          },
        };

        col.children = [
          heading("h2", { 
            emphasis: "bold", 
            style: { 
              marginBottom: sp(4, 16),
              fontSize: fs("4xl", 36),
            } 
          }),
          text({ 
            role: "lead", 
            style: { 
              marginBottom: sp(8, 32), 
              maxWidth: 500, 
              margin: `0 auto ${sp(8, 32)}px`,
              fontSize: fs("lg", 18),
            } 
          }),
          {
            id: createId("container"),
            type: "container",
            props: {
              layout: "columns",
              style: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: sp(4, 16),
              },
            },
            children: [
              {
                id: createId("column"),
                type: "column",
                props: { style: { flex: "0 0 auto" } },
                children: [button("gradient")],
              },
              {
                id: createId("column"),
                type: "column",
                props: { style: { flex: "0 0 auto" } },
                children: [button("secondary")],
              },
            ],
          },
        ];
      }

      return;
    }

    /* ========================================================
       LOGOS / PARTNERS / CLIENTS
    ======================================================== */

    if (
      intent.includes("logo") ||
      intent.includes("partner") ||
      intent.includes("brand") ||
      intent.includes("trust")
    ) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: sp(6, 24),
            opacity: 0.6,
            transition: "opacity 0.2s ease",
          },
        };

        col.children = [
          image({ 
            aspectRatio: "3/1", 
            radius: 0, 
            effect: "none", 
            style: { maxHeight: 40, objectFit: "contain", filter: "grayscale(1)" } 
          }),
        ];
      });

      return;
    }

    /* ========================================================
       BLOG / NEWS / ARTICLES
    ======================================================== */

    if (
      intent.includes("blog") ||
      intent.includes("news") ||
      intent.includes("article") ||
      intent.includes("post")
    ) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.children = [
          image({ aspectRatio: "16/9", radius: rd("lg", 16), effect: "shadow" }),
          spacer(sp(4, 16)),
          text({ 
            role: "caption", 
            style: { 
              textTransform: "uppercase", 
              fontSize: 12, 
              fontWeight: 600,
              marginBottom: sp(2, 8),
            } 
          }),
          heading("h3", { style: { marginBottom: sp(2, 8), fontSize: 20 } }),
          text({ role: "body", style: { marginBottom: sp(4, 16) } }),
          button("ghost", { style: { padding: "8px 0" } }),
        ];
      });

      return;
    }

    /* ========================================================
       FALLBACK (SAFE DEFAULT)
    ======================================================== */

    columns.forEach((col) => {
      if (!isEmpty(col)) return;

      col.children = [
        heading("h2", { style: { fontSize: fs("3xl", 30) } }),
        text({ role: "body" }),
      ];
    });
  });

  console.log("[Materializer] Block materialization complete");

  return page;
}
