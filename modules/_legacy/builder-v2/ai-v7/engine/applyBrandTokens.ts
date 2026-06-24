import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   APPLY BRAND TOKENS — PURE TRANSFORMER
============================================================ */

interface BrandTokens {
  colors?: Record<string, string>;
}

/**
 * Inject brand-derived design tokens into the page
 * - Never deletes existing tokens
 * - Brand always has priority
 * - Page-level only
 */
export function applyBrandTokens(
  page: BlueprintNode,
  brand: BrandTokens
): BlueprintNode {
  if (page.type !== "page") return page;
  if (!brand.colors) return page;

  return {
    ...page,
    props: {
      ...page.props,
      designTokens: {
        ...(page.props?.designTokens ?? {}),
        colors: {
          ...(page.props?.designTokens?.colors ?? {}),
          ...brand.colors, // 🔑 brand wins
        },
      },
    },
  };
}
