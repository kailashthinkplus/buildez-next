import type { FidelityDiagnostic } from "../diagnostics/fidelity";

export type DesignNodeType =
  | "page"
  | "section"
  | "container"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "picture"
  | "video"
  | "list"
  | "listItem"
  | "svg";

export type DesignProvenance = Readonly<{
  sourceFile: string;
  line: number;
  column: number;
  sourceElement: string;
  nearestSemanticSection?: string;
  localComponentOrigin?: string;
}>;

export type NormalizedStyle = Record<string, string | number>;
export type ResponsiveStyles = Partial<
  Record<"tablet" | "desktop", NormalizedStyle>
>;

export type ResidualEffect = Readonly<{
  selector: "self" | "::before" | "::after" | ":hover" | ":focus-visible";
  declarations: Readonly<Record<string, string>>;
  reason: string;
}>;

export type MediaSemantics = Readonly<{
  role: string;
  src?: string;
  alt?: string;
  objectFit?: string;
  objectPosition?: string;
  aspectRatio?: string;
  opacity?: number;
  foreground: boolean;
  background: boolean;
  overlayRelationship?: string;
  responsiveVisibility: Readonly<Record<string, boolean>>;
}>;

export type DesignGraphNode = Readonly<{
  id: string;
  type: DesignNodeType;
  semanticRole: string;
  parentId: string | null;
  children: readonly string[];
  layout: Readonly<NormalizedStyle>;
  style: Readonly<NormalizedStyle>;
  responsive: Readonly<ResponsiveStyles>;
  effects: readonly ResidualEffect[];
  embeddedCss?: string;
  media?: MediaSemantics;
  content?: string;
  attributes: Readonly<Record<string, string>>;
  provenance: DesignProvenance;
}>;

export type DesignGraph = Readonly<{
  version: "0";
  id: string;
  rootId: string;
  nodes: Readonly<Record<string, DesignGraphNode>>;
  diagnostics: readonly FidelityDiagnostic[];
  metadata: Readonly<{ sourceFile: string; componentName: string }>;
}>;
