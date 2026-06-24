// -------------------------------------------------------------
// BuildEZ Ultra Minimal Presets — Option A+
// Purpose: Engine Testing + Editor Usability (Inspector-Driven)
// -------------------------------------------------------------

import {
  NodeType,
  BlueprintPreset,
  HeadingBlockNode,
  ParagraphBlockNode,
  ButtonBlockNode,
  ImageBlockNode,
  IconBlockNode,
  TextBlockNode,
  ListBlockNode,
  SpacerBlockNode,
  DividerBlockNode,
  VideoBlockNode,
  ContainerBlockNode,
  GridBlockNode,
  PrimitiveTextBlockNode,
  PrimitiveImageBlockNode,
  HeroSectionNode,
  FeaturesSectionNode,
  GallerySectionNode,
  TestimonialsSectionNode,
  StatsSectionNode,
  CTASectionNode,
  PricingSectionNode,
  FAQSectionNode,
  TeamSectionNode,
  FooterSectionNode,
} from "@/modules/builder/blueprint/types";

/* -------------------------------------------------------------
   CANONICAL MINIMUMS (INSPECTOR-CONTROLLABLE)
------------------------------------------------------------- */
const spacingZero = { top: 0, right: 0, bottom: 0, left: 0 };

const MIN_SECTION_PADDING = 16;
const MIN_SECTION_GAP = 16;
const MIN_CONTAINER_GAP = 8;
const MIN_SPACER_HEIGHT = 16;

/* -------------------------------------------------------------
   BLOCK PRESETS — SPACING NEUTRAL
------------------------------------------------------------- */

