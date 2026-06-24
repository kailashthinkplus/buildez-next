// -------------------------------------------------------------
// BuildEZ Blueprint Schema (Frozen by BuildEZ CODEGEN BIBLE)
// File: /apps/web-app/modules/builder/blueprint/types.ts
// -------------------------------------------------------------

// -------------------------------------------------------------
// ENUMS — Node Types (EXACT as per PDF)
// -------------------------------------------------------------
export enum NodeType {
  Page = "page",
    Section = "section",

  // Section Types (Frozen)
  SectionHero = "section_hero",
  SectionFeatures = "section_features",
  SectionGallery = "section_gallery",
  SectionTestimonials = "section_testimonials",
  SectionStats = "section_stats",
  SectionCTA = "section_cta",
  SectionPricing = "section_pricing",
  SectionFAQ = "section_faq",
  SectionTeam = "section_team",
  SectionFooter = "section_footer",

  // Block Types (Frozen)
  Heading = "heading",
  Paragraph = "paragraph",
  Button = "button",
  Image = "image",
  Icon = "icon",
  List = "list",
  Text = "text",
  Spacer = "spacer",
  Divider = "divider",
  Video = "video",

  // Container-like blocks allowed by schema
  Container = "container",
  Grid = "grid",
  Column = "column",

  PrimitiveText = "primitive_text",
  PrimitiveImage = "primitive_image",
}

// -------------------------------------------------------------
// BASE NODE
// -------------------------------------------------------------
export interface BaseNode {
  id: string;                     // Unique UUID
  type: NodeType;                 // Discriminant
  props: NodeProps;               // Fully typed props
  children: BlueprintNode[];      // Recursive tree
}

// -------------------------------------------------------------
// PAGE NODE
// -------------------------------------------------------------
export interface PageNode extends BaseNode {
  type: NodeType.Page;
  props: PageProps;
  children: SectionNode[];        // Only sections allowed
}

// -------------------------------------------------------------
// SECTION NODE
// -------------------------------------------------------------
export type SectionNode =
  | HeroSectionNode
  | FeaturesSectionNode
  | GallerySectionNode
  | TestimonialsSectionNode
  | StatsSectionNode
  | CTASectionNode
  | PricingSectionNode
  | FAQSectionNode
  | TeamSectionNode
  | FooterSectionNode;

// All section interfaces share the same structural pattern:
export interface BaseSectionNode extends BaseNode {
  children: BlockNode[];          // Section contains only blocks
}

// -------------------------------------------------------------
// INDIVIDUAL SECTION DEFINITIONS (Frozen)
// -------------------------------------------------------------
export interface HeroSectionNode extends BaseSectionNode {
  type: NodeType.SectionHero;
  props: SectionProps;
}

export interface FeaturesSectionNode extends BaseSectionNode {
  type: NodeType.SectionFeatures;
  props: SectionProps;
}

export interface GallerySectionNode extends BaseSectionNode {
  type: NodeType.SectionGallery;
  props: SectionProps;
}

export interface TestimonialsSectionNode extends BaseSectionNode {
  type: NodeType.SectionTestimonials;
  props: SectionProps;
}

export interface StatsSectionNode extends BaseSectionNode {
  type: NodeType.SectionStats;
  props: SectionProps;
}

export interface CTASectionNode extends BaseSectionNode {
  type: NodeType.SectionCTA;
  props: SectionProps;
}

export interface PricingSectionNode extends BaseSectionNode {
  type: NodeType.SectionPricing;
  props: SectionProps;
}

export interface FAQSectionNode extends BaseSectionNode {
  type: NodeType.SectionFAQ;
  props: SectionProps;
}

export interface TeamSectionNode extends BaseSectionNode {
  type: NodeType.SectionTeam;
  props: SectionProps;
}

export interface FooterSectionNode extends BaseSectionNode {
  type: NodeType.SectionFooter;
  props: SectionProps;
}


