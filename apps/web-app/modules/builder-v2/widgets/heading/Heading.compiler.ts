import { BuilderNode } from "../../types/blueprint";

export default function compileHeading(node: BuilderNode) {
  const tag = node.props.level || "h2";
  const text = node.props.text || "";

  return `<${tag}>${text}</${tag}>`;
}