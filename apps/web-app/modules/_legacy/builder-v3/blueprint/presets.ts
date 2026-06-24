/**
 * BuildEZ V3 — Canonical Unified Presets Entry Point
 */

import {
  ButtonPreset,
  ContainerPreset,
  DividerPreset,
  GridPreset,
  HeadingPreset,
  IconPreset,
  ImagePreset,
  ListPreset,
  ParagraphPreset,
  PrimitiveImagePreset,
  PrimitiveTextPreset,
  SpacerPreset,
  TextPreset,
  VideoPreset,
} from "@/modules/builder/blueprint/presets-blocks";

import {
  HeroSectionPreset,
  FeaturesSectionPreset,
  GallerySectionPreset,
  TestimonialsSectionPreset,
} from "@/modules/builder/blueprint/presets-sections";

import { FooterSectionPreset } from "@/modules/builder/blueprint/presets-footer";

/* ------------------------------
   GROUPED PRESET COLLECTIONS
------------------------------ */
export const BLOCK_PRESETS = {
  ButtonPreset,
  ContainerPreset,
  DividerPreset,
  GridPreset,
  HeadingPreset,
  IconPreset,
  ImagePreset,
  ListPreset,
  ParagraphPreset,
  PrimitiveImagePreset,
  PrimitiveTextPreset,
  SpacerPreset,
  TextPreset,
  VideoPreset,
};

export const SECTION_PRESETS = {
  HeroSectionPreset,
  FeaturesSectionPreset,
  GallerySectionPreset,
  TestimonialsSectionPreset,
};

export const FOOTER_PRESETS = {
  FooterSectionPreset,
};

/* ------------------------------
   UNIFIED V3 REGISTRY (required)
------------------------------ */
export const PRESETS = {
  blocks: BLOCK_PRESETS,
  sections: SECTION_PRESETS,
  footer: FOOTER_PRESETS,
};
