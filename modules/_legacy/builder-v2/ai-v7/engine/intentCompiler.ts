// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/intentCompiler.ts

import { createId } from "@/modules/builder/utils/createId";
import type {
  SemanticPlan,
  SemanticSection,
  LayoutIntent,
  VisualIntent,
  BackgroundVariant,
} from "../types";
import type { BlueprintNode } from "@/modules/builder/types";

/* ============================================================
   INTENT COMPILER — V7 (STRUCTURE ONLY)
   
   Philosophy:
   - Converts SemanticPlan (AI output) to Blueprint (structure)
   - Sets SEMANTIC PROPS only (backgroundVariant, visual, layout)
   - Does NOT set inline styles (normalizer's job)
   - Shares logic with layoutCompiler for consistency
============================================================ */

/* ============================================================
   LAYOUT CONFIGURATION (STRUCTURAL METADATA)
============================================================ */

interface LayoutConfig {
  columns: number;
  containerLayout: "single" | "columns" | "grid";
  columnRatios?: number[];
}

function getLayoutConfig(
  layout: LayoutIntent,
  sectionIntent?: string
): LayoutConfig {
  switch (layout) {
    case "single":
    case "stacked":
      return {
        columns: 1,
        containerLayout: "single",
      };

    case "split":
      return {
        columns: 2,
        containerLayout: "columns",
        columnRatios: [50, 50],
      };

    case "split-reverse":
      return {
        columns: 2,
        containerLayout: "columns",
        columnRatios: [50, 50],
      };

    case "grid":
      return {
        columns: 3,
        containerLayout: "grid",
      };

    case "columns":
      // Flexible columns: 3 for testimonials, 2 otherwise
      const cols = sectionIntent?.includes("testimonial") ? 3 : 2;
      return {
        columns: cols,
        containerLayout: "columns",
      };

    case "masonry":
      return {
        columns: 3,
        containerLayout: "grid",
      };

    default:
      return {
        columns: 1,
        containerLayout: "single",
      };
  }
}

/* ============================================================
   COMPILE SEMANTIC PLAN → BLUEPRINT NODES
============================================================ */

export function compileSemanticPlan(plan: SemanticPlan): BlueprintNode[] {
  console.log(`[IntentCompiler] Compiling semantic plan with ${plan.sections.length} sections`);

  return plan.sections.map((section, index) => {
    const layoutConfig = getLayoutConfig(section.layout, section.intent);

    console.log(`[IntentCompiler] Section ${index}: ${section.id}`, {
      intent: section.intent,
      layout: section.layout,
      columns: layoutConfig.columns,
      backgroundVariant: section.backgroundVariant,
      visual: section.visual,
    });

    // Determine if this is a reversed split
    const isReversed = section.layout === "split-reverse";

    // Build columns (structure only, no styles)
    // Build columns (structure only, no styles)
const columns: BlueprintNode[] = Array.from({
  length: layoutConfig.columns,
}).map((_, colIndex) => {
  const props: Record<string, any> = {
    index: colIndex,
  };

  // Add width for column layouts with ratios
  if (layoutConfig.columnRatios && layoutConfig.containerLayout === "columns") {
    props.width = `${layoutConfig.columnRatios[colIndex]}%`;
  }

  // For reversed layouts, swap content order
  // ✅ FIX: Use layoutConfig.columns instead of columns.length
  if (isReversed && layoutConfig.columns === 2) {
    props.contentOrder = colIndex === 0 ? 1 : 0;
  }

  return {
    id: createId("column"),
    type: "column",
    props,
    children: [],
  };
});
    // Build section node (semantic props only)
    const sectionNode: BlueprintNode = {
      id: createId("section"),
      type: "section",
      props: {
        // ✅ Semantic metadata (from AI plan)
        sectionName: section.id,
        intent: section.intent,
        layout: section.layout,
        visual: section.visual,
        backgroundVariant: section.backgroundVariant,
        sectionIndex: index,

        // ✅ Layout metadata
        columns: layoutConfig.columns,
      },
      children: [
        {
          id: createId("container"),
          type: "container",
          props: {
            // ✅ Semantic metadata
            layout: layoutConfig.containerLayout,
            visual: section.visual,
            columns: layoutConfig.columns,
          },
          children: columns,
        },
      ],
    };

    return sectionNode;
  });
}

/* ============================================================
   COMPILE SINGLE SECTION
============================================================ */

