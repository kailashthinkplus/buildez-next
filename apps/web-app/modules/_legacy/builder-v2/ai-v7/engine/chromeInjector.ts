// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/chromeInjector.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { createId } from "@/modules/builder/utils/createId";
import type { AIV7BrandContext } from "../types";

/* ============================================================
   CONTRAST CHECKER (WCAG AA Compliant)
============================================================ */

function getRelativeLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Calculate relative luminance
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor(backgroundColor: string): string {
  // Check contrast with white and black, return the one with better contrast
  const contrastWithWhite = getContrastRatio(backgroundColor, '#FFFFFF');
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000');
  
  console.log(`[ChromeInjector] Background: ${backgroundColor}`);
  console.log(`[ChromeInjector] Contrast with white: ${contrastWithWhite.toFixed(2)}`);
  console.log(`[ChromeInjector] Contrast with black: ${contrastWithBlack.toFixed(2)}`);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // We'll use white if contrast is good, otherwise black
  return contrastWithWhite >= 4.5 ? '#FFFFFF' : '#000000';
}

/* ============================================================
   HEADER (MODERN GLASS DESIGN)
============================================================ */

function createHeader(brandContext?: AIV7BrandContext): BlueprintNode {
  const logoUrl = brandContext?.logoUrl;
  const primaryColor = brandContext?.designTokens?.colors?.primary || "#2563eb";
  
  const leftColumnChildren: BlueprintNode[] = [];
  
  if (logoUrl) {
    leftColumnChildren.push({
      id: createId("image"),
      type: "image",
      props: {
        src: logoUrl,
        alt: "Logo",
        objectFit: "contain",
        style: {
          height: 40,
          width: "auto",
          maxWidth: 180,
        },
      },
      children: [],
    });
  } else {
    leftColumnChildren.push({
      id: createId("heading"),
      type: "heading",
      props: {
        level: "h2",
        text: "Logo",
        style: {
          fontSize: 24,
          fontWeight: 700,
          margin: 0,
          color: primaryColor,
        },
      },
      children: [],
    });
  }

  const rightColumnChildren: BlueprintNode[] = [
    {
      id: createId("container"),
      type: "container",
      props: {
        layout: "columns",
        gap: 32,
        style: {
          alignItems: "center",
        },
      },
      children: [
        {
          id: createId("button"),
          type: "button",
          props: {
            label: "Get Started",
            variant: "primary",
            style: {
              whiteSpace: "nowrap",
            },
          },
          children: [],
        },
      ],
    },
  ];

  return {
    id: createId("header"),
    type: "section",
    props: {
      role: "header",
      backgroundVariant: "glass",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        paddingTop: 16,
        paddingBottom: 16,
      },
    },
    children: [
      {
        id: createId("container"),
        type: "container",
        props: {
          layout: "columns",
          maxWidth: 1280,
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          },
        },
        children: [
          {
            id: createId("column"),
            type: "column",
            props: {
              style: {
                flex: "0 0 auto",
              },
            },
            children: leftColumnChildren,
          },
          {
            id: createId("column"),
            type: "column",
            props: {
              style: {
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                gap: 24,
              },
            },
            children: rightColumnChildren,
          },
        ],
      },
    ],
  };
}

/* ============================================================
   FOOTER (INDUSTRY-SPECIFIC, AI-GENERATED)
============================================================ */

