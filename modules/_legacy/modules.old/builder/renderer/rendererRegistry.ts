// -------------------------------------------------------------
// V3 BUILDER — RENDERER REGISTRY
// -------------------------------------------------------------
// All renderers MUST be imported as named exports.
// No default exports anywhere.
// Casing must EXACTLY match filenames.
// -------------------------------------------------------------

import { Renderer } from "./rendererTypes";

// SECTION / BLOCK RENDERERS (V1 → carried into V3)
import { HeroRenderer } from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/renderers/HeroRenderer";
import { FeaturesRenderer } from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/renderers/FeaturesRenderer";
import { TestimonialsRenderer } from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/renderers/TestimonialsRenderer";

// IMPORTANT FIX — choose ONE spell-correct casing:
import { FAQRenderer } from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/renderers/FAQRenderer";
// ❗ REMOVE / DO NOT IMPORT FaqRenderer — wrong casing
// import { FaqRenderer } from ".../FaqRenderer";   ← DELETE THIS

// SECTION WRAPPER RENDERER (V1)
import { SectionRenderer } from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/renderers/SectionRenderer";

// LAYOUT RENDERERS (from modules/builder/renderer/layout)
import { FlexLayout, GridLayout, FreeformLayout } from "./layout";

// -------------------------------------------------------------
// REGISTRY MAP
// -------------------------------------------------------------
export const rendererRegistry: Record<string, Renderer> = {
  hero: HeroRenderer,
  features: FeaturesRenderer,
  testimonials: TestimonialsRenderer,

  // FIXED: Only one valid FAQ renderer
  faq: FAQRenderer,

  section: SectionRenderer,

  // Layouts
  layout_flex: FlexLayout,
  layout_grid: GridLayout,
  layout_freeform: FreeformLayout,
};
