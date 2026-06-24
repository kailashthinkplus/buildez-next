import { SectionBlueprint } from "@/modules/blueprint/types";
import { RenderNode } from "./rendererTypes";

export function createRenderTree(
  section: SectionBlueprint
): RenderNode {
  return {
    id: section.id,
    type: section.type,
    component: null,
    children: [],
    data: {},
  };
}
