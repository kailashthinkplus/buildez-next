import { PageBlueprint, SiteBlueprint } from "@/modules/blueprint/types";

export interface RuntimeNode {
  id: string;
  type: string;
  props: any;
  layout: any;
  style: any;
  effects: any;
  children: RuntimeNode[];
}

export interface RuntimePage {
  id: string;
  path: string;
  nodes: RuntimeNode[];
}

export interface RuntimeSite {
  id: string;
  pages: Record<string, RuntimePage>;
  tokens: any;
}