export const HeadingPreset: BlueprintPreset<HeadingBlockNode> = {
  type: NodeType.Heading,
  create: () => ({
    id: "",
    type: NodeType.Heading,
    props: {
      content: { text: "Heading" },
      layout: {},
      spacing: { padding: spacingZero, margin: spacingZero },
      style: { textColor: "#000000" },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const ParagraphPreset: BlueprintPreset<ParagraphBlockNode> = {
  type: NodeType.Paragraph,
  create: () => ({
    id: "",
    type: NodeType.Paragraph,
    props: {
      content: { text: "Paragraph" },
      layout: {},
      spacing: { padding: spacingZero, margin: spacingZero },
      style: { textColor: "#000000" },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const ButtonPreset: BlueprintPreset<ButtonBlockNode> = {
  type: NodeType.Button,
  create: () => ({
    id: "",
    type: NodeType.Button,
    props: {
      content: { label: "Button", href: "#" },
      layout: {},
      spacing: { padding: spacingZero, margin: spacingZero },
      style: { backgroundColor: "#DDDDDD", textColor: "#000000" },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const ImagePreset: BlueprintPreset<ImageBlockNode> = {
  type: NodeType.Image,
  create: () => ({
    id: "",
    type: NodeType.Image,
    props: {
      content: {
        src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
        alt: "image",
      },
      layout: { width: "100%", height: "auto", objectFit: "contain" },
      spacing: { padding: spacingZero, margin: spacingZero },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const IconPreset: BlueprintPreset<IconBlockNode> = {
  type: NodeType.Icon,
  create: () => ({
    id: "",
    type: NodeType.Icon,
    props: {
      content: { icon: "•" },
      style: { size: 16, textColor: "#000000" },
      spacing: { padding: spacingZero, margin: spacingZero },
      layout: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const TextPreset: BlueprintPreset<TextBlockNode> = {
  type: NodeType.Text,
  create: () => ({
    id: "",
    type: NodeType.Text,
    props: {
      content: { text: "Text" },
      style: { textColor: "#000000" },
      layout: {},
      spacing: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const ListPreset: BlueprintPreset<ListBlockNode> = {
  type: NodeType.List,
  create: () => ({
    id: "",
    type: NodeType.List,
    props: {
      content: { list: ["Item"] },
      style: { itemSpacing: 0 },
      spacing: { padding: spacingZero, margin: spacingZero },
      layout: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const SpacerPreset: BlueprintPreset<SpacerBlockNode> = {
  type: NodeType.Spacer,
  create: () => ({
    id: "",
    type: NodeType.Spacer,
    props: {
      layout: { height: MIN_SPACER_HEIGHT },
      spacing: {},
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const DividerPreset: BlueprintPreset<DividerBlockNode> = {
  type: NodeType.Divider,
  create: () => ({
    id: "",
    type: NodeType.Divider,
    props: {
      style: { thickness: 1, color: "#CCCCCC" },
      layout: {},
      spacing: { padding: spacingZero, margin: spacingZero },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const VideoPreset: BlueprintPreset<VideoBlockNode> = {
  type: NodeType.Video,
  create: () => ({
    id: "",
    type: NodeType.Video,
    props: {
      content: { src: "", autoplay: false, controls: true },
      layout: { width: "100%", height: "auto" },
      spacing: {},
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const ContainerPreset: BlueprintPreset<ContainerBlockNode> = {
  type: NodeType.Container,
  create: () => ({
    id: "",
    type: NodeType.Container,
    props: {
      layout: {
        display: "flex",
        direction: "column",
        gap: MIN_CONTAINER_GAP,
      },
      spacing: { padding: spacingZero, margin: spacingZero },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const GridPreset: BlueprintPreset<GridBlockNode> = {
  type: NodeType.Grid,
  create: () => ({
    id: "",
    type: NodeType.Grid,
    props: {
      layout: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: MIN_CONTAINER_GAP,
      },
      spacing: { padding: spacingZero, margin: spacingZero },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const PrimitiveTextPreset: BlueprintPreset<PrimitiveTextBlockNode> = {
  type: NodeType.PrimitiveText,
  create: () => ({
    id: "",
    type: NodeType.PrimitiveText,
    props: {
      content: { text: "Text" },
      style: { textColor: "#000000" },
      layout: {},
      spacing: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

export const PrimitiveImagePreset: BlueprintPreset<PrimitiveImageBlockNode> = {
  type: NodeType.PrimitiveImage,
  create: () => ({
    id: "",
    type: NodeType.PrimitiveImage,
    props: {
      content: {
        src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
        alt: "",
      },
      layout: { width: "100%", height: "auto" },
      style: {},
      spacing: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* -------------------------------------------------------------
   SECTION PRESETS — MINIMAL + USABLE
------------------------------------------------------------- */

function minimalSection(id: string, type: NodeType): any {
  return {
    id: "",
    type,
    props: {
      containerWidth: "full",
      spacing: {
        padding: {
          top: MIN_SECTION_PADDING,
          right: MIN_SECTION_PADDING,
          bottom: MIN_SECTION_PADDING,
          left: MIN_SECTION_PADDING,
        },
        margin: spacingZero,
      },
      layout: {
        display: "flex",
        direction: "column",
        gap: MIN_SECTION_GAP,
      },
      style: { backgroundColor: "#FFFFFF" },
      effects: {},
      responsive: {},
    },
    children: [
      {
        ...HeadingPreset.create(),
        id: `${id}-heading`,
        props: {
          ...HeadingPreset.create().props,
          content: { text: type },
        },
      },
    ],
  };
}

export const HeroSectionPreset: BlueprintPreset<HeroSectionNode> = {
  type: NodeType.SectionHero,
  create: () => minimalSection("hero", NodeType.SectionHero),
};

export const FeaturesSectionPreset: BlueprintPreset<FeaturesSectionNode> = {
  type: NodeType.SectionFeatures,
  create: () => minimalSection("features", NodeType.SectionFeatures),
};

export const GallerySectionPreset: BlueprintPreset<GallerySectionNode> = {
  type: NodeType.SectionGallery,
  create: () => minimalSection("gallery", NodeType.SectionGallery),
};

export const TestimonialsSectionPreset: BlueprintPreset<TestimonialsSectionNode> =
{
  type: NodeType.SectionTestimonials,
  create: () => minimalSection("testimonials", NodeType.SectionTestimonials),
};

export const StatsSectionPreset: BlueprintPreset<StatsSectionNode> = {
  type: NodeType.SectionStats,
  create: () => minimalSection("stats", NodeType.SectionStats),
};

export const CTASectionPreset: BlueprintPreset<CTASectionNode> = {
  type: NodeType.SectionCTA,
  create: () => minimalSection("cta", NodeType.SectionCTA),
};

export const PricingSectionPreset: BlueprintPreset<PricingSectionNode> = {
  type: NodeType.SectionPricing,
  create: () => minimalSection("pricing", NodeType.SectionPricing),
};

export const FAQSectionPreset: BlueprintPreset<FAQSectionNode> = {
  type: NodeType.SectionFAQ,
  create: () => minimalSection("faq", NodeType.SectionFAQ),
};

export const TeamSectionPreset: BlueprintPreset<TeamSectionNode> = {
  type: NodeType.SectionTeam,
  create: () => minimalSection("team", NodeType.SectionTeam),
};

export const FooterSectionPreset: BlueprintPreset<FooterSectionNode> = {
  type: NodeType.SectionFooter,
  create: () => minimalSection("footer", NodeType.SectionFooter),
};
