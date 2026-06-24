import { BuilderNode } from "../../types/blueprint";

export default function compileButton(node: BuilderNode) {
  return `<a href="${node.props.url}">${node.props.text}</a>`;
}