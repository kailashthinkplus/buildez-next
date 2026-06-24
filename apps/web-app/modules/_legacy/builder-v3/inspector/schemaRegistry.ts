// -------------------------------------------------------------
// schemaRegistry.ts (V3 Inspector Registry)
// /modules/builder/inspector/schemaRegistry.ts
//
// Maps NodeType → InspectorSchema
// All schemas must follow the new V3 schemaTypes.ts system.
// 100% declarative, no UI code here.
// -------------------------------------------------------------

import { NodeType } from "@/modules/builder/blueprint/types";
import { InspectorSchema } from "./schemaTypes";

// -------------------------------------------------------------
// IMPORT ALL SCHEMAS
// -------------------------------------------------------------

// Sections
import SectionHeroSchema from "./schemas/SectionHero.schema";
import SectionFeaturesSchema from "./schemas/SectionFeatures.schema";
import SectionGallerySchema from "./schemas/SectionGallery.schema";
import SectionTestimonialsSchema from "./schemas/SectionTestimonials.schema";
import SectionStatsSchema from "./schemas/SectionStats.schema";
import SectionCTASchema from "./schemas/SectionCTA.schema";
import SectionPricingSchema from "./schemas/SectionPricing.schema";
import SectionFAQSchema from "./schemas/SectionFAQ.schema";
import SectionTeamSchema from "./schemas/SectionTeam.schema";
import SectionFooterSchema from "./schemas/SectionFooter.schema";

// Blocks
import HeadingSchema from "./schemas/Heading.schema";
import ParagraphSchema from "./schemas/Paragraph.schema";
import ButtonSchema from "./schemas/Button.schema";
import TextSchema from "./schemas/Text.schema";
import ListSchema from "./schemas/List.schema";
import IconSchema from "./schemas/Icon.schema";
import ImageSchema from "./schemas/Image.schema";
import VideoSchema from "./schemas/Video.schema";
import GridSchema from "./schemas/Grid.schema";
import ContainerSchema from "./schemas/Container.schema";
import SpacerSchema from "./schemas/Spacer.schema";
import DividerSchema from "./schemas/Divider.schema";
import PrimitiveTextSchema from "./schemas/PrimitiveText.schema";
import PrimitiveImageSchema from "./schemas/PrimitiveImage.schema";

// Page
import PageSchema from "./schemas/Page.schema";

// -------------------------------------------------------------
// REGISTRY: NodeType → InspectorSchema
// -------------------------------------------------------------

export const schemaRegistry: Record<NodeType, InspectorSchema | null> = {
  // ---------------------------
  // PAGE
  // ---------------------------
  [NodeType.Page]: PageSchema,

  // ---------------------------
  // SECTIONS
  // ---------------------------
  [NodeType.SectionHero]: SectionHeroSchema,
  [NodeType.SectionFeatures]: SectionFeaturesSchema,
  [NodeType.SectionGallery]: SectionGallerySchema,
  [NodeType.SectionTestimonials]: SectionTestimonialsSchema,
  [NodeType.SectionStats]: SectionStatsSchema,
  [NodeType.SectionCTA]: SectionCTASchema,
  [NodeType.SectionPricing]: SectionPricingSchema,
  [NodeType.SectionFAQ]: SectionFAQSchema,
  [NodeType.SectionTeam]: SectionTeamSchema,
  [NodeType.SectionFooter]: SectionFooterSchema,

  // ---------------------------
  // BLOCKS
  // ---------------------------
  [NodeType.Heading]: HeadingSchema,
  [NodeType.Paragraph]: ParagraphSchema,
  [NodeType.Button]: ButtonSchema,
  [NodeType.Text]: TextSchema,
  [NodeType.List]: ListSchema,
  [NodeType.Icon]: IconSchema,
  [NodeType.Image]: ImageSchema,
  [NodeType.Video]: VideoSchema,
  [NodeType.Spacer]: SpacerSchema,
  [NodeType.Divider]: DividerSchema,

  // ---------------------------
  // LAYOUT BLOCKS
  // ---------------------------
  [NodeType.Grid]: GridSchema,
  [NodeType.Container]: ContainerSchema,

  // ---------------------------
  // PRIMITIVES
  // ---------------------------
  [NodeType.PrimitiveText]: PrimitiveTextSchema,
  [NodeType.PrimitiveImage]: PrimitiveImageSchema,
};
