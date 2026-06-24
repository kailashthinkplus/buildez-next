// -------------------------------------------------------------
// BuildEZ BLUEPRINT PRESETS — SECTIONS ONLY (V3 CANONICAL)
// File: /modules/builder/blueprint/presets-sections.ts
// -------------------------------------------------------------

import { nanoid } from "nanoid";

import {
  NodeType,
  HeroSectionNode,
  FeaturesSectionNode,
  GallerySectionNode,
  TestimonialsSectionNode,
  StatsSectionNode,
  PricingSectionNode,
  FAQSectionNode,
  TeamSectionNode,
  FooterSectionNode,
  BlueprintPreset,
} from "@/modules/builder/blueprint/types";

import {
  HeadingPreset,
  ParagraphPreset,
  ButtonPreset,
  ContainerPreset,
  ImagePreset,
  IconPreset,
} from "./presets-blocks";

/* -------------------------------------------------------------
   CANONICAL MINIMUM SPACING (INSPECTOR-CONTROLLABLE)
------------------------------------------------------------- */
const MIN_SECTION_PADDING = 24;
const MIN_SECTION_GAP = 24;

const spacingZero = { top: 0, right: 0, bottom: 0, left: 0 };

const baseSectionSpacing = {
  padding: {
    top: MIN_SECTION_PADDING,
    right: MIN_SECTION_PADDING,
    bottom: MIN_SECTION_PADDING,
    left: MIN_SECTION_PADDING,
  },
  margin: { ...spacingZero },
};

const baseSectionLayout = {
  display: "flex" as const,
  direction: "column" as const,
  gap: MIN_SECTION_GAP,
};

/* =============================================================
   🟣 HERO SECTION
============================================================= */
export const HeroSectionPreset: BlueprintPreset<HeroSectionNode> = {
  type: NodeType.SectionHero,
  create: () => {
    const heading = HeadingPreset.create();
    const paragraph = ParagraphPreset.create();
    const button = ButtonPreset.create();
    const buttons = ContainerPreset.create();
    const image = ImagePreset.create();

    heading.id = nanoid();
    heading.props.content.text = "Launch Stunning Websites with AI";
    heading.props.style.fontSize = 64;

    paragraph.id = nanoid();
    paragraph.props.content.text =
      "Design, build, and publish high-performance webpages in minutes.";
    paragraph.props.style.fontSize = 20;

    button.id = nanoid();
    button.props.content.label = "Get Started";

    buttons.id = nanoid();
    buttons.props.layout = {
      display: "flex",
      direction: "row",
      align: "center",
      justify: "center",
      gap: 16,
    };
    buttons.children = [button];

    image.id = nanoid();
    image.props.content.src =
      "https://dummyimage.com/1200x600/ffffff/4f46e5&text=Hero+Image";

    return {
      id: nanoid(),
      type: NodeType.SectionHero,
      props: {
        containerWidth: "full",
        spacing: { ...baseSectionSpacing },
        layout: { ...baseSectionLayout, align: "center", justify: "center" },
        style: { backgroundColor: "#F1F5F9" },
        effects: {},
        responsive: {},
      },
      children: [heading, paragraph, buttons, image],
    };
  },
};

/* =============================================================
   🟣 FEATURES SECTION
============================================================= */
export const FeaturesSectionPreset: BlueprintPreset<FeaturesSectionNode> = {
  type: NodeType.SectionFeatures,
  create: () => {
    const heading = HeadingPreset.create();
    const desc = ParagraphPreset.create();
    const grid = ContainerPreset.create();

    heading.id = nanoid();
    heading.props.content.text = "Features of BuildEZ";

    desc.id = nanoid();
    desc.props.content.text = "Next-gen SaaS builder powered by AI.";

    grid.id = nanoid();
    grid.props.layout = {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 24,
    };

    grid.children = Array.from({ length: 3 }).map((_, i) => {
      const box = ContainerPreset.create();
      const icon = IconPreset.create();
      const title = HeadingPreset.create();
      const text = ParagraphPreset.create();

      box.id = nanoid();
      box.props.style = { backgroundColor: "#F8FAFC", borderRadius: 8 };

      icon.id = nanoid();
      icon.props.content.icon = "⚡";

      title.id = nanoid();
      title.props.content.text = `Feature ${i + 1}`;

      text.id = nanoid();
      text.props.content.text = "Describe a powerful feature here.";

      box.children = [icon, title, text];
      return box;
    });

    return {
      id: nanoid(),
      type: NodeType.SectionFeatures,
      props: {
        containerWidth: "full",
        spacing: { ...baseSectionSpacing },
        layout: { ...baseSectionLayout, align: "center" },
        style: { backgroundColor: "#FFFFFF" },
        effects: {},
        responsive: {},
      },
      children: [heading, desc, grid],
    };
  },
};

