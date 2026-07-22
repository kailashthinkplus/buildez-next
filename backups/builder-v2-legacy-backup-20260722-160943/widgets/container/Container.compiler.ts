import { BuilderNode } from "../../types/blueprint";

export default function compileContainer(node: BuilderNode) {
  return `<div id="${node.id}"></div>`;
}