import type { NodeType } from "../../types/blueprint";
import type { DesignGraphNode } from "../design-graph/schema";

const PRIMITIVE_MAP: Partial<Record<DesignGraphNode["type"], NodeType>> = {
  page: "page",
  section: "section",
  container: "container",
  heading: "heading",
  text: "text",
  button: "button",
  image: "image",
  svg: "icon",
};

export function mapDesignNodeToPrimitive(node: DesignGraphNode): NodeType {
  return PRIMITIVE_MAP[node.type] ?? "container";
}

export function isExactPrimitiveMapping(node: DesignGraphNode): boolean {
  return Boolean(PRIMITIVE_MAP[node.type]);
}