/* =============================================================
   🟣 GALLERY SECTION
============================================================= */
export const GallerySectionPreset: BlueprintPreset<GallerySectionNode> = {
  type: NodeType.SectionGallery,
  create: () => {
    const heading = HeadingPreset.create();
    heading.id = nanoid();
    heading.props.content.text = "Product Showcase";

    const grid = ContainerPreset.create();
    grid.id = nanoid();
    grid.props.layout = {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 24,
    };

    grid.children = Array.from({ length: 6 }).map(() => {
      const img = ImagePreset.create();
      img.id = nanoid();
      return img;
    });

    return {
      id: nanoid(),
      type: NodeType.SectionGallery,
      props: {
        containerWidth: "full",
        spacing: { ...baseSectionSpacing },
        layout: { ...baseSectionLayout },
        style: { backgroundColor: "#FFFFFF" },
        effects: {},
        responsive: {},
      },
      children: [heading, grid],
    };
  },
};

/* =============================================================
   🟣 TESTIMONIALS SECTION
============================================================= */
export const TestimonialsSectionPreset: BlueprintPreset<TestimonialsSectionNode> = {
  type: NodeType.SectionTestimonials,
  create: () => {
    const heading = HeadingPreset.create();
    heading.id = nanoid();
    heading.props.content.text = "What Customers Say";

    const container = ContainerPreset.create();
    container.id = nanoid();
    container.props.layout = {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 24,
    };

    container.children = Array.from({ length: 3 }).map(() => {
      const box = ContainerPreset.create();
      const text = ParagraphPreset.create();
      const author = HeadingPreset.create();

      box.id = nanoid();
      box.props.style = { backgroundColor: "#FFFFFF", borderRadius: 8 };

      text.id = nanoid();
      text.props.content.text = "“This builder changed our workflow.”";

      author.id = nanoid();
      author.props.content.text = "Jane Doe";

      box.children = [text, author];
      return box;
    });

    return {
      id: nanoid(),
      type: NodeType.SectionTestimonials,
      props: {
        containerWidth: "full",
        spacing: { ...baseSectionSpacing },
        layout: { ...baseSectionLayout },
        style: { backgroundColor: "#F8FAFC" },
        effects: {},
        responsive: {},
      },
      children: [heading, container],
    };
  },
};

/* =============================================================
   🟣 SIMPLE SECTIONS (NO DEFAULT SPACING)
============================================================= */

const simpleSection = (type: NodeType): BlueprintPreset<any> => ({
  type,
  create: () => ({
    id: nanoid(),
    type,
    props: {
      containerWidth: "full",
      spacing: {},
      layout: {},
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
});

export const StatsSectionPreset = simpleSection(NodeType.SectionStats);
export const PricingSectionPreset = simpleSection(NodeType.SectionPricing);
export const FAQSectionPreset = simpleSection(NodeType.SectionFAQ);
export const TeamSectionPreset = simpleSection(NodeType.SectionTeam);
export const FooterSectionPreset = simpleSection(NodeType.SectionFooter);

/* =============================================================
   SECTION PRESET REGISTRY
============================================================= */

const SECTION_PRESETS = {
  [NodeType.SectionHero]: HeroSectionPreset,
  [NodeType.SectionFeatures]: FeaturesSectionPreset,
  [NodeType.SectionGallery]: GallerySectionPreset,
  [NodeType.SectionTestimonials]: TestimonialsSectionPreset,
  [NodeType.SectionStats]: StatsSectionPreset,
  [NodeType.SectionPricing]: PricingSectionPreset,
  [NodeType.SectionFAQ]: FAQSectionPreset,
  [NodeType.SectionTeam]: TeamSectionPreset,
  [NodeType.SectionFooter]: FooterSectionPreset,
};

export default SECTION_PRESETS;
