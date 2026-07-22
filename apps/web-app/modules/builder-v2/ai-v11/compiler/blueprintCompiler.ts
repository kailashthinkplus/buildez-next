import type {
  BuilderBlueprint,
  BuilderNode,
  BuilderStyle,
} from "../../types/blueprint";
import { createBuilderTheme } from "../../theme/defaultTheme";
import { canNodeContainChildren } from "../../core/validation/blueprintSchema";
import type {
  DesignGraph,
  DesignGraphNode,
  NormalizedStyle,
} from "../design-graph/schema";
import {
  fidelityDiagnostic,
  type FidelityDiagnostic,
} from "../diagnostics/fidelity";
import {
  isExactPrimitiveMapping,
  mapDesignNodeToPrimitive,
} from "./widgetMapper";
import { lowerResidualCss } from "../css-layer/lowering";
import { certifyBlueprintCustomCss } from "../security/cssCertification";

export type BlueprintCompilation = Readonly<{
  blueprint: BuilderBlueprint;
  diagnostics: readonly FidelityDiagnostic[];
  provenance: Readonly<Record<string, DesignGraphNode["provenance"]>>;
}>;

const NATIVE_STYLE_KEYS = new Set([
  "color",
  "backgroundColor",
  "backgroundImage",
  "opacity",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "whiteSpace",
  "pointerEvents",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderRadius",
  "border",
  "boxShadow",
  "display",
  "flexDirection",
  "flexWrap",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "order",
  "justifyContent",
  "alignItems",
  "gap",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "overflow",
  "zIndex",
  "objectFit",
  "objectPosition",
  "aspectRatio",
  "gridTemplateColumns",
  "gridColumn",
  "gridRow",
  "transition",
  "transform",
  "borderTopWidth",
  "borderTopStyle",
  "borderTopColor",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
]);

const RESPONSIVE_RESET_VALUES: Readonly<Record<string, string | number>> =
  Object.freeze({
    gridColumn: "auto",
    gridColumnStart: "auto",
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto",
  });

function propsFor(node: DesignGraphNode) {
  if (node.type === "heading")
    return {
      text: node.content ?? "",
      level: /^h[1-6]$/.test(node.provenance.sourceElement)
        ? node.provenance.sourceElement
        : "h2",
    };
  if (node.type === "text")
    return { text: node.content ?? "", html: node.content ?? "" };
  if (node.type === "button")
    return {
      text: node.content ?? "Button",
      label: node.content ?? "Button",
      url: node.attributes.href ?? "#",
      href: node.attributes.href ?? "#",
    };
  if (node.type === "image")
    return {
      src: node.attributes.src ?? "",
      alt: node.attributes.alt ?? "",
      mediaRole: node.media?.role,
    };
  if (node.type === "svg")
    return {
      glyph: node.semanticRole.includes("arrow") ? "arrow-right" : "star",
      iconName: node.semanticRole.includes("arrow") ? "arrow-right" : "star",
      ariaLabel: node.attributes["aria-label"] ?? "Icon",
      decorative: !node.attributes["aria-label"],
    };
  if (node.type === "section")
    return {
      semanticRole: node.semanticRole,
      container: "full",
      widthMode: "full",
      ...(node.attributes.id
        ? { id: node.attributes.id, anchorId: node.attributes.id }
        : {}),
    };
  if (node.type === "container")
    return {
      semanticRole: node.semanticRole,
      maxWidth: node.style.maxWidth ?? "none",
      ...(node.attributes.id
        ? { id: node.attributes.id, anchorId: node.attributes.id }
        : {}),
    };
  return {
    semanticRole: node.semanticRole,
    ...(node.attributes.id
      ? { id: node.attributes.id, anchorId: node.attributes.id }
      : {}),
  };
}

function mergeStyles(
  node: DesignGraphNode,
  diagnostics: FidelityDiagnostic[],
): BuilderStyle {
  const merged = { ...node.layout, ...node.style } as NormalizedStyle;
  const responsive = Object.fromEntries(
    Object.entries(node.responsive).map(([device, styles]) => [
      device,
      { ...(styles ?? {}) },
    ]),
  ) as Record<string, NormalizedStyle>;
  combineGridPlacement(merged);
  Object.values(responsive).forEach(combineGridPlacement);
  if (merged.borderColor && typeof merged.border === "string")
    merged.border = merged.border.replace(
      "currentColor",
      String(merged.borderColor),
    );
  if (merged.borderColor && merged.borderTopWidth)
    merged.borderTopColor = merged.borderColor;
  if (merged.borderColor && merged.borderRightWidth)
    merged.borderRightColor = merged.borderColor;
  if (merged.borderColor && merged.borderBottomWidth)
    merged.borderBottomColor = merged.borderColor;
  if (merged.borderColor && merged.borderLeftWidth)
    merged.borderLeftColor = merged.borderColor;
  delete merged.borderColor;
  const responsiveKeys = new Set(
    Object.values(responsive).flatMap((styles) => Object.keys(styles ?? {})),
  );
  for (const key of responsiveKeys) {
    const mobile = merged[key];
    const tablet = responsive.tablet?.[key] ?? mobile;
    const desktop = responsive.desktop?.[key] ?? tablet;
    if (mobile === undefined) {
      const reset = RESPONSIVE_RESET_VALUES[key];
      if (reset === undefined)
        diagnostics.push(
          fidelityDiagnostic({
            code: "RESPONSIVE_RESET_UNRESOLVED",
            severity: "warning",
            feature: key,
            affectedNode: node.id,
            message: `Responsive style '${key}' has no safe CSS initial reset.`,
            location: {
              file: node.provenance.sourceFile,
              line: node.provenance.line,
              column: node.provenance.column,
            },
            recommendedLowering:
              "Declare an explicit mobile base value or add a standards-derived reset mapping.",
          }),
        );
      merged[key] =
        reset === undefined
          ? ({ desktop } as never)
          : ({
              desktop,
              tablet: responsive.tablet?.[key] ?? reset,
              mobile: reset,
            } as never);
    } else {
      merged[key] = { desktop, tablet, mobile } as never;
    }
  }
  for (const key of Object.keys(merged)) {
    if (NATIVE_STYLE_KEYS.has(key)) continue;
    diagnostics.push(
      fidelityDiagnostic({
        code: "UNSUPPORTED_NATIVE_STYLE",
        severity: "warning",
        feature: key,
        affectedNode: node.id,
        message: `Normalized style '${key}' is not emitted by the existing Builder style resolver.`,
        location: {
          file: node.provenance.sourceFile,
          line: node.provenance.line,
          column: node.provenance.column,
        },
        recommendedLowering:
          key === "backdropFilter"
            ? "Milestone 2: lower through the sanitized AI CSS layer."
            : "Add a verified native resolver mapping before compilation.",
      }),
    );
    delete merged[key];
  }
  return merged as BuilderStyle;
}

function combineGridPlacement(style: NormalizedStyle) {
  if (style.gridColumnStart === undefined) return;
  const start = String(style.gridColumnStart);
  const span = String(style.gridColumn ?? "").match(/span\s+(\d+)/)?.[1];
  style.gridColumn = span ? `${start} / span ${span}` : start;
  delete style.gridColumnStart;
}

function emittedNodeType(graph: DesignGraph, node: DesignGraphNode) {
  const mapped = mapDesignNodeToPrimitive(node);
  if (
    mapped === "button" &&
    node.children.some((id) => {
      const child = graph.nodes[id];
      return child && !["text", "heading", "svg"].includes(child.type);
    })
  )
    return "container" as const;
  return mapped;
}

export function compileDesignGraphToBlueprint(
  graph: DesignGraph,
): BlueprintCompilation {
  const diagnostics: FidelityDiagnostic[] = [...graph.diagnostics];
  const nodes: Record<string, BuilderNode> = {};
  const provenance: Record<string, DesignGraphNode["provenance"]> = {};
  const rootNode = graph.nodes[graph.rootId];
  const rootChildReplacements = new Map<string, string>();
  const parentOverrides = new Map<string, string>();
  const syntheticRootSections: BuilderNode[] = [];
  (rootNode?.children ?? []).forEach((childId, index) => {
    const child = graph.nodes[childId];
    if (!child || emittedNodeType(graph, child) === "section") return;
    const wrapperId = `dg.root-section.${String(index + 1).padStart(2, "0")}`;
    rootChildReplacements.set(childId, wrapperId);
    parentOverrides.set(childId, wrapperId);
    syntheticRootSections.push({
      id: wrapperId,
      type: "section",
      name: child.semanticRole === "document-content" ? "content-section" : child.semanticRole,
      parentId: graph.rootId,
      children: [childId],
      props: { semanticRole: "content-section", container: "full", widthMode: "full", layout: "block" },
      style: { display: "block", width: "100%" },
    });
    provenance[wrapperId] = child.provenance;
    diagnostics.push(fidelityDiagnostic({
      code: "ROOT_CONTENT_SECTION_WRAPPED",
      severity: "warning",
      feature: child.type,
      affectedNode: childId,
      message: "Top-level visual content was placed in an editable section to satisfy the Builder page structure.",
      location: { file: child.provenance.sourceFile, line: child.provenance.line, column: child.provenance.column },
      recommendedLowering: "Emit semantic sections directly beneath the generated page root.",
    }));
  });
  const sourceNodes: DesignGraphNode[] = [];
  const collect = (id: string) => {
    const node = graph.nodes[id];
    if (!node) return;
    sourceNodes.push(node);
    const type = emittedNodeType(graph, node);
    if (!canNodeContainChildren(type)) return;
    node.children.forEach(collect);
  };
  collect(graph.rootId);
  for (const node of sourceNodes) {
    if (!isExactPrimitiveMapping(node))
      diagnostics.push(
        fidelityDiagnostic({
          code: "GENERIC_CONTAINER_LOWERING",
          severity: "warning",
          feature: node.type,
          affectedNode: node.id,
          message: `Design node '${node.type}' is represented as a primitive container in Milestone 1.`,
          location: {
            file: node.provenance.sourceFile,
            line: node.provenance.line,
            column: node.provenance.column,
          },
          recommendedLowering:
            "Add a primitive-only semantic lowering while preserving the original child hierarchy.",
        }),
      );
    const type = emittedNodeType(graph, node);
    const style = mergeStyles(node, diagnostics);
    if (type === "container" && style.display === undefined)
      style.display = "block";
    if (type === "button") {
      style.display ??= "inline";
      style.backgroundColor ??= "transparent";
      style.color ??= "inherit";
      style.padding ??= 0;
      style.borderRadius ??= 0;
      style.border ??= "0";
    }
    const props = propsFor(node) as Record<string, unknown>;
    const css = lowerResidualCss(node);
    diagnostics.push(...css.diagnostics);
    if (css.customCss)
      props.advanced = {
        customCss: css.customCss,
        designLayerReasons: css.reasons,
      };
    // Existing renderers recognize this legacy discriminator; style remains canonical too.
    if ((type === "container" || type === "section") && style.display)
      props.layout = style.display;
    const children = canNodeContainChildren(type)
      ? node.id === graph.rootId
        ? node.children.map((id) => rootChildReplacements.get(id) ?? id)
        : [...node.children]
      : [];
    if (!canNodeContainChildren(type) && node.children.length)
      diagnostics.push(
        fidelityDiagnostic({
          code: "INLINE_CHILDREN_FLATTENED",
          severity: "warning",
          feature: node.type,
          affectedNode: node.id,
          message: `Nested inline content was flattened into the editable ${type} node because Builder leaf widgets cannot contain children.`,
          location: { file: node.provenance.sourceFile, line: node.provenance.line, column: node.provenance.column },
          recommendedLowering: "Keep nested inline markup represented by the parent widget's text/html content.",
        }),
      );
    nodes[node.id] = {
      id: node.id,
      type,
      name: node.semanticRole,
      parentId: parentOverrides.get(node.id) ?? node.parentId,
      children,
      props,
      style,
    };
    provenance[node.id] = node.provenance;
  }
  for (const section of syntheticRootSections) nodes[section.id] = section;
  const now = "2026-07-16T00:00:00.000Z";
  const blueprint: BuilderBlueprint = {
    metadata: {
      version: 2,
      title: graph.metadata.componentName,
      createdAt: now,
      updatedAt: now,
      aiGenerated: true,
      template: "ai-v11-m2-design-preservation",
    },
    theme: createBuilderTheme(),
    root: graph.rootId,
    nodes,
  };
  const cssViolations = certifyBlueprintCustomCss(blueprint);
  if (cssViolations.length)
    throw new Error(
      `V11_UNSAFE_BLUEPRINT_CSS: ${cssViolations
        .map((item) => `${item.nodeId}:${item.construct}`)
        .join(", ")}`,
    );
  return Object.freeze({
    blueprint,
    diagnostics: Object.freeze(diagnostics),
    provenance: Object.freeze(provenance),
  });
}
