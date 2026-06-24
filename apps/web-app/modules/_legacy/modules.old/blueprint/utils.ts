// apps/web-app/modules/blueprint/utils.ts
import { BuilderNode } from "./types";
import { log } from "@/modules/builder/utils/log";

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const findNode = (node: BuilderNode, id: string): BuilderNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

export const findParent = (node: BuilderNode, id: string): BuilderNode | null => {
  for (const child of node.children) {
    if (child.id === id) return node;
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
};

export const removeNode = (root: BuilderNode, id: string): BuilderNode | null => {
  const parent = findParent(root, id);
  if (!parent) return null;

  const index = parent.children.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const [removed] = parent.children.splice(index, 1);

  log("Blueprint", "removeNode", { id });

  return removed;
};

export const normalizeNode = (node: BuilderNode): BuilderNode => {
  return {
    ...node,
    children: Array.isArray(node.children) ? node.children : [],
    props: {
      data: node.props?.data || {},
      style: node.props?.style || {},
      layout: node.props?.layout || {},
    },
  };
};

export const normalizeTree = (node: BuilderNode) => {
  node.children = node.children || [];
  node.children = node.children.map((c) => normalizeNode(c));
  node.children.forEach((child) => normalizeTree(child));
};
