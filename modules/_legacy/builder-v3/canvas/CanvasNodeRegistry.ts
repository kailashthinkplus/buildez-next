// -------------------------------------------------------------
// CanvasNodeRegistry.ts (V3 FINAL)
// -------------------------------------------------------------
// Purpose:
// Map NodeType → Wrapper Component
// Nothing else.
// -------------------------------------------------------------

import { NodeType } from "@/modules/builder/blueprint/types";

import {
  SectionWrapper,
  BlockWrapper,
} from "./wrappers";

type RegistryMap = {
  [K in NodeType]?: any;
};

export const CanvasNodeRegistry: RegistryMap = {
  page: SectionWrapper,

  // Sections
  section_hero: SectionWrapper,
  section_features: SectionWrapper,
  section_faq: SectionWrapper,
  section_cta: SectionWrapper,
  section_gallery: SectionWrapper,
  section_team: SectionWrapper,
  section_stats: SectionWrapper,
  section_pricing: SectionWrapper,
  section_footer: SectionWrapper,
  section_testimonials: SectionWrapper,

  // Blocks
  heading: BlockWrapper,
  text: BlockWrapper,
  list: BlockWrapper,
  image: BlockWrapper,
  button: BlockWrapper,
  icon: BlockWrapper,
  divider: BlockWrapper,
  primitive_text: BlockWrapper,
  primitive_image: BlockWrapper,
  spacer: BlockWrapper,
  video: BlockWrapper,
  grid: BlockWrapper,
  container: BlockWrapper,
};
