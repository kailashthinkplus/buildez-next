// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/types.ts

/* ============================================================
   INTENTS — V7 (AUTHORITATIVE)
============================================================ */

export type AIV7Intent =
  | "generate_page"
  | "edit_page"
  | "rewrite_content"
  | "regenerate_images"
  | "restyle_page"
  | "add_section";

/* ============================================================
   AI STAGES — V7 PIPELINE
   Used for observability, retries, guardrails
============================================================ */

export type AIV7Stage =
  | "section_plan"
  | "layout"
  | "chrome"
  | "materialize"
  | "content"
  | "images"
  | "design"
  | "sanitize"
  | "normalize";

/* ============================================================
   DESIGN TOKENS — V7 (AUTHORITATIVE)
   Used throughout the system for consistent styling
============================================================ */

export interface DesignTokens {
  colors?: {
    primary?: string;
    primaryHover?: string;
    onPrimary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    border?: string;
    muted?: string;
    [key: string]: string | undefined;
  };

  typography?: {
    fontFamily?: string;
    heading?: {
      fontFamily?: string;
      fontWeight?: number;
      letterSpacing?: string;
    };
    body?: {
      fontWeight?: number;
      lineHeight?: number;
    };
    h1?: {
      fontSize?: number;
      fontWeight?: number;
      lineHeight?: number;
    };
    h2?: {
      fontSize?: number;
      fontWeight?: number;
      lineHeight?: number;
    };
  };

  spacing?: {
    sectionY?: number;
    sectionPadding?: number;
    containerX?: number;
    containerGap?: number;
    blockGap?: number;
    radius?: number;
    [key: string]: number | undefined;
  };

  buttons?: {
    radius?: number;
    paddingY?: number;
    paddingX?: number;
  };

  radius?: {
    sm?: number;
    md?: number;
    lg?: number;
    [key: string]: number | undefined;
  };

  shadows?: {
    card?: string;
    elevated?: string;
    [key: string]: string | undefined;
  };
}

/* ============================================================
   BRAND CONTEXT — V7 (CRITICAL)
   Injected BEFORE any AI call
============================================================ */

export interface AIV7BrandContext {
  /** Public logo URL (R2 / CDN) */
  logoUrl?: string | null;

  /** Extracted brand colors from logo */
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    [key: string]: string | undefined;
  };

  /** Full design tokens derived from logo or user input */
  designTokens?: DesignTokens | null;
}

/* ============================================================
   USER REFINEMENTS — V7
   Soft constraints, NEVER hard rules
============================================================ */

export interface AIV7Refinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
  density?: "minimal" | "balanced" | "detailed";
  cta?: "soft" | "standard" | "aggressive";
  visualWeight?: "light" | "medium" | "heavy";
}

/* ============================================================
   COMPILER INPUT — V7 (AUTHORITATIVE)
============================================================ */

export interface CompileInput {
  /** What the user is trying to do */
  intent: AIV7Intent;

  /** Which pipeline stage is running */
  stage: AIV7Stage;

  /** User's natural language request */
  userMessage: string;

  /** Optional brand context (logo + palette + tokens) */
  brandContext?: AIV7BrandContext;

  /** Optional refinement controls */
  refinements?: AIV7Refinements;

  /** Optional attachment summary */
  attachmentSummary?: string;
}

/* ============================================================
   SECTION PLANNING — V7
============================================================ */

export type SectionIntent =
  | "hero"
  | "features"
  | "services"
  | "pricing"
  | "testimonials"
  | "gallery"
  | "cta"
  | "about"
  | "contact"
  | "faq"
  | "team"
  | "stats"
  | "logos"
  | "footer"
  | "custom";

export type LayoutIntent =
  | "single"
  | "split"
  | "split-reverse"
  | "grid"
  | "columns"
  | "stacked"
  | "masonry";

export type VisualIntent =
  | "plain"
  | "gradient"
  | "card"
  | "glass"
  | "dark"
  | "light"
  | "image-bg"
  | "pattern";

export type BackgroundVariant =
  | "solid"
  | "gradient"
  | "gradient-radial"
  | "muted"
  | "dark"
  | "light"
  | "transparent";

export type ContentIntent =
  | "heading"
  | "subheading"
  | "text"
  | "primaryCTA"
  | "secondaryCTA"
  | "image"
  | "icon"
  | "featureList"
  | "pricingCards"
  | "testimonialCards"
  | "statNumbers"
  | "logoGrid";

export interface SemanticSection {
  id: string;
  intent: SectionIntent;
  layout: LayoutIntent;
  visual: VisualIntent;
  backgroundVariant?: BackgroundVariant;
  content: ContentIntent[];
}

export interface SemanticPlan {
  sections: SemanticSection[];
}

/* ============================================================
   COMPILED PAYLOAD — LLM SAFE
============================================================ */

export interface CompiledAIPayload {
  provider: "openai" | "anthropic";
  model: string;
  payload: {
    system: string;
    user: string;
    max_output_tokens: number;
  };
  estimatedTokens: number;
}

/* ============================================================
   BLUEPRINT NODE PROPS — V7
   Extended props for blueprint nodes
============================================================ */

export interface BlueprintNodeProps {
  // Layout
  className?: string;
  style?: React.CSSProperties;
  
  // Content
  text?: string;
  label?: string;
  src?: string;
  alt?: string;
  href?: string;
  
  // Styling
  backgroundVariant?: BackgroundVariant;
  variant?: string;
  
  // Design tokens (page-level)
  designTokens?: DesignTokens;
  
  // Any additional props
  [key: string]: unknown;
}