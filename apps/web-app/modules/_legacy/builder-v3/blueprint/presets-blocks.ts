// -------------------------------------------------------------
// BuildEZ BLUEPRINT PRESETS — BLOCKS ONLY (V3 CANONICAL)
// File: /modules/builder/blueprint/presets-blocks.ts
// -------------------------------------------------------------

import { nanoid } from "nanoid";

import {
  NodeType,
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
  BlueprintPreset,
} from "@/modules/builder/blueprint/types";

/* -------------------------------------------------------------
   BASE SPACING (NEUTRAL)
------------------------------------------------------------- */
const spacingZero = { top: 0, right: 0, bottom: 0, left: 0 };

/* -------------------------------------------------------------
   THEME TOKENS (shared)
------------------------------------------------------------- */
export const ThemeTokens = {
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",

  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8FAFC",
  bgSurface: "#F1F5F9",

  brand: "#4F46E5",
  brandLight: "#6366F1",
};

/* =============================================================
   BLOCK PRESETS — SPACING-NEUTRAL (INSPECTOR-AUTHORITATIVE)
============================================================= */

/* ---------------- Heading ---------------- */
export const HeadingPreset: BlueprintPreset<HeadingBlockNode> = {
  type: NodeType.Heading,
  create: () => ({
    id: nanoid(),
    type: NodeType.Heading,
    props: {
      content: { text: "Heading Text" },
      layout: { display: "block" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {
        textColor: ThemeTokens.textPrimary,
        fontSize: 32,
        fontWeight: 700,
        lineHeight: 1.2,
      },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Paragraph ---------------- */
export const ParagraphPreset: BlueprintPreset<ParagraphBlockNode> = {
  type: NodeType.Paragraph,
  create: () => ({
    id: nanoid(),
    type: NodeType.Paragraph,
    props: {
      content: { text: "Paragraph text" },
      layout: { display: "block" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {
        textColor: ThemeTokens.textSecondary,
        fontSize: 18,
        lineHeight: 1.6,
      },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Text ---------------- */
export const TextPreset: BlueprintPreset<TextBlockNode> = {
  type: NodeType.Text,
  create: () => ({
    id: nanoid(),
    type: NodeType.Text,
    props: {
      content: { text: "Text" },
      layout: { display: "block" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {
        textColor: ThemeTokens.textPrimary,
        fontSize: 16,
        lineHeight: 1.5,
      },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Button (intrinsic padding OK) ---------------- */
export const ButtonPreset: BlueprintPreset<ButtonBlockNode> = {
  type: NodeType.Button,
  create: () => ({
    id: nanoid(),
    type: NodeType.Button,
    props: {
      content: { label: "Button", href: "#" },
      layout: { display: "inline-block" },
      spacing: {
        padding: { top: 12, right: 20, bottom: 12, left: 20 }, // intrinsic
        margin: { ...spacingZero },
      },
      style: {
        backgroundColor: ThemeTokens.brand,
        textColor: "#FFFFFF",
        borderRadius: 8,
      },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Image ---------------- */
export const ImagePreset: BlueprintPreset<ImageBlockNode> = {
  type: NodeType.Image,
  create: () => ({
    id: nanoid(),
    type: NodeType.Image,
    props: {
      content: {
        src: "https://dummyimage.com/800x600/4f46e5/ffffff&text=Image",
        alt: "Image",
      },
      layout: { width: "100%", height: "auto" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Icon ---------------- */
export const IconPreset: BlueprintPreset<IconBlockNode> = {
  type: NodeType.Icon,
  create: () => ({
    id: nanoid(),
    type: NodeType.Icon,
    props: {
      content: { icon: "✨" },
      layout: { display: "inline-block" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: { size: 28, textColor: ThemeTokens.brand },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- List ---------------- */
export const ListPreset: BlueprintPreset<ListBlockNode> = {
  type: NodeType.List,
  create: () => ({
    id: nanoid(),
    type: NodeType.List,
    props: {
      content: { list: ["List item 1", "List item 2"] },
      layout: {},
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: { textColor: ThemeTokens.textSecondary, itemSpacing: 8 },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Spacer (ONLY spacing block) ---------------- */
export const SpacerPreset: BlueprintPreset<SpacerBlockNode> = {
  type: NodeType.Spacer,
  create: () => ({
    id: nanoid(),
    type: NodeType.Spacer,
    props: {
      layout: { height: 24 }, // minimal, inspector-editable
      spacing: {},
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Divider ---------------- */
export const DividerPreset: BlueprintPreset<DividerBlockNode> = {
  type: NodeType.Divider,
  create: () => ({
    id: nanoid(),
    type: NodeType.Divider,
    props: {
      layout: {},
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: { thickness: 1, color: "#E2E8F0" },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Video ---------------- */
export const VideoPreset: BlueprintPreset<VideoBlockNode> = {
  type: NodeType.Video,
  create: () => ({
    id: nanoid(),
    type: NodeType.Video,
    props: {
      content: { src: "", autoplay: false, controls: true },
      layout: { width: "100%" },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Container (NO default gap) ---------------- */
export const ContainerPreset: BlueprintPreset<ContainerBlockNode> = {
  type: NodeType.Container,
  create: () => ({
    id: nanoid(),
    type: NodeType.Container,
    props: {
      layout: {
        display: "flex",
        direction: "column",
        gap: 0, // 🔒 inspector controls rhythm
      },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Grid ---------------- */
export const GridPreset: BlueprintPreset<GridBlockNode> = {
  type: NodeType.Grid,
  create: () => ({
    id: nanoid(),
    type: NodeType.Grid,
    props: {
      layout: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0, // 🔒 inspector controls spacing
      },
      spacing: { margin: { ...spacingZero }, padding: { ...spacingZero } },
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Primitive Text ---------------- */
export const PrimitiveTextPreset: BlueprintPreset<PrimitiveTextBlockNode> = {
  type: NodeType.PrimitiveText,
  create: () => ({
    id: nanoid(),
    type: NodeType.PrimitiveText,
    props: {
      content: { text: "Primitive Text" },
      spacing: {},
      layout: {},
      style: { textColor: ThemeTokens.textPrimary },
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* ---------------- Primitive Image ---------------- */
export const PrimitiveImagePreset: BlueprintPreset<PrimitiveImageBlockNode> = {
  type: NodeType.PrimitiveImage,
  create: () => ({
    id: nanoid(),
    type: NodeType.PrimitiveImage,
    props: {
      content: { src: "", alt: "" },
      layout: { width: "100%" },
      spacing: {},
      style: {},
      effects: {},
      responsive: {},
    },
    children: [],
  }),
};

/* =============================================================
   MASTER REGISTRY — BLOCKS ONLY
============================================================= */

const PRESETS = {
  [NodeType.Heading]: HeadingPreset,
  [NodeType.Paragraph]: ParagraphPreset,
  [NodeType.Text]: TextPreset,
  [NodeType.Button]: ButtonPreset,
  [NodeType.Image]: ImagePreset,
  [NodeType.Icon]: IconPreset,
  [NodeType.List]: ListPreset,
  [NodeType.Spacer]: SpacerPreset,
  [NodeType.Divider]: DividerPreset,
  [NodeType.Video]: VideoPreset,
  [NodeType.Container]: ContainerPreset,
  [NodeType.Grid]: GridPreset,
  [NodeType.PrimitiveText]: PrimitiveTextPreset,
  [NodeType.PrimitiveImage]: PrimitiveImagePreset,
};

export default PRESETS;
