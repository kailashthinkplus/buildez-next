import { BuilderNode } from "../../types/blueprint";

export default function compilePage(node: BuilderNode) {
  return `<main id="${node.id}"></main>`;
}