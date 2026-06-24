/* ==========================================================
   BuildEZ Builder V2
   Normalized Blueprint
========================================================== */

export type BuilderDevice =
  | "desktop"
  | "laptop"
  | "tablet"
  | "mobile";

export type NodeType =
  | "page"
  | "section"
  | "container"
  | "grid"
  | "column"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "video"
  | "icon"
  | "divider"
  | "spacer"
  | "form"
  | "hero"
  | "features"
  | "pricing"
  | "gallery"
  | "faq"
  | "cta"
  | "footer"
  | "custom";

/* ==========================================================
   Responsive Value
========================================================== */

export interface ResponsiveValue<T> {
  desktop?: T;
  laptop?: T;
  tablet?: T;
  mobile?: T;
}

/* ==========================================================
   Style
========================================================== */

export interface BuilderStyle {
  color?: string;

  backgroundColor?: string;

  opacity?: number;

  fontFamily?: string;

  fontSize?: ResponsiveValue<number>;

  fontWeight?: number;

  lineHeight?: number;

  letterSpacing?: number;

  textAlign?:
    | "left"
    | "center"
    | "right"
    | "justify";

  textTransform?:
    | "none"
    | "uppercase"
    | "lowercase"
    | "capitalize";

  textDecoration?:
    | "none"
    | "underline"
    | "line-through";

  width?: ResponsiveValue<string | number>;

  height?: ResponsiveValue<string | number>;

  minWidth?: ResponsiveValue<string | number>;

  minHeight?: ResponsiveValue<string | number>;

  maxWidth?: ResponsiveValue<string | number>;

  maxHeight?: ResponsiveValue<string | number>;

  margin?: ResponsiveValue<string | number>;

  marginTop?: ResponsiveValue<string | number>;

  marginBottom?: ResponsiveValue<string | number>;

  marginLeft?: ResponsiveValue<string | number>;

  marginRight?: ResponsiveValue<string | number>;

  padding?: ResponsiveValue<string | number>;

  paddingTop?: ResponsiveValue<string | number>;

  paddingBottom?: ResponsiveValue<string | number>;

  paddingLeft?: ResponsiveValue<string | number>;

  paddingRight?: ResponsiveValue<string | number>;

  borderRadius?: ResponsiveValue<string | number>;

  border?: string;

  boxShadow?: string;

  display?:
    | "block"
    | "flex"
    | "grid"
    | "inline-block"
    | "none";

  flexDirection?:
    | "row"
    | "column";

  justifyContent?: string;

  alignItems?: string;

  gap?: ResponsiveValue<string | number>;

  position?:
    | "static"
    | "relative"
    | "absolute"
    | "fixed"
    | "sticky";

  top?: ResponsiveValue<string | number>;

  left?: ResponsiveValue<string | number>;

  right?: ResponsiveValue<string | number>;

  bottom?: ResponsiveValue<string | number>;

  overflow?: string;

  zIndex?: number;

  objectFit?:
    | "cover"
    | "contain"
    | "fill"
    | "none";

  aspectRatio?: string;

  transition?: string;

  transform?: string;

  [key: string]: unknown;
}

/* ==========================================================
   Common Widget Props
========================================================== */

export interface HeadingProps {
  text: string;
  level:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
}

export interface TextProps {
  html: string;
}

export interface ButtonProps {
  label: string;
  href: string;
  target?: "_self" | "_blank";
}

export interface ImageProps {
  src: string;
  alt: string;
}

export interface VideoProps {
  src: string;
  poster?: string;
}

/* ==========================================================
   Builder Node
========================================================== */

export interface BuilderNode {

  id: string;

  type: NodeType;

  name?: string;

  parentId: string | null;

  children: string[];

  /**
   * Widget content only.
   *
   * Never store presentation styles here.
   */
  props: Record<string, unknown>;

  /**
   * Visual presentation.
   */
  style: BuilderStyle;

  locked?: boolean;

  hidden?: boolean;
}

/* ==========================================================
   Theme
========================================================== */

export interface BuilderTheme {

  id: string;

  name: string;

  preset: string;

  tokens: Record<string, unknown>;
}

/* ==========================================================
   Metadata
========================================================== */

export interface BuilderMetadata {

  version: 2;

  title: string;

  createdAt: string;

  updatedAt: string;

  aiGenerated?: boolean;

  template?: string;

  industry?: string;
}

/* ==========================================================
   Blueprint
========================================================== */

export interface BuilderBlueprint {

  metadata: BuilderMetadata;

  theme: BuilderTheme;

  root: string;

  nodes: Record<string, BuilderNode>;
}