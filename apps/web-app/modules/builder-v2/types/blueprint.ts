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
  | "smartHeader"
  | "leadForm"
  | "cardGrid"
  | "galleryLightbox"
  | "features"
  | "pricing"
  | "gallery"
  | "faq"
  | "testimonials"
  | "offerGrid"
  | "floatingWhatsApp"
  | "locationMap"
  | "smartFooter"
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

export type ResponsiveStyleValue<T> = T | ResponsiveValue<T>;

/* ==========================================================
   Style
========================================================== */

export interface BuilderStyle {
  color?: string;

  backgroundColor?: string;

  opacity?: number;

  fontFamily?: string;

  fontSize?: ResponsiveStyleValue<number>;

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

  width?: ResponsiveStyleValue<string | number>;

  height?: ResponsiveStyleValue<string | number>;

  minWidth?: ResponsiveStyleValue<string | number>;

  minHeight?: ResponsiveStyleValue<string | number>;

  maxWidth?: ResponsiveStyleValue<string | number>;

  maxHeight?: ResponsiveStyleValue<string | number>;

  margin?: ResponsiveStyleValue<string | number>;

  marginTop?: ResponsiveStyleValue<string | number>;

  marginBottom?: ResponsiveStyleValue<string | number>;

  marginLeft?: ResponsiveStyleValue<string | number>;

  marginRight?: ResponsiveStyleValue<string | number>;

  padding?: ResponsiveStyleValue<string | number>;

  paddingTop?: ResponsiveStyleValue<string | number>;

  paddingBottom?: ResponsiveStyleValue<string | number>;

  paddingLeft?: ResponsiveStyleValue<string | number>;

  paddingRight?: ResponsiveStyleValue<string | number>;

  borderRadius?: ResponsiveStyleValue<string | number>;

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

  gap?: ResponsiveStyleValue<string | number>;

  position?:
    | "static"
    | "relative"
    | "absolute"
    | "fixed"
    | "sticky";

  top?: ResponsiveStyleValue<string | number>;

  left?: ResponsiveStyleValue<string | number>;

  right?: ResponsiveStyleValue<string | number>;

  bottom?: ResponsiveStyleValue<string | number>;

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

  themeDemo?: {
    presetId: string;
    category: string;
    seededAt: string;
  };
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
