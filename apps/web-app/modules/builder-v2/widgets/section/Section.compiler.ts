import { BuilderNode } from "../../types/blueprint";

export default function compileSection(node: BuilderNode) {
  return `<section id="${node.id}"></section>`;
}