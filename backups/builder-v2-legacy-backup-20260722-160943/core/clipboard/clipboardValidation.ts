import type { BuilderBlueprint, BuilderNode, BuilderStyle, NodeType } from "../../types/blueprint";
import { isAllowedChildRelationship } from "../validation";
import type { BuilderNodeClipboardPayload, BuilderStyleClipboardPayload } from "./clipboardTypes";

const LAYOUT_NODE_TYPES = new Set<NodeType>(["page", "section", "container", "column", "grid", "footer", "custom"]);
const TEXT_NODE_TYPES = new Set<NodeType>(["heading", "text", "button"]);
const MEDIA_NODE_TYPES = new Set<NodeType>(["image", "video", "icon", "divider", "spacer"]);

const COMMON_STYLE_KEYS = new Set<string>([
  "color",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "backgroundAttachment",
  "opacity",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "borderRadius",
  "border",
  "boxShadow",
  "transition",
  "transform",
]);

const LAYOUT_STYLE_KEYS = new Set<string>([
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "gap",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "margin",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "overflow",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
]);

const MEDIA_STYLE_KEYS = new Set<string>([
  "objectFit",
  "aspectRatio",
  "width",
  "height",
  "maxWidth",
  "maxHeight",
]);

export function canPasteNodeIntoParent(
  payload: BuilderNodeClipboardPayload,
  parent: BuilderNode
): boolean {
  return isAllowedChildRelationship(parent.type, payload.rootType);
}

export function canPasteStyleToNode(
  payload: BuilderStyleClipboardPayload,
  targetType: NodeType
): boolean {
  return filterStyleForTarget(payload.style, payload.sourceType, targetType).compatible;
}

export function filterStyleForTarget(
  style: Partial<BuilderStyle>,
  sourceType: NodeType,
  targetType: NodeType
): {
  compatible: boolean;
  style: Partial<BuilderStyle>;
} {
  if (sourceType === targetType) {
    return { compatible: true, style: structuredClone(style) };
  }

  const allowed = new Set<string>(COMMON_STYLE_KEYS);

  if (LAYOUT_NODE_TYPES.has(sourceType) && LAYOUT_NODE_TYPES.has(targetType)) {
    LAYOUT_STYLE_KEYS.forEach((key) => allowed.add(key));
  }

  if (TEXT_NODE_TYPES.has(sourceType) && TEXT_NODE_TYPES.has(targetType)) {
    ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign", "textTransform", "textDecoration"].forEach((key) => allowed.add(key));
  }

  if (MEDIA_NODE_TYPES.has(sourceType) && MEDIA_NODE_TYPES.has(targetType)) {
    MEDIA_STYLE_KEYS.forEach((key) => allowed.add(key));
  }

  const filtered = Object.fromEntries(
    Object.entries(style).filter(([key]) => allowed.has(key))
  ) as Partial<BuilderStyle>;

  return {
    compatible: Object.keys(filtered).length > 0,
    style: filtered,
  };
}

export function findPasteParent(
  blueprint: BuilderBlueprint,
  targetNodeId: string,
  payload: BuilderNodeClipboardPayload
): {
  parentId: string;
  insertIndex: number;
} | null {
  const target = blueprint.nodes[targetNodeId];
  if (!target) return null;

  if (canPasteNodeIntoParent(payload, target)) {
    return {
      parentId: target.id,
      insertIndex: target.children.length,
    };
  }

  if (target.parentId) {
    const parent = blueprint.nodes[target.parentId];
    if (parent && canPasteNodeIntoParent(payload, parent)) {
      const index = parent.children.indexOf(target.id);
      return {
        parentId: parent.id,
        insertIndex: index >= 0 ? index + 1 : parent.children.length,
      };
    }
  }

  return null;
}
