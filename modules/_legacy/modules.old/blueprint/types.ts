// apps/web-app/modules/blueprint/types.ts
import { nanoid } from "nanoid";

export interface BuilderNode {
  id: string;
  type: string;
  props: {
    data?: Record<string, any>;
    style?: Record<string, any>;
    layout?: Record<string, any>;
  };
  children: BuilderNode[];
}

export const ROOT_NODE_ID = "root";

export const ROOT: BuilderNode = {
  id: ROOT_NODE_ID,
  type: "root",
  props: {},
  children: [],
};

export const createNode = (type: string, props = {}, children: BuilderNode[] = []): BuilderNode => {
  return {
    id: nanoid(),
    type,
    props,
    children,
  };
};
