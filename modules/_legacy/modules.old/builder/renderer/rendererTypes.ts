import { SectionBlueprint } from "@/modules/blueprint/types";

export interface RenderNode {
  id: string;
  type: string;
  props?: any;
  layout?: any;
  style?: any;
  effects?: any;
  children: RenderNode[];
}

export interface RendererProps {
  node: RenderNode;
  blueprint: SectionBlueprint;
}