// -------------------------------------------------------------
// BLOCK NODE
// -------------------------------------------------------------
export type BlockNode =
  | HeadingBlockNode
  | ParagraphBlockNode
  | ButtonBlockNode
  | ImageBlockNode
  | IconBlockNode
  | ListBlockNode
  | TextBlockNode
  | SpacerBlockNode
  | DividerBlockNode
  | VideoBlockNode
  | ContainerBlockNode
  | GridBlockNode
  | PrimitiveTextBlockNode
  | PrimitiveImageBlockNode;

// -------------------------------------------------------------
// INDIVIDUAL BLOCK DEFINITIONS (Frozen)
// -------------------------------------------------------------
export interface HeadingBlockNode extends BaseNode {
  type: NodeType.Heading;
  props: HeadingProps;
}

export interface ParagraphBlockNode extends BaseNode {
  type: NodeType.Paragraph;
  props: ParagraphProps;
}

export interface ButtonBlockNode extends BaseNode {
  type: NodeType.Button;
  props: ButtonProps;
}

export interface ImageBlockNode extends BaseNode {
  type: NodeType.Image;
  props: ImageProps;
}

export interface IconBlockNode extends BaseNode {
  type: NodeType.Icon;
  props: IconProps;
}

export interface ListBlockNode extends BaseNode {
  type: NodeType.List;
  props: ListProps;
}

export interface TextBlockNode extends BaseNode {
  type: NodeType.Text;
  props: TextProps;
}

export interface SpacerBlockNode extends BaseNode {
  type: NodeType.Spacer;
  props: SpacerProps;
}

export interface DividerBlockNode extends BaseNode {
  type: NodeType.Divider;
  props: DividerProps;
}

export interface VideoBlockNode extends BaseNode {
  type: NodeType.Video;
  props: VideoProps;
}

export interface ContainerBlockNode extends BaseNode {
  type: NodeType.Container;
  props: ContainerProps;
}

export interface GridBlockNode extends BaseNode {
  type: NodeType.Grid;
  props: GridProps;
}

export interface PrimitiveTextBlockNode extends BaseNode {
  type: NodeType.PrimitiveText;
  props: PrimitiveTextProps;
}

export interface PrimitiveImageBlockNode extends BaseNode {
  type: NodeType.PrimitiveImage;
  props: PrimitiveImageProps;
}

// -------------------------------------------------------------
// UNION TYPE FOR ANY NODE
// -------------------------------------------------------------
export type BlueprintNode = PageNode | SectionNode | BlockNode;

// -------------------------------------------------------------
// PROP INTERFACES (Shell only — detailed definitions continue
// in PART 2 due to size)
// -------------------------------------------------------------
export interface NodeProps {}               // Placeholder interface (expanded in next parts)
export interface PageProps extends NodeProps {}
export interface SectionProps extends NodeProps {}

export interface HeadingProps extends NodeProps {}
export interface ParagraphProps extends NodeProps {}
export interface ButtonProps extends NodeProps {}
export interface ImageProps extends NodeProps {}
export interface IconProps extends NodeProps {}
export interface ListProps extends NodeProps {}
export interface TextProps extends NodeProps {}
export interface SpacerProps extends NodeProps {}
export interface DividerProps extends NodeProps {}
export interface VideoProps extends NodeProps {}
export interface ContainerProps extends NodeProps {}
export interface GridProps extends NodeProps {}
export interface PrimitiveTextProps extends NodeProps {}
export interface PrimitiveImageProps extends NodeProps {}
// -------------------------------------------------------------
// PART 2 — PROPS DEFINITIONS (EXACT AS PER PDF)
// -------------------------------------------------------------

// =============================================================
// CONTENT PROPS
// =============================================================
export interface ContentProps {
  text?: string;
  richText?: string;
  list?: string[];
  images?: { src: string; alt: string }[];
  videoUrl?: string;
  linkUrl?: string;
  buttons?: { label: string; href: string }[];
}

// =============================================================
// LAYOUT PROPS
// (flex, grid, width, height, alignment, gap, display)
// =============================================================
export type DisplayMode = "flex" | "grid" | "block";

export type FlexDirection = "row" | "column";
export type FlexAlign = "start" | "center" | "end";
export type FlexJustify = "start" | "center" | "end" | "between";

export interface LayoutProps {
  width?: number | string;
  height?: number | string;

  display?: DisplayMode;

  // Flex properties
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;

  // Gap (for flex or grid)
  gap?: number;

  // Grid properties
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: "row" | "column";
}

// =============================================================
// SPACING PROPS (padding + margin)
// =============================================================
export interface EdgeSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingProps {
  padding?: EdgeSpacing;
  margin?: EdgeSpacing;
}

// =============================================================
// STYLE PROPS (color, bg, border, gradient, opacity, shadow)
// =============================================================

// Color
export interface ColorProps {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

// Border
export interface BorderProps {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

// Gradient
export interface GradientSpec {
  type: "linear" | "radial";
  angle?: number;
  colors: { color: string; position: number }[];
}

// Shadow
export interface ShadowSpec {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

// Opacity
export type OpacityValue = number;

// -------------------------------------------------------------
// MASTER STYLE PROPS
// -------------------------------------------------------------
export interface StyleProps {
  backgroundColor?: string;
  textColor?: string;

  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;

  gradient?: GradientSpec;
  opacity?: OpacityValue;
  shadow?: ShadowSpec;
}

// =============================================================
// EFFECTS PROPS (animation, transition, parallax, filters)
// =============================================================

// Animation
export interface AnimationSpec {
  type:
    | "fade"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right"
    | "zoom-in"
    | "zoom-out"
    | "none";
  duration?: number;
  delay?: number;
}

// Transitions
export interface TransitionSpec {
  duration?: number;
  easing?: string;
}

// Parallax
export interface ParallaxSpec {
  strength?: number;
  direction?: "vertical" | "horizontal";
}

// Filters
export interface FilterSpec {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  hueRotate?: number;
  saturate?: number;
  sepia?: number;
}

// -------------------------------------------------------------
// MASTER EFFECTS PROPS
// -------------------------------------------------------------
export interface EffectsProps {
  animation?: AnimationSpec;
  transitions?: TransitionSpec;
  parallax?: ParallaxSpec;
  filter?: FilterSpec;
}

// =============================================================
// RESPONSIVE OVERRIDES
// =============================================================
export interface NodePropsOverride {
  content?: Partial<ContentProps>;
  layout?: Partial<LayoutProps>;
  spacing?: Partial<SpacingProps>;
  style?: Partial<StyleProps>;
  effects?: Partial<EffectsProps>;
}

export interface ResponsiveOverrides {
  mobile?: NodePropsOverride;
  tablet?: NodePropsOverride;
  desktop?: NodePropsOverride;
}

// =============================================================
// MASTER NODE PROPS (Every node merges all props categories)
// =============================================================
export interface NodeProps {
  content?: ContentProps;
  layout?: LayoutProps;
  spacing?: SpacingProps;
  style?: StyleProps;
  effects?: EffectsProps;
  responsive?: ResponsiveOverrides;
}

// -------------------------------------------------------------
// PAGE PROPS (Frozen in PDF — metadata only)
// -------------------------------------------------------------
export interface PageProps extends NodeProps {
  title?: string;
  description?: string;
  slug?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
  };
}

// -------------------------------------------------------------
// SECTION PROPS (layout + spacing + style)
// -------------------------------------------------------------
export interface SectionProps extends NodeProps {
  containerWidth?: number | "full" | "fixed";
}
// -------------------------------------------------------------
// PART 3 — BLOCK-SPECIFIC PROPS (EXACT AS PER PDF)
// -------------------------------------------------------------

// =============================================================
// HEADING PROPS
// =============================================================
export interface HeadingProps extends NodeProps {
  content?: ContentProps & {
    text?: string; // heading text
  };
  style?: StyleProps & {
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
  };
}

// =============================================================
// PARAGRAPH PROPS
// =============================================================
export interface ParagraphProps extends NodeProps {
  content?: ContentProps & {
    text?: string; // paragraph text
  };
  style?: StyleProps & {
    fontSize?: number;
    lineHeight?: number;
    fontWeight?: number;
  };
}

// =============================================================
// BUTTON PROPS
// =============================================================
export interface ButtonProps extends NodeProps {
  content?: ContentProps & {
    label?: string;
    href?: string;
  };
  style?: StyleProps & {
    buttonStyle?: "solid" | "outline" | "ghost";
  };
  layout?: LayoutProps;
}

// =============================================================
// IMAGE PROPS
// =============================================================
export interface ImageProps extends NodeProps {
  content?: ContentProps & {
    src?: string;
    alt?: string;
  };
  layout?: LayoutProps & {
    width?: number | string;
    height?: number | string;
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  };
  style?: StyleProps;
}

// =============================================================
// ICON PROPS
// =============================================================
export interface IconProps extends NodeProps {
  content?: ContentProps & {
    icon?: string; // name or URL of icon
  };
  style?: StyleProps & {
    size?: number;
  };
}

// =============================================================
// LIST PROPS
// =============================================================
export interface ListProps extends NodeProps {
  content?: ContentProps & {
    list?: string[];
  };
  style?: StyleProps & {
    itemSpacing?: number;
    bulletStyle?: "disc" | "circle" | "square" | "none";
  };
}

// =============================================================
// TEXT PROPS (inline text block)
// =============================================================
export interface TextProps extends NodeProps {
  content?: ContentProps & {
    text?: string;
  };
  style?: StyleProps;
}

// =============================================================
// SPACER PROPS
// =============================================================
export interface SpacerProps extends NodeProps {
  layout?: LayoutProps & {
    height?: number; // Spacer height
  };
}

// =============================================================
// DIVIDER PROPS
// =============================================================
export interface DividerProps extends NodeProps {
  style?: StyleProps & {
    thickness?: number;
    color?: string;
  };
  layout?: LayoutProps;
}

// =============================================================
// VIDEO PROPS
// =============================================================
export interface VideoProps extends NodeProps {
  content?: ContentProps & {
    src?: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
  };
  layout?: LayoutProps & {
    width?: number | string;
    height?: number | string;
  };
}

// =============================================================
// CONTAINER PROPS
// Allows nested blocks inside
// =============================================================
export interface ContainerProps extends NodeProps {
  layout?: LayoutProps & {
    direction?: FlexDirection;
    align?: FlexAlign;
    justify?: FlexJustify;
    gap?: number;
  };
  spacing?: SpacingProps;
  style?: StyleProps;
}

// =============================================================
// GRID PROPS
// =============================================================
export interface GridProps extends NodeProps {
  layout?: LayoutProps & {
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
    gap?: number;
  };
  spacing?: SpacingProps;
  style?: StyleProps;
}

// =============================================================
// PRIMITIVE TEXT PROPS
// =============================================================
export interface PrimitiveTextProps extends NodeProps {
  content?: ContentProps & {
    text?: string;
  };
  style?: StyleProps;
}

// =============================================================
// PRIMITIVE IMAGE PROPS
// =============================================================
export interface PrimitiveImageProps extends NodeProps {
  content?: ContentProps & {
    src?: string;
    alt?: string;
  };
  style?: StyleProps;
  layout?: LayoutProps & {
    width?: number | string;
    height?: number | string;
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  };
}
// -------------------------------------------------------------
// PART 4 — INTERNAL BLUEPRINT ENGINE TYPES
// -------------------------------------------------------------

// =============================================================
// VALIDATOR ERROR ENUM (Frozen by PDF)
// =============================================================
export enum BlueprintValidationError {
  INVALID_NODE_TYPE = "INVALID_NODE_TYPE",
  MISSING_REQUIRED_PROP = "MISSING_REQUIRED_PROP",
  UNEXPECTED_CHILD_TYPE = "UNEXPECTED_CHILD_TYPE",
  INVALID_PROP_SHAPE = "INVALID_PROP_SHAPE",
  INVALID_RESPONSIVE_OVERRIDE = "INVALID_RESPONSIVE_OVERRIDE",
  MISSING_ID = "MISSING_ID",
}

// =============================================================
// VALIDATION RESULT TYPE
// =============================================================
export interface ValidationResult {
  valid: boolean;
  errors: {
    nodeId: string;
    error: BlueprintValidationError;
    message: string;
    path: string; // path to node like "page.sections[0].children[2]"
  }[];
}

// =============================================================
// BLUEPRINT ROOT WRAPPER TYPE
// (Used internally by serializer and importer)
// =============================================================
export interface BlueprintDocument {
  version: number;                // For future migrations
  root: PageNode;                 // Always starts with PageNode
}

// =============================================================
// PATCH TYPES (applyPatch.ts contract)
// =============================================================
export type Patch =
  | UpdateNodePatch
  | InsertNodePatch
  | DeleteNodePatch
  | MoveNodePatch;

export interface BasePatch {
  targetId: string;
  path: string; // dot-notation or array path ("children.2.props.content")
}

export interface UpdateNodePatch extends BasePatch {
  type: "update";
  value: Partial<NodeProps>;
}

export interface InsertNodePatch extends BasePatch {
  type: "insert";
  node: BlueprintNode;
  position: number; // insert index
}

export interface DeleteNodePatch extends BasePatch {
  type: "delete";
}

export interface MoveNodePatch extends BasePatch {
  type: "move";
  newParentId: string;
  newIndex: number;
}

// =============================================================
// BLUEPRINT NORMALIZATION TYPES
// =============================================================
export interface NormalizedNode<N extends BlueprintNode = BlueprintNode> {
  node: N;
  errors: BlueprintValidationError[];
}

export interface BlueprintNormalizationResult {
  root: PageNode;
  errors: {
    nodeId: string;
    error: BlueprintValidationError;
    message: string;
  }[];
}

// =============================================================
// BLUEPRINT TREE TRAVERSAL TYPES (utils.ts)
// =============================================================
export interface NodeTraversalContext {
  parent: BlueprintNode | null;
  index: number;
  depth: number;
  path: string;
}

export type NodeVisitor = (
  node: BlueprintNode,
  ctx: NodeTraversalContext
) => void | boolean;

export interface NodeSearchResult {
  node: BlueprintNode | null;
  parent: BlueprintNode | null;
  index: number;
  path: string;
}

// =============================================================
// MAPPER TYPES (mapper.ts)
// =============================================================
export interface MapperOptions {
  normalize?: boolean; // Normalize nodes according to presets
  validate?: boolean;  // Validate after mapping
}

export interface MappedBlueprint {
  root: PageNode;
  errors?: ValidationResult["errors"];
}

// =============================================================
// SERIALIZER TYPES (serializer.ts)
// =============================================================
export interface SerializedNode {
  id: string;
  type: NodeType;
  props: any;                     // Minimal props after cleanup
  children: SerializedNode[];
}

export interface SerializedBlueprint {
  version: number;
  root: SerializedNode;
}

// =============================================================
// INTERNAL METADATA TYPES (Used for future-proofing)
// =============================================================
export interface BlueprintMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision?: number;
}

// =============================================================
// EXPORTED TYPE ALIASES FOR ENGINE
// =============================================================
export type AnySectionProps = SectionProps;
export type AnyBlockProps =
  | HeadingProps
  | ParagraphProps
  | ButtonProps
  | ImageProps
  | IconProps
  | ListProps
  | TextProps
  | SpacerProps
  | DividerProps
  | VideoProps
  | ContainerProps
  | GridProps
  | PrimitiveTextProps
  | PrimitiveImageProps;

export type AnyNodeProps = PageProps | AnySectionProps | AnyBlockProps;

// -------------------------------------------------------------
// END PART 4
// -------------------------------------------------------------
// -------------------------------------------------------------
// PART 5 — FINAL UTILITY TYPES + EXPORTS
// -------------------------------------------------------------

// =============================================================
// ID GENERATION CONTRACT
// (IDs must be deterministically unique + stable)
// =============================================================
export type NodeID = string; // UUID v4 or nanoid — generated engine-side

export interface IDGenerator {
  (): NodeID;
}

// =============================================================
// DEEP CLONE CONTRACT (utils / deepClone.ts)
// =============================================================
// Ensures immutability across blueprint state operations.
export type DeepClone<T> = (value: T) => T;

// =============================================================
// NODE CREATION CONTRACT (mapper.ts + presets.ts)
// =============================================================
export interface NodeFactory<N extends BlueprintNode = BlueprintNode> {
  (partial: Partial<N>): N;
}

export interface CreateNodeOptions {
  withDefaults?: boolean; // Apply preset defaults
  normalize?: boolean;    // Normalize after creation
}

// =============================================================
// PRESET CONTRACT (presets.ts)
// =============================================================
export interface BlueprintPreset<N extends BlueprintNode = BlueprintNode> {
  type: NodeType;
  create: () => N; // Fully default node
}

// Registry shape used by preset loader
export type BlueprintPresetRegistry = {
  [key in NodeType]?: BlueprintPreset<any>;
};

// =============================================================
// BLUEPRINT OPERATIONS (Core logic interfaces)
// =============================================================

// Path-like pointer within blueprint tree such as:
// "children.2.props.layout.gap"
export type BlueprintPath = string;

// Operation results for applyPatch.ts
export interface PatchApplicationResult {
  success: boolean;
  updatedBlueprint: PageNode;
  errors?: {
    nodeId: string;
    error: BlueprintValidationError;
    message: string;
  }[];
}

// =============================================================
// IMPORT / EXPORT CONTRACTS
// =============================================================

// Importer may receive raw JSON (from DB or API)
export interface BlueprintImportOptions {
  validate?: boolean;
  normalize?: boolean;
  strict?: boolean; // Disallow unknown fields
}

export interface BlueprintExportOptions {
  minify?: boolean; // Remove undefined fields
  version?: number; // Custom version tag
}

// =============================================================
// BLUEPRINT HISTORY (Undo / Redo Stack)
// =============================================================
export interface BlueprintHistoryStack {
  past: PageNode[];
  present: PageNode;
  future: PageNode[];
}

// A snapshot in time
export interface BlueprintSnapshot {
  blueprint: PageNode;
  timestamp: number;
  reason?: string; // "undo", "redo", "patch", "ai"
}

// =============================================================
// BLUEPRINT INDEX STRUCTURE (Tree Index Cache)
// =============================================================
export interface BlueprintIndexEntry {
  id: string;
  parentId: string | null;
  index: number;
  path: string;
}

export type BlueprintIndex = Record<string, BlueprintIndexEntry>;

// =============================================================
// END OF FILE — EXPORTS
// =============================================================
export {
  // Core Node Types
  PageNode,
  SectionNode,
  BlockNode,
  BlueprintNode,

  // Props
  NodeProps,
  PageProps,
  SectionProps,

  // Block Props
  HeadingProps,
  ParagraphProps,
  ButtonProps,
  ImageProps,
  IconProps,
  ListProps,
  TextProps,
  SpacerProps,
  DividerProps,
  VideoProps,
  ContainerProps,
  GridProps,
  PrimitiveTextProps,
  PrimitiveImageProps,

  // Utility Types
  BlueprintDocument,
  SerializedNode,
  SerializedBlueprint,
  ValidationResult,

  Patch,
  PatchApplicationResult,

  BlueprintPreset,
  BlueprintPresetRegistry,

  NormalizedNode,
  BlueprintNormalizationResult,

  MapperOptions,
  MappedBlueprint,

  NodeTraversalContext,
  NodeVisitor,
  NodeSearchResult,

  BlueprintHistoryStack,
  BlueprintSnapshot,
  BlueprintIndex,
  BlueprintIndexEntry,

  DeepClone,
  NodeID,
  IDGenerator,
  BlueprintPath,
  BlueprintImportOptions,
  BlueprintExportOptions,
};

// =============================================================
// END OF FILE — EXPORTS (V3 Frozen)
// =============================================================

// Nothing else to export here. Avoid duplicate exports.
