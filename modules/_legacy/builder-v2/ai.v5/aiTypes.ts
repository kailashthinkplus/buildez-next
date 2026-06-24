// /Users/kailash/buildez/apps/web-app/modules/builder/ai/aiTypes.ts

import { BlueprintNode } from "../renderer/PageRenderer";

/* ============================================================
   CORE AI ACTIONS (PATCH-BASED — DO NOT BREAK)
============================================================ */

export type AIAction =
  | {
      type: "update-node";
      nodeId: string;
      patch: Partial<BlueprintNode["props"]>;
    }
  | {
      type: "replace-node";
      nodeId: string;
      node: BlueprintNode;
    }
  | {
      type: "insert-child";
      parentId: string;
      node: BlueprintNode;
    }
  | {
      type: "delete-node";
      nodeId: string;
    };

export interface AIResponse {
  message: string;
  actions: AIAction[];
}

/* ============================================================
   STATIC WEBSITE CONSTRAINTS (CANONICAL)
   AI MUST NEVER BUILD APPS / DASHBOARDS
============================================================ */

export const WEBSITE_CATEGORIES = [
  "Business Website",
  "Landing Page",
  "Portfolio",
  "Agency Website",
  "Personal Website",
  "Brochure Website",
] as const;

export type WebsiteCategory =
  (typeof WEBSITE_CATEGORIES)[number];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Real Estate",
  "Education",
  "Finance",
  "Retail",
  "Hospitality",
  "Manufacturing",
  "Creative / Design",
  "Consulting",
  "Fitness & Wellness",
  "Legal",
  "Non-Profit",
  "Travel",
  "Food & Restaurant",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const VISUAL_STYLES = [
  "Minimal",
  "Modern",
  "Bold",
  "Luxury",
] as const;

export type VisualStyle =
  (typeof VISUAL_STYLES)[number];

export const IMAGE_STYLES = [
  "Real Photography",
  "Illustrations",
  "3D / Abstract",
  "Mixed",
] as const;

export type ImageStyle =
  (typeof IMAGE_STYLES)[number];

/* ============================================================
   AI DESIGN INTERVIEW (GUIDED PROMPTING)
============================================================ */

export type AIDesignPhase =
  | "discovery"
  | "confirm"
  | "compile"
  | "done";

export interface AIDesignAnswers {
  websiteCategory?: WebsiteCategory;
  industry?: Industry;

  visualStyle?: VisualStyle;
  imageStyle?: ImageStyle;

  pages?: string[]; // ["Home", "About", "Pricing", "Contact"]
}

export interface AIDesignState {
  phase: AIDesignPhase;
  answers: AIDesignAnswers;
  attachments: AIAttachment[];
}

/* ============================================================
   🔥 REFINEMENT PILLS (CONTENT-LEVEL ONLY)
   DOES NOT AFFECT LAYOUT RULES
============================================================ */

export interface AIRefinements {
  tone?: "professional" | "friendly" | "premium" | "bold";
  density?: "minimal" | "balanced" | "detailed";
  cta?: "soft" | "standard" | "aggressive";
}

/* ============================================================
   ATTACHMENTS (DESIGN CONTEXT ONLY — NO RAW FILES)
============================================================ */

export type AIAttachmentType =
  | "image"
  | "document"
  | "figma"
  | "other";

export interface AIAttachment {
  id: string;
  name: string;
  type: AIAttachmentType;

  /**
   * Optional extracted text (TXT / DOCX / brand docs)
   * This is summarized server-side before hitting AI
   */
  textContent?: string;

  /**
   * Optional link (Figma URL, reference link, etc.)
   */
  url?: string;
}

/* ============================================================
   AI EXECUTION CONTEXT (FRONTEND → BACKEND)
============================================================ */

export interface AIRunContext {
  /**
   * Final compiled design intent prompt
   */
  prompt: string;

  /**
   * Structured design answers from AI panel
   */
  design?: AIDesignAnswers;

  /**
   * Content-level refinements (pills)
   */
  refinements?: AIRefinements;

  /**
   * Attachments passed as metadata only
   */
  attachments?: AIAttachment[];

  /**
   * Explicit constraint to guarantee static sites
   */
  constraints?: {
    staticOnly: true;
    disallowApps: true;
    disallowDashboards: true;
  };
}

/* ============================================================
   FUTURE AI INTENTS (LOCKED BUT NOT WIRED YET)
============================================================ */

export type AIIntent =
  | "edit_page"        // patch-based (current)
  | "generate_page"    // section-based
  | "generate_site"    // multi-page
  | "rewrite_content"; // copy-only
