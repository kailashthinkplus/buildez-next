// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/layoutCompiler.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { createId } from "@/modules/builder/utils/createId";
import type {
  LayoutIntent,
  VisualIntent,
  BackgroundVariant,
  SectionIntent,
} from "../types";

/* ============================================================
   LAYOUT COMPILER — V7 (DYNAMIC, INDUSTRY-SPECIFIC)
   
   Philosophy:
   - Detects business type/industry from section names
   - Applies industry-specific layout patterns
   - Creates visual variety (not same 2-col, 3-col everywhere)
   - Adapts background patterns per industry
   - NO BORING REPETITION
============================================================ */

/* ============================================================
   INDUSTRY DETECTION
============================================================ */

type IndustryType = 
  | "real-estate"
  | "saas"
  | "restaurant"
  | "healthcare"
  | "consulting"
  | "ecommerce"
  | "finance"
  | "education"
  | "creative"
  | "fitness"
  | "luxury"
  | "generic";

function detectIndustry(sectionNames: string[]): IndustryType {
  const allText = sectionNames.join(" ").toLowerCase();
  
  // Real estate
  if (
    allText.includes("property") ||
    allText.includes("project") ||
    allText.includes("apartment") ||
    allText.includes("villa") ||
    allText.includes("construction") ||
    allText.includes("builder")
  ) return "real-estate";
  
  // SaaS/Tech
  if (
    allText.includes("feature") ||
    allText.includes("integration") ||
    allText.includes("dashboard") ||
    allText.includes("platform") ||
    allText.includes("api")
  ) return "saas";
  
  // Restaurant/Food
  if (
    allText.includes("menu") ||
    allText.includes("dish") ||
    allText.includes("chef") ||
    allText.includes("restaurant") ||
    allText.includes("cuisine")
  ) return "restaurant";
  
  // Healthcare
  if (
    allText.includes("doctor") ||
    allText.includes("patient") ||
    allText.includes("treatment") ||
    allText.includes("clinic") ||
    allText.includes("medical")
  ) return "healthcare";
  
  // Consulting/B2B
  if (
    allText.includes("consulting") ||
    allText.includes("strategy") ||
    allText.includes("advisory") ||
    allText.includes("solution")
  ) return "consulting";
  
  // E-commerce
  if (
    allText.includes("product") ||
    allText.includes("shop") ||
    allText.includes("cart") ||
    allText.includes("store")
  ) return "ecommerce";
  
  // Finance
  if (
    allText.includes("finance") ||
    allText.includes("investment") ||
    allText.includes("banking") ||
    allText.includes("loan")
  ) return "finance";
  
  // Education
  if (
    allText.includes("course") ||
    allText.includes("student") ||
    allText.includes("learning") ||
    allText.includes("education")
  ) return "education";
  
  // Creative/Agency
  if (
    allText.includes("portfolio") ||
    allText.includes("design") ||
    allText.includes("creative") ||
    allText.includes("agency")
  ) return "creative";
  
  // Fitness
  if (
    allText.includes("fitness") ||
    allText.includes("gym") ||
    allText.includes("workout") ||
    allText.includes("training")
  ) return "fitness";
  
  // Luxury
  if (
    allText.includes("luxury") ||
    allText.includes("premium") ||
    allText.includes("exclusive") ||
    allText.includes("elite")
  ) return "luxury";
  
  return "generic";
}

/* ============================================================
   LAYOUT PATTERN DEFINITIONS
============================================================ */

interface LayoutPattern {
  columns: number;
  layout: "single" | "columns" | "grid" | "asymmetric";
  ratios?: number[];
  backgroundVariant: BackgroundVariant;
  visual: VisualIntent;
}

/* ============================================================
   INDUSTRY-SPECIFIC LAYOUT RULES
============================================================ */

