/* -------------------------------------------------------------
   BuildEZ Blueprint Registry (V3)
   ENV-Aware Preset Loader + Renderer Registry
   Zero Drift. Canonical Source of Truth.
------------------------------------------------------------- */

import { NodeType, BlueprintNode, BlueprintPreset } from "./types";

/* -------------------------------------------------------------
   ENV SWITCH: minimal vs full presets
------------------------------------------------------------- */
const useMinimal =
  typeof process !== "undefined" &&
  process.env?.BUILDEZ_MINIMAL_PRESETS === "1";

/* -------------------------------------------------------------
   Import Presets (Full + Minimal)
------------------------------------------------------------- */
import {
  BLOCK_PRESETS,
  SECTION_PRESETS,
  FOOTER_PRESETS,
} from "./presets";

import * as MinimalPresets from "./presets-minimal";

/* ✅ COLUMN PRESET */
import { ColumnPreset } from "./presets-column";

/* -------------------------------------------------------------
   Active Preset Source
------------------------------------------------------------- */
const PresetSource = useMinimal
  ? MinimalPresets
  : {
      ...BLOCK_PRESETS,
      ...SECTION_PRESETS,
      ...FOOTER_PRESETS,
    };

/* -------------------------------------------------------------
   PRESET REGISTRY (NodeType → Preset)
------------------------------------------------------------- */
export const PresetRegistry: Record<NodeType, BlueprintPreset<any>> = {
  /* ------------------ PAGE ------------------ */
  [NodeType.Page]: {
    type: NodeType.Page,
    create: () => ({
      id: "",
      type: NodeType.Page,
      props: {
        title: "Page",
        spacing: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
        layout: { display: "flex", direction: "column", gap: 0 },
        style: {},
        responsive: {},
        effects: {},
      },
      children: [],
    }),
  },

  /* ------------------ GENERIC SECTION ------------------ */
  [NodeType.Section]: {
    type: NodeType.Section,
    create: () => ({
      id: "",
      type: NodeType.Section,
      props: {
        spacing: {
          padding: { top: 32, right: 0, bottom: 32, left: 0 },
        },
        layout: {
          display: "flex",
          direction: "column",
          gap: 16,
        },
        style: { backgroundColor: "transparent" },
        responsive: {},
        effects: {},
      },
      children: [],
    }),
  },

  /* ------------------ PRESET SECTIONS ------------------ */
  [NodeType.SectionHero]: PresetSource.HeroSectionPreset,
  [NodeType.SectionFeatures]: PresetSource.FeaturesSectionPreset,
  [NodeType.SectionGallery]: PresetSource.GallerySectionPreset,
  [NodeType.SectionTestimonials]: PresetSource.TestimonialsSectionPreset,
  [NodeType.SectionStats]: PresetSource.StatsSectionPreset,
  [NodeType.SectionCTA]: PresetSource.CTASectionPreset,
  [NodeType.SectionPricing]: PresetSource.PricingSectionPreset,
  [NodeType.SectionFAQ]: PresetSource.FAQSectionPreset,
  [NodeType.SectionTeam]: PresetSource.TeamSectionPreset,
  [NodeType.SectionFooter]: PresetSource.FooterSectionPreset,

  /* ------------------ BLOCKS ------------------ */
  [NodeType.Heading]: PresetSource.HeadingPreset,
  [NodeType.Paragraph]: PresetSource.ParagraphPreset,
  [NodeType.Button]: PresetSource.ButtonPreset,
  [NodeType.Image]: PresetSource.ImagePreset,
  [NodeType.Icon]: PresetSource.IconPreset,
  [NodeType.Text]: PresetSource.TextPreset,
  [NodeType.List]: PresetSource.ListPreset,
  [NodeType.Spacer]: PresetSource.SpacerPreset,
  [NodeType.Divider]: PresetSource.DividerPreset,
  [NodeType.Video]: PresetSource.VideoPreset,

  /* ------------------ LAYOUT ------------------ */
  [NodeType.Container]: PresetSource.ContainerPreset,
  [NodeType.Grid]: PresetSource.GridPreset,

  /* ✅ COLUMN (CRITICAL FIX) */
  [NodeType.Column]: ColumnPreset,

  /* ------------------ PRIMITIVES ------------------ */
  [NodeType.PrimitiveText]: PresetSource.PrimitiveTextPreset,
  [NodeType.PrimitiveImage]: PresetSource.PrimitiveImagePreset,
};

/* -------------------------------------------------------------
   NODE CREATION HELPER
------------------------------------------------------------- */
export function createNode<T extends BlueprintNode>(type: NodeType): T {
  const preset = PresetRegistry[type];
  if (!preset) {
    throw new Error(`❌ No preset found for NodeType: ${type}`);
  }
  return preset.create() as T;
}

/* -------------------------------------------------------------
   SAFE LOOKUPS
------------------------------------------------------------- */
export const getPreset = (t: NodeType) => PresetRegistry[t];

/* -------------------------------------------------------------
   END — registry.ts (V3 Stable)
------------------------------------------------------------- */