function createFooter(brandContext?: AIV7BrandContext): BlueprintNode {
  const primaryColor = brandContext?.designTokens?.colors?.primary || "#2563eb";
  const accentColor = brandContext?.designTokens?.colors?.accent || "#6366f1";
  const logoUrl = brandContext?.logoUrl;

  // ✅ FIXED: Calculate readable text color based on background
  const textColor = getReadableTextColor(primaryColor);
  const textColorSecondary = textColor === '#FFFFFF' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(0, 0, 0, 0.7)';
  
  console.log(`[ChromeInjector] Footer text color: ${textColor} (based on ${primaryColor})`);

  return {
    id: createId("footer"),
    type: "section",
    props: {
      role: "footer",
      backgroundVariant: "solid",
      sectionName: "footer", // ✅ NEW: Make it identifiable for content applier
      style: {
        // ✅ FIXED: Use solid color instead of gradient for better contrast
        background: primaryColor,
        color: textColor,
        paddingTop: 64,
        paddingBottom: 64,
        marginTop: 80,
      },
    },
    children: [
      {
        id: createId("container"),
        type: "container",
        props: {
          layout: "columns",
          maxWidth: 1280,
          gap: 48,
        },
        children: [
          // Column 1: Brand (AI will fill this)
          {
            id: createId("column"),
            type: "column",
            props: {
              width: "33%",
              style: {
                gap: 16,
              },
            },
            children: [
              logoUrl
                ? {
                    id: createId("image"),
                    type: "image",
                    props: {
                      src: logoUrl,
                      alt: "Logo",
                      objectFit: "contain",
                      style: {
                        height: 40,
                        width: "auto",
                        maxWidth: 180,
                        filter: textColor === '#FFFFFF' ? "brightness(0) invert(1)" : "none",
                      },
                    },
                    children: [],
                  }
                : {
                    id: createId("heading"),
                    type: "heading",
                    props: {
                      level: "h3",
                      text: "", // ✅ Empty, AI will fill
                      style: {
                        fontSize: 24,
                        fontWeight: 700,
                        color: textColor,
                        marginBottom: 16,
                      },
                    },
                    children: [],
                  },
              {
                id: createId("text"),
                type: "text",
                props: {
                  text: "", // ✅ Empty, AI will fill
                  style: {
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: textColorSecondary,
                    marginBottom: 24,
                  },
                },
                children: [],
              },
              // Social icons
              {
                id: createId("container"),
                type: "container",
                props: {
                  layout: "columns",
                  gap: 16,
                  style: {
                    display: "flex",
                    alignItems: "center",
                  },
                },
                children: [
                  {
                    id: createId("icon"),
                    type: "icon",
                    props: {
                      icon: "Twitter",
                      variant: "default",
                      size: 20,
                      style: {
                        color: textColor,
                        opacity: 0.8,
                        cursor: "pointer",
                      },
                    },
                    children: [],
                  },
                  {
                    id: createId("icon"),
                    type: "icon",
                    props: {
                      icon: "Linkedin",
                      variant: "default",
                      size: 20,
                      style: {
                        color: textColor,
                        opacity: 0.8,
                        cursor: "pointer",
                      },
                    },
                    children: [],
                  },
                  {
                    id: createId("icon"),
                    type: "icon",
                    props: {
                      icon: "Instagram",
                      variant: "default",
                      size: 20,
                      style: {
                        color: textColor,
                        opacity: 0.8,
                        cursor: "pointer",
                      },
                    },
                    children: [],
                  },
                ],
              },
            ],
          },

          // Columns 2-4: Will be filled by AI with industry-specific links
          {
            id: createId("column"),
            type: "column",
            props: {
              width: "22%",
            },
            children: [
              {
                id: createId("heading"),
                type: "heading",
                props: {
                  level: "h4",
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: 16,
                  },
                },
                children: [],
              },
              {
                id: createId("text"),
                type: "text",
                props: {
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 14,
                    color: textColorSecondary,
                    marginBottom: 12,
                  },
                },
                children: [],
              },
            ],
          },

          {
            id: createId("column"),
            type: "column",
            props: {
              width: "22%",
            },
            children: [
              {
                id: createId("heading"),
                type: "heading",
                props: {
                  level: "h4",
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: 16,
                  },
                },
                children: [],
              },
              {
                id: createId("text"),
                type: "text",
                props: {
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 14,
                    color: textColorSecondary,
                    marginBottom: 12,
                  },
                },
                children: [],
              },
            ],
          },

          {
            id: createId("column"),
            type: "column",
            props: {
              width: "23%",
            },
            children: [
              {
                id: createId("heading"),
                type: "heading",
                props: {
                  level: "h4",
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: 16,
                  },
                },
                children: [],
              },
              {
                id: createId("text"),
                type: "text",
                props: {
                  text: "", // ✅ AI will fill
                  style: {
                    fontSize: 14,
                    color: textColorSecondary,
                    marginBottom: 12,
                  },
                },
                children: [],
              },
            ],
          },
        ],
      },

      // Copyright bar
      {
        id: createId("container"),
        type: "container",
        props: {
          layout: "single",
          maxWidth: 1280,
          style: {
            borderTop: `1px solid ${textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            paddingTop: 32,
            marginTop: 48,
          },
        },
        children: [
          {
            id: createId("text"),
            type: "text",
            props: {
              text: "", // ✅ AI will fill with company name
              style: {
                fontSize: 14,
                color: textColorSecondary,
                textAlign: "center",
              },
            },
            children: [],
          },
        ],
      },
    ],
  };
}

/* ============================================================
   PUBLIC API
============================================================ */

export function injectHeaderFooter(
  page: BlueprintNode,
  brandContext?: AIV7BrandContext
): BlueprintNode {
  if (page.type !== "page") return page;

  const children = page.children ?? [];

  const hasHeader = children.some(
    (c) => c.type === "section" && c.props?.role === "header"
  );

  const hasFooter = children.some(
    (c) => c.type === "section" && c.props?.role === "footer"
  );

  return {
    ...page,
    children: [
      ...(hasHeader ? [] : [createHeader(brandContext)]),
      ...children,
      ...(hasFooter ? [] : [createFooter(brandContext)]),
    ],
  };
}
