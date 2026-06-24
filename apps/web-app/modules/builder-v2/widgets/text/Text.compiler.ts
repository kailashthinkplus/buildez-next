import { BuilderNode } from "../../types/blueprint";

export default function compileText(node: BuilderNode) {
  return `<p>${node.props.text ?? ""}</p>`;
}