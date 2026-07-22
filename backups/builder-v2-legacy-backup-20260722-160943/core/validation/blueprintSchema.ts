import type { BuilderBlueprint, BuilderNode, NodeType } from "../../types/blueprint";
import { buildValidationResult, validationIssue, type BuilderValidationIssue, type BuilderValidationResult } from "./validationResult";

export const BUILDER_BLUEPRINT_VERSION = 2;

export const BUILDER_NODE_TYPES: readonly NodeType[] = Object.freeze([
  "page",
  "section",
  "container",
  "grid",
  "column",
  "heading",
  "text",
  "button",
  "image",
  "video",
  "icon",
  "divider",
  "spacer",
  "form",
  "hero",
  "smartHeader",
  "leadForm",
  "contactForm",
  "cardGrid",
  "galleryLightbox",
  "features",
  "pricing",
  "gallery",
  "masonryGallery",
  "faq",
  "accordion",
  "tabs",
  "testimonials",
  "testimonial",
  "statsCounter",
  "logoCloud",
  "team",
  "portfolio",
  "timeline",
  "offerGrid",
  "featureGrid",
  "floatingWhatsApp",
  "socialLinks",
  "locationMap",
  "smartFooter",
  "cta",
  "carousel",
  "productCarousel",
  "beforeAfter",
  "table",
  "countdown",
  "codeBlock",
  "embed",
  "blogGrid",
  "postList",
  "categoryList",
  "popupModal",
  "footer",
  "custom",
]);

export const CONTAINER_NODE_TYPES: readonly NodeType[] = Object.freeze([
  "page",
  "section",
  "container",
  "grid",
  "column",
  "hero",
  "features",
  "pricing",
  "gallery",
  "faq",
  "cta",
  "footer",
  "custom",
]);

export const SECTION_LIKE_NODE_TYPES: readonly NodeType[] = Object.freeze([
  "section",
  "hero",
  "smartHeader",
  "leadForm",
  "cardGrid",
  "galleryLightbox",
  "features",
  "pricing",
  "gallery",
  "faq",
  "testimonials",
  "offerGrid",
  "floatingWhatsApp",
  "locationMap",
  "smartFooter",
  "cta",
  "footer",
  "custom",
]);

const NODE_TYPE_SET = new Set<NodeType>(BUILDER_NODE_TYPES);
const CONTAINER_TYPE_SET = new Set<NodeType>(CONTAINER_NODE_TYPES);
const SECTION_TYPE_SET = new Set<NodeType>(SECTION_LIKE_NODE_TYPES);

export function isBuilderNodeType(value: unknown): value is NodeType {
  return typeof value === "string" && NODE_TYPE_SET.has(value as NodeType);
}

export function canNodeContainChildren(type: NodeType): boolean {
  return CONTAINER_TYPE_SET.has(type);
}

export function isSupportedWidgetType(type: NodeType): boolean {
  return NODE_TYPE_SET.has(type);
}

export function isAllowedChildRelationship(parentType: NodeType, childType: NodeType): boolean {
  if (parentType === "page") {
    return SECTION_TYPE_SET.has(childType);
  }

  if (!canNodeContainChildren(parentType)) {
    return false;
  }

  if (childType === "page") {
    return false;
  }

  return true;
}

export function expectedChildRelationshipLabel(parentType: NodeType): string {
  if (parentType === "page") {
    return "section or registered section-like node";
  }

  if (!canNodeContainChildren(parentType)) {
    return "no children";
  }

  return "any non-page Builder node";
}

export function validateBlueprintSchema(value: unknown): BuilderValidationResult {
  const issues: BuilderValidationIssue[] = [];

  if (!isPlainObject(value)) {
    return buildValidationResult([
      validationIssue("invalid-blueprint-shape", "Blueprint must be a plain object."),
    ]);
  }

  const blueprint = value as Partial<BuilderBlueprint>;

  if (!isPlainObject(blueprint.metadata)) {
    issues.push(validationIssue("missing-metadata", "Blueprint metadata is required.", { path: "metadata" }));
  } else {
    if (blueprint.metadata.version !== BUILDER_BLUEPRINT_VERSION) {
      issues.push(validationIssue("invalid-version", "Blueprint metadata.version must be 2.", { path: "metadata.version" }));
    }
    if (typeof blueprint.metadata.title !== "string") {
      issues.push(validationIssue("missing-title", "Blueprint metadata.title must be a string.", { path: "metadata.title" }));
    }
    if (typeof blueprint.metadata.createdAt !== "string") {
      issues.push(validationIssue("missing-created-at", "Blueprint metadata.createdAt must be a string.", { path: "metadata.createdAt" }));
    }
    if (typeof blueprint.metadata.updatedAt !== "string") {
      issues.push(validationIssue("missing-updated-at", "Blueprint metadata.updatedAt must be a string.", { path: "metadata.updatedAt" }));
    }
  }

  if (!isPlainObject(blueprint.theme)) {
    issues.push(validationIssue("missing-theme", "Blueprint theme is required.", { path: "theme" }));
  } else {
    if (typeof blueprint.theme.id !== "string" || !blueprint.theme.id) {
      issues.push(validationIssue("missing-theme-id", "Theme id must be a non-empty string.", { path: "theme.id" }));
    }
    if (typeof blueprint.theme.name !== "string") {
      issues.push(validationIssue("missing-theme-name", "Theme name must be a string.", { path: "theme.name" }));
    }
    if (typeof blueprint.theme.preset !== "string") {
      issues.push(validationIssue("missing-theme-preset", "Theme preset must be a string.", { path: "theme.preset" }));
    }
    if (!isPlainObject(blueprint.theme.tokens)) {
      issues.push(validationIssue("missing-theme-tokens", "Theme tokens must be a plain object.", { path: "theme.tokens" }));
    }
  }

  if (typeof blueprint.root !== "string" || !blueprint.root) {
    issues.push(validationIssue("missing-root", "Blueprint root id must be a non-empty string.", { path: "root" }));
  }

  if (!isPlainObject(blueprint.nodes)) {
    issues.push(validationIssue("missing-nodes", "Blueprint nodes must be a node map.", { path: "nodes" }));
    return buildValidationResult(issues);
  }

  const nodeIds = new Set<string>();
  for (const [nodeId, node] of Object.entries(blueprint.nodes)) {
    if (isPlainObject(node) && typeof node.id === "string") {
      if (nodeIds.has(node.id)) {
        issues.push(validationIssue("duplicate-node-id", "Node ids must be unique.", { nodeId, path: `nodes.${nodeId}.id` }));
      }
      nodeIds.add(node.id);
    }
    validateNodeShape(nodeId, node, issues);
  }

  return buildValidationResult(issues);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateNodeShape(nodeId: string, value: unknown, issues: BuilderValidationIssue[]): void {
  if (!isPlainObject(value)) {
    issues.push(validationIssue("invalid-node-shape", "Node must be a plain object.", { nodeId, path: `nodes.${nodeId}` }));
    return;
  }

  const node = value as Partial<BuilderNode>;

  if (typeof node.id !== "string" || !node.id) {
    issues.push(validationIssue("missing-node-id", "Node id must be a non-empty string.", { nodeId, path: `nodes.${nodeId}.id` }));
  } else if (node.id !== nodeId) {
    issues.push(validationIssue("node-id-mismatch", "Node map key must match node id.", { nodeId, path: `nodes.${nodeId}.id` }));
  }

  if (!isBuilderNodeType(node.type)) {
    issues.push(validationIssue("invalid-node-type", "Node type is not supported by Builder v2.", { nodeId, path: `nodes.${nodeId}.type` }));
  }

  if (node.parentId !== null && typeof node.parentId !== "string") {
    issues.push(validationIssue("invalid-parent-id", "Node parentId must be a string or null.", { nodeId, path: `nodes.${nodeId}.parentId` }));
  }

  if (!Array.isArray(node.children)) {
    issues.push(validationIssue("invalid-children", "Node children must be an array of node ids.", { nodeId, path: `nodes.${nodeId}.children` }));
  } else {
    for (const [index, childId] of node.children.entries()) {
      if (typeof childId !== "string" || !childId) {
        issues.push(validationIssue("invalid-child-id", "Child id must be a non-empty string.", { nodeId, path: `nodes.${nodeId}.children.${index}` }));
      }
    }
  }

  if (!isPlainObject(node.props)) {
    issues.push(validationIssue("missing-props", "Node props must be a plain object.", { nodeId, path: `nodes.${nodeId}.props` }));
  }

  if (!isPlainObject(node.style)) {
    issues.push(validationIssue("missing-style", "Node style must be a plain object.", { nodeId, path: `nodes.${nodeId}.style` }));
  }
}
