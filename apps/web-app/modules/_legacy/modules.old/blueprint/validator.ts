// apps/web-app/modules/blueprint/validator.ts
import { ALLOWED_TYPES } from "./schema";
import { BuilderNode } from "./types";

export const validateNode = (node: BuilderNode): boolean => {
  if (!ALLOWED_TYPES.includes(node.type)) {
    console.warn("Invalid node type:", node.type);
    return false;
  }
  return true;
};

export const validateTree = (node: BuilderNode): boolean => {
  if (!validateNode(node)) return false;
  return node.children.every((c) => validateTree(c));
};