export function compileSingleSection(
  section: SemanticSection,
  index: number = 0
): BlueprintNode {
  const [compiled] = compileSemanticPlan({ sections: [section] });
  
  if (compiled.props) {
    compiled.props.sectionIndex = index;
  }

  return compiled;
}

/* ============================================================
   HELPERS FOR EXTERNAL USE
============================================================ */

/**
 * Get the number of columns for a given layout intent
 */
export function getColumnCount(layout: LayoutIntent): number {
  return getLayoutConfig(layout).columns;
}

/**
 * Check if a section should use dark text colors
 */
export function isDarkSection(section: BlueprintNode): boolean {
  return (
    section.props?.backgroundVariant === "dark" ||
    section.props?.backgroundVariant === "solid" ||
    section.props?.visual === "dark"
  );
}

/**
 * Get recommended content block types for a section intent
 */
export function getRecommendedContent(intent: string): string[] {
  const contentMap: Record<string, string[]> = {
    hero: ["subheading", "heading", "text", "primaryCTA", "secondaryCTA", "image"],
    features: ["heading", "subheading", "featureCard", "featureCard", "featureCard"],
    services: ["heading", "serviceCard", "serviceCard", "serviceCard"],
    testimonials: ["heading", "testimonialCard", "testimonialCard", "testimonialCard"],
    pricing: ["heading", "subheading", "pricingCard", "pricingCard", "pricingCard"],
    about: ["subheading", "heading", "text", "image"],
    stats: ["statNumber", "statNumber", "statNumber", "statNumber"],
    cta: ["heading", "text", "primaryCTA", "secondaryCTA"],
    faq: ["heading", "faqItem", "faqItem", "faqItem", "faqItem"],
    team: ["heading", "teamCard", "teamCard", "teamCard"],
    gallery: ["heading", "image", "image", "image"],
    contact: ["heading", "text", "form"],
    logos: ["heading", "logoGrid"],
  };

  return contentMap[intent] ?? ["heading", "text"];
}

/**
 * Validate semantic plan structure
 */
export function validateSemanticPlan(plan: SemanticPlan): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!plan.sections || plan.sections.length === 0) {
    errors.push("Semantic plan must have at least one section");
  }

  plan.sections.forEach((section, index) => {
    if (!section.id) {
      errors.push(`Section ${index} missing required 'id' field`);
    }
    if (!section.intent) {
      errors.push(`Section ${index} missing required 'intent' field`);
    }
    if (!section.layout) {
      errors.push(`Section ${index} missing required 'layout' field`);
    }
    if (!section.visual) {
      errors.push(`Section ${index} missing required 'visual' field`);
    }
    if (!section.backgroundVariant) {
      errors.push(`Section ${index} missing required 'backgroundVariant' field`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get layout intent from section intent (helper for backwards compatibility)
 */
export function inferLayoutFromIntent(intent: string): LayoutIntent {
  const intentLower = intent.toLowerCase();

  if (intentLower.includes("hero")) return "split";
  if (intentLower.includes("feature")) return "grid";
  if (intentLower.includes("service")) return "grid";
  if (intentLower.includes("pricing")) return "grid";
  if (intentLower.includes("testimonial")) return "grid";
  if (intentLower.includes("about")) return "split";
  if (intentLower.includes("team")) return "grid";
  if (intentLower.includes("stat")) return "grid";
  if (intentLower.includes("gallery")) return "grid";
  if (intentLower.includes("faq")) return "single";
  if (intentLower.includes("cta")) return "single";
  if (intentLower.includes("contact")) return "split";

  return "single";
}

/**
 * Get background variant from section intent (helper for backwards compatibility)
 */
export function inferBackgroundFromIntent(
  intent: string,
  index: number
): BackgroundVariant {
  const intentLower = intent.toLowerCase();

  if (intentLower.includes("hero")) return "gradient";
  if (intentLower.includes("cta")) return "gradient";
  if (intentLower.includes("stat")) return "dark";
  if (intentLower.includes("testimonial")) return "gradient-radial";

  // Alternate for variety
  const variants: BackgroundVariant[] = ["light", "muted", "light", "muted"];
  return variants[index % variants.length];
}

/**
 * Get visual style from section intent (helper for backwards compatibility)
 */
export function inferVisualFromIntent(intent: string): VisualIntent {
  const intentLower = intent.toLowerCase();

  if (intentLower.includes("feature")) return "card";
  if (intentLower.includes("service")) return "card";
  if (intentLower.includes("pricing")) return "card";
  if (intentLower.includes("testimonial")) return "card";

  return "plain";
}
