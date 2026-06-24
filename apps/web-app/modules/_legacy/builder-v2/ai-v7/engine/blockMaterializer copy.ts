// /modules/builder/ai-v7/engine/blockMaterializer.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { createId } from "@/modules/builder/utils/createId";

/* ============================================================
   BLOCK FACTORIES (WITH RICH DEFAULT STYLES)
   🎨 Blocks now include visual styling out of the box
============================================================ */

interface BlockOptions {
  /** Visual variant for the block */
  variant?: "primary" | "secondary" | "ghost" | "gradient";
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Emphasis level */
  emphasis?: "normal" | "bold" | "gradient" | "light";
  /** Additional style overrides */
  style?: Record<string, any>;
}

/* ----------------------------------------------------------
   HEADING
---------------------------------------------------------- */

function heading(
  level: "h1" | "h2" | "h3" = "h2",
  options?: BlockOptions
): BlueprintNode {
  const sizes = {
    h1: { fontSize: 48, lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: 36, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontSize: 24, lineHeight: 1.3, fontWeight: 600, letterSpacing: "0" },
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
  const roleStyles = {
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
      boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
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
   ICON
---------------------------------------------------------- */

function icon(opts?: {
  size?: number;
  style?: Record<string, any>;
}): BlueprintNode {
  return {
    id: createId("icon"),
    type: "icon",
    props: {
      icon: "✨",
      size: opts?.size ?? 40,
      style: {
        fontSize: opts?.size ?? 40,
        lineHeight: 1,
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

/* ----------------------------------------------------------
   DIVIDER
---------------------------------------------------------- */

function divider(): BlueprintNode {
  return {
    id: createId("divider"),
    type: "divider",
    props: {
      style: {
        width: "100%",
        height: 1,
        background: "currentColor",
        opacity: 0.1,
        marginTop: 24,
        marginBottom: 24,
      },
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

function featureCard(): BlueprintNode[] {
  return [
    icon({ size: 48 }),
    heading("h3", { style: { marginBottom: 12 } }),
    text({ role: "body", style: { opacity: 0.75, marginBottom: 0 } }),
  ];
}

/* ----------------------------------------------------------
   TESTIMONIAL CARD
---------------------------------------------------------- */

function testimonialCard(): BlueprintNode[] {
  return [
    text({ role: "lead", style: { fontStyle: "italic", marginBottom: 24 } }),
    {
      id: createId("container"),
      type: "container",
      props: {
        layout: "row",
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
        },
      },
      children: [
        image({ aspectRatio: "1/1", radius: 100, effect: "none", style: { width: 48, height: 48, flexShrink: 0 } }),
        {
          id: createId("container"),
          type: "container",
          props: {
            layout: "column",
            style: { display: "flex", flexDirection: "column", gap: 2 },
          },
          children: [
            heading("h3", { style: { fontSize: 16, marginBottom: 0 } }),
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
    heading("h3", { style: { marginBottom: 8 } }),
    text({ role: "caption", style: { marginBottom: 16 } }),
    heading("h2", { style: { fontSize: 48, marginBottom: 24 } }),
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
   🎯 Creates rich, styled blocks based on section intent
============================================================ */

export function materializeBlocks(
  page: BlueprintNode
): BlueprintNode {
  if (!page.children) return page;

  page.children.forEach((section) => {
    if (section.type !== "section") return;

    const intent = inferIntent(section);

    const container = section.children?.find(
      (c) => c.type === "container"
    );
    if (!container) return;

    const columns =
      container.children?.filter(
        (c) => c.type === "column"
      ) ?? [];

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
          heading("h1", { emphasis: "bold" }),
          text({ role: "lead", style: { maxWidth: 500 } }),
          {
            id: createId("container"),
            type: "container",
            props: {
              layout: "row",
              style: {
                display: "flex",
                flexDirection: "row",
                gap: 16,
                marginTop: 8,
              },
            },
            children: [
              button("primary"),
              button("secondary"),
            ],
          },
        ];

        // Add vertical centering to hero left column
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
          image({ aspectRatio: "4/3", radius: 20, effect: "shadow" }),
        ];

        // Center the image vertically
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
      // Check if there's a header row (first column spanning full width)
      const isGridLayout = columns.length >= 3;

      if (isGridLayout) {
        columns.forEach((col, index) => {
          if (!isEmpty(col)) return;

          // Apply card styling to feature columns
          col.props = {
            ...col.props,
            visual: "card",
            style: {
              ...(col.props?.style ?? {}),
              padding: 32,
              borderRadius: 16,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            },
          };

          col.children = featureCard();
        });
      } else {
        // Split layout with image
        const left = columns[0];
        const right = columns[1];

        if (left && isEmpty(left)) {
          left.children = [
            subheading(),
            heading("h2"),
            text({ role: "body" }),
            ...featureCard(),
          ];
        }

        if (right && isEmpty(right)) {
          right.children = [
            image({ aspectRatio: "1/1", radius: 24, effect: "shadow" }),
          ];
        }
      }

      return;
    }

    /* ========================================================
       SERVICES
    ======================================================== */

    if (intent.includes("service")) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          visual: "card",
          style: {
            ...(col.props?.style ?? {}),
            padding: 24,
            borderRadius: 16,
          },
        };

        col.children = [
          image({ aspectRatio: "16/10", radius: 12, effect: "none" }),
          spacer(16),
          heading("h3"),
          text({ role: "body", style: { marginBottom: 16 } }),
          button("ghost", { style: { padding: "8px 0" } }),
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
            borderRadius: 16,
          },
        };

        col.children = [
          image({ aspectRatio: "4/3", radius: 16, effect: "shadow" }),
          spacer(16),
          heading("h3", { style: { marginBottom: 8 } }),
          text({ role: "caption" }),
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

        col.props = {
          ...col.props,
          visual: "card",
          style: {
            ...(col.props?.style ?? {}),
            padding: 32,
            borderRadius: 20,
          },
        };

        col.children = testimonialCard();
      });

      return;
    }

    /* ========================================================
       PRICING
    ======================================================== */

    if (intent.includes("pricing") || intent.includes("plan")) {
      columns.forEach((col, index) => {
        if (!isEmpty(col)) return;

        // Middle card gets emphasis
        const isHighlighted = columns.length === 3 && index === 1;

        col.props = {
          ...col.props,
          visual: isHighlighted ? "elevated" : "card",
          highlighted: isHighlighted,
          style: {
            ...(col.props?.style ?? {}),
            padding: 32,
            borderRadius: 20,
            textAlign: "center",
            ...(isHighlighted ? {
              transform: "scale(1.05)",
              zIndex: 1,
            } : {}),
          },
        };

        col.children = pricingCard();
      });

      return;
    }

    /* ========================================================
       STATS
    ======================================================== */

    if (intent.includes("stat") || intent.includes("number") || intent.includes("metric")) {
      columns.forEach((col) => {
        if (!isEmpty(col)) return;

        col.props = {
          ...col.props,
          style: {
            ...(col.props?.style ?? {}),
            textAlign: "center",
            padding: 24,
          },
        };

        col.children = statCard();
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
          heading("h2"),
          text({ role: "lead" }),
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
          image({ aspectRatio: "4/5", radius: 24, effect: "shadow" }),
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
          image({ aspectRatio: "1/1", radius: 100, effect: "border", style: { maxWidth: 160, margin: "0 auto" } }),
          spacer(16),
          heading("h3", { style: { marginBottom: 4 } }),
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

        // Create FAQ items
        col.children = [
          heading("h2", { style: { textAlign: "center", marginBottom: 48 } }),
          ...Array.from({ length: 4 }).flatMap(() => [
            {
              id: createId("container"),
              type: "container",
              props: {
                visual: "bordered",
                style: {
                  padding: 24,
                  borderRadius: 12,
                  marginBottom: 16,
                },
              },
              children: [
                heading("h3", { style: { fontSize: 18, marginBottom: 12 } }),
                text({ role: "body", style: { marginBottom: 0, opacity: 0.75 } }),
              ],
            } as BlueprintNode,
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
          heading("h2", { emphasis: "bold", style: { marginBottom: 16 } }),
          text({ role: "lead", style: { marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" } }),
          {
            id: createId("container"),
            type: "container",
            props: {
              layout: "row",
              style: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
              },
            },
            children: [
              button("gradient"),
              button("secondary"),
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
            padding: 24,
            opacity: 0.6,
            transition: "opacity 0.2s ease",
          },
        };

        col.children = [
          image({ aspectRatio: "3/1", radius: 0, effect: "none", style: { maxHeight: 40, objectFit: "contain" } }),
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
        heading("h2"),
        text({ role: "body" }),
      ];
    });
  });

  return page;
}