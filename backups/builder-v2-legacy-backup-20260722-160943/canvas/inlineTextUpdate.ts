import type { BuilderNode } from "../types/blueprint";

export function buildInlineTextProps(node: BuilderNode, value: string) {
  if (node.type === "button") {
    const currentLabel = String(node.props?.label ?? node.props?.text ?? "");
    const currentText = String(node.props?.text ?? node.props?.label ?? "");
    if (currentLabel === value && currentText === value) return null;
    return { ...node.props, text: value, label: value };
  }
  if (String(node.props?.text ?? "") === value) return null;
  return { ...node.props, text: value };
}