const INDUSTRY_LAYOUTS: Record<IndustryType, {
  hero: LayoutPattern;
  secondary: LayoutPattern[];
  content: LayoutPattern[];
  cta: LayoutPattern;
}> = {
  "real-estate": {
    hero: {
      columns: 1,
      layout: "single",
      backgroundVariant: "transparent", // ✅ Image background
      visual: "plain",
    },
    secondary: [
      { // Stats
        columns: 4,
        layout: "grid",
        backgroundVariant: "dark",
        visual: "plain",
      },
      { // Projects/Properties
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
    ],
    content: [
      { // About (2-column)
        columns: 2,
        layout: "columns",
        ratios: [45, 55],
        backgroundVariant: "muted",
        visual: "plain",
      },
      { // Amenities/Features (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Testimonials (2-column wider)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "saas": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [55, 45],
      backgroundVariant: "gradient",
      visual: "plain",
    },
    secondary: [
      { // Features
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Integrations
        columns: 6,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "plain",
      },
    ],
    content: [
      { // How it works (3-step)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Pricing
        columns: 3,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
      { // Testimonials (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
  
  "restaurant": {
    hero: {
      columns: 1,
      layout: "single",
      backgroundVariant: "transparent",
      visual: "plain",
    },
    secondary: [
      { // About/Story (2-column)
        columns: 2,
        layout: "columns",
        ratios: [50, 50],
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Menu highlights (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    content: [
      { // Gallery (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Testimonials (1-column centered)
        columns: 1,
        layout: "single",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "healthcare": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [60, 40],
      backgroundVariant: "light",
      visual: "plain",
    },
    secondary: [
      { // Services (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
      { // About (2-column)
        columns: 2,
        layout: "columns",
        ratios: [50, 50],
        backgroundVariant: "light",
        visual: "plain",
      },
    ],
    content: [
      { // Testimonials (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
      { // FAQ (1-column)
        columns: 1,
        layout: "single",
        backgroundVariant: "light",
        visual: "plain",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
  
  "consulting": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [55, 45],
      backgroundVariant: "muted",
      visual: "plain",
    },
    secondary: [
      { // Services (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Case studies (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    content: [
      { // Process (4-step)
        columns: 4,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Team (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "ecommerce": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [50, 50],
      backgroundVariant: "light",
      visual: "plain",
    },
    secondary: [
      { // Featured products (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
      { // Categories (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
    ],
    content: [
      { // Benefits (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "plain",
      },
      { // Testimonials (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
  
  "finance": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [55, 45],
      backgroundVariant: "dark",
      visual: "plain",
    },
    secondary: [
      { // Services (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Stats (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "plain",
      },
    ],
    content: [
      { // Benefits (2-column)
        columns: 2,
        layout: "columns",
        ratios: [50, 50],
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Testimonials (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "education": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [60, 40],
      backgroundVariant: "gradient",
      visual: "plain",
    },
    secondary: [
      { // Courses (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Benefits (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "plain",
      },
    ],
    content: [
      { // Instructors (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Testimonials (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
  
  "creative": {
    hero: {
      columns: 1,
      layout: "single",
      backgroundVariant: "transparent",
      visual: "plain",
    },
    secondary: [
      { // Portfolio (3-column masonry)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Services (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    content: [
      { // Process (4-step)
        columns: 4,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Testimonials (1-column centered)
        columns: 1,
        layout: "single",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "fitness": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [50, 50],
      backgroundVariant: "dark",
      visual: "plain",
    },
    secondary: [
      { // Programs (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Trainers (4-column)
        columns: 4,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    content: [
      { // Benefits (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Testimonials (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
  
  "luxury": {
    hero: {
      columns: 1,
      layout: "single",
      backgroundVariant: "transparent",
      visual: "plain",
    },
    secondary: [
      { // About (2-column asymmetric)
        columns: 2,
        layout: "columns",
        ratios: [40, 60],
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Products (3-column)
        columns: 3,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    content: [
      { // Features (2-column)
        columns: 2,
        layout: "grid",
        backgroundVariant: "light",
        visual: "plain",
      },
      { // Testimonials (1-column)
        columns: 1,
        layout: "single",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "dark",
      visual: "plain",
    },
  },
  
  "generic": {
    hero: {
      columns: 2,
      layout: "columns",
      ratios: [55, 45],
      backgroundVariant: "gradient",
      visual: "plain",
    },
    secondary: [
      { // Features
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // About
        columns: 2,
        layout: "columns",
        ratios: [50, 50],
        backgroundVariant: "muted",
        visual: "plain",
      },
    ],
    content: [
      { // Services
        columns: 3,
        layout: "grid",
        backgroundVariant: "light",
        visual: "card",
      },
      { // Testimonials
        columns: 3,
        layout: "grid",
        backgroundVariant: "muted",
        visual: "card",
      },
    ],
    cta: {
      columns: 1,
      layout: "single",
      backgroundVariant: "gradient",
      visual: "plain",
    },
  },
};

/* ============================================================
   DYNAMIC LAYOUT SELECTION
============================================================ */

function selectLayoutForSection(
  industry: IndustryType,
  sectionIndex: number,
  totalSections: number,
  sectionName: string
): LayoutPattern {
  const industryLayouts = INDUSTRY_LAYOUTS[industry];
  const lowerName = sectionName.toLowerCase();
  
  // First section → Hero
  if (sectionIndex === 0) {
    return industryLayouts.hero;
  }
  
  // Last section → CTA
  if (sectionIndex === totalSections - 1) {
    return industryLayouts.cta;
  }
  
  // Keyword-based selection
  if (lowerName.includes("stat") || lowerName.includes("number") || lowerName.includes("metric")) {
    return {
      columns: 4,
      layout: "grid",
      backgroundVariant: "dark",
      visual: "plain",
    };
  }
  
  if (lowerName.includes("testimonial") || lowerName.includes("review")) {
    return industryLayouts.content[industryLayouts.content.length - 1]; // Last content pattern
  }
  
  if (lowerName.includes("pricing") || lowerName.includes("plan")) {
    return {
      columns: 3,
      layout: "grid",
      backgroundVariant: "light",
      visual: "card",
    };
  }
  
  if (lowerName.includes("faq") || lowerName.includes("question")) {
    return {
      columns: 1,
      layout: "single",
      backgroundVariant: "light",
      visual: "plain",
    };
  }
  
  if (lowerName.includes("contact")) {
    return {
      columns: 2,
      layout: "columns",
      ratios: [50, 50],
      backgroundVariant: "muted",
      visual: "plain",
    };
  }
  
  // Alternate between secondary and content patterns
  const isSecondary = sectionIndex === 1 || sectionIndex === 2;
  if (isSecondary) {
    const patternIndex = (sectionIndex - 1) % industryLayouts.secondary.length;
    return industryLayouts.secondary[patternIndex];
  }
  
  // Use content patterns for middle sections
  const contentIndex = (sectionIndex - 3) % industryLayouts.content.length;
  return industryLayouts.content[Math.max(0, contentIndex)];
}

/* ============================================================
   LAYOUT COMPILER (MAIN EXPORT)
============================================================ */

export function compileLayout(sectionNames: string[]): BlueprintNode[] {
  const total = sectionNames.length;
  const industry = detectIndustry(sectionNames);

  console.log(`[LayoutCompiler] Compiling ${total} sections for industry: ${industry}`);

  return sectionNames.map((name, index) => {
    // Select dynamic layout based on industry and position
    const layoutPattern = selectLayoutForSection(industry, index, total, name);

    console.log(`[LayoutCompiler] Section ${index}: ${name}`, {
      industry,
      columns: layoutPattern.columns,
      layout: layoutPattern.layout,
      backgroundVariant: layoutPattern.backgroundVariant,
      visual: layoutPattern.visual,
    });

    // Build columns
    const columns: BlueprintNode[] = Array.from({
      length: layoutPattern.columns,
    }).map((_, colIndex) => {
      const props: Record<string, any> = {
        index: colIndex,
      };

      // Add width ratio for column layouts
      if (layoutPattern.ratios && layoutPattern.layout === "columns") {
        props.width = `${layoutPattern.ratios[colIndex]}%`;
      }

      return {
        id: createId("column"),
        type: "column",
        props,
        children: [],
      };
    });

    // Build section node
    return {
      id: createId("section"),
      type: "section",
      props: {
        sectionName: name,
        sectionIndex: index,
        intent: name.toLowerCase().split(" ")[0],
        backgroundVariant: layoutPattern.backgroundVariant,
        layout: layoutPattern.layout,
        columns: layoutPattern.columns,
      },
      children: [
        {
          id: createId("container"),
          type: "container",
          props: {
            layout: layoutPattern.layout,
            visual: layoutPattern.visual,
            columns: layoutPattern.columns,
          },
          children: columns,
        },
      ],
    };
  });
}

/* ============================================================
   COMPILE SINGLE SECTION
============================================================ */

export function compileSingleSection(
  name: string,
  index: number = 0
): BlueprintNode {
  const [section] = compileLayout([name]);
  
  if (section.props) {
    section.props.sectionIndex = index;
  }
  
  return section;
}

/* ============================================================
   UTILITY EXPORTS
============================================================ */

export function getRecommendedColumns(sectionType: string): number {
  // Default fallback
  return 3;
}
