// ----------------------------------------------------------------------------------------------------
// createNodeFromSchema.ts (FINAL PRODUCTION VERSION)
// ----------------------------------------------------------------------------------------------------
// Purpose:
//  - Convert WIDGET_CONFIG schema into normalized RFC-004 BuilderNode
//  - Used by BlockMenu, inspector, DnD, AI engine, Section/Column logic
//  - Fully compatible with new useBlueprintStore + V3 builder
// ----------------------------------------------------------------------------------------------------

"use client";

import { nanoid } from "nanoid";
import WIDGET_CONFIG from "@/app/app/(builder)v1/[siteSlug]/[pageSlugWithId]/inspector/widgets/config"; 
// NOTE: path may change based on your new V3 folder. 
// If V2 widgets/config.ts is moved, update import accordingly.

import type { BuilderNode } from "@/modules/builder/state/useBlueprintStore";

// Minimal RFC-004 empty node template
function baseNode(type: string): BuilderNode {
  return {
    id: nanoid(),
    type,

    props: {},
    style: {},
    layout: {},
    effects: {},

    children: [],
  };
}

// ----------------------------------------------------------------------------------------------------
// APPLY FIELD DEFAULTS FROM WIDGET_CONFIG
// ----------------------------------------------------------------------------------------------------
function applyFieldDefaults(node: BuilderNode, schema: any) {
  if (!schema?.fields) return node;

  schema.fields.forEach((field: any) => {
    // Skip repeaters here (handled separately)
    if (field.type === "repeater") {
      node.props[field.key] = [];
      return;
    }

    // Simple primitives
    if (field.default !== undefined) {
      node.props[field.key] = field.default;
    } else {
      // fallback defaults
      switch (field.type) {
        case "text":
        case "textarea":
          node.props[field.key] = "";
          break;

        case "number":
          node.props[field.key] = 0;
          break;

        case "color":
          node.props[field.key] = "#000000";
          break;

        case "select":
          node.props[field.key] = field.options?.[0]?.value || "";
          break;

        case "image":
          node.props[field.key] = "";
          break;

        default:
          node.props[field.key] = null;
      }
    }
  });

  return node;
}

// ----------------------------------------------------------------------------------------------------
// APPLY STYLE PRESETS (OPTIONAL, IF PROVIDED IN CONFIG)
// ----------------------------------------------------------------------------------------------------
function applyStyleDefaults(node: BuilderNode, schema: any) {
  if (!schema?.style) return node;
  Object.assign(node.style, schema.style);
  return node;
}

// ----------------------------------------------------------------------------------------------------
// APPLY LAYOUT PRESETS (OPTIONAL, IF PROVIDED IN CONFIG)
// ----------------------------------------------------------------------------------------------------
function applyLayoutDefaults(node: BuilderNode, schema: any) {
  if (!schema?.layout) return node;
  Object.assign(node.layout, schema.layout);
  return node;
}

// ----------------------------------------------------------------------------------------------------
// APPLY EFFECTS PRESETS (OPTIONAL, IF PROVIDED IN CONFIG)
// ----------------------------------------------------------------------------------------------------
function applyEffectsDefaults(node: BuilderNode, schema: any) {
  if (!schema?.effects) return node;
  Object.assign(node.effects, schema.effects);
  return node;
}

// ----------------------------------------------------------------------------------------------------
// CREATE CHILDREN FOR COMPLEX BLOCKS (Hero, Features, Testimonials, etc.)
// ----------------------------------------------------------------------------------------------------
// If schema defines a children preset: 
// {
//    children: [
//       { type: "heading", props: {...}, layout:{...}, style:{...} },
//       { type: "button", props: {...} }
//    ]
// }
function applyChildrenDefaults(node: BuilderNode, schema: any) {
  if (!schema?.children) return node;

  node.children = schema.children.map((childSchema: any) => {
    const childNode = baseNode(childSchema.type);

    // Attach any pre-defined props/style/layout/effects
    childNode.props = childSchema.props || {};
    childNode.style = childSchema.style || {};
    childNode.layout = childSchema.layout || {};
    childNode.effects = childSchema.effects || {};
    childNode.children = childSchema.children || [];

    return childNode;
  });

  return node;
}

// ----------------------------------------------------------------------------------------------------
// MAIN FACTORY FUNCTION
// ----------------------------------------------------------------------------------------------------
export function createNodeFromSchema(type: string): BuilderNode {
  // Load V2 widget schema
  const schema = WIDGET_CONFIG[type];

  // If widget not found → create minimal node
  if (!schema) {
    return baseNode(type);
  }

  // Create base node
  let node = baseNode(type);

  // Apply schema-driven defaults
  node = applyFieldDefaults(node, schema);
  node = applyStyleDefaults(node, schema);
  node = applyLayoutDefaults(node, schema);
  node = applyEffectsDefaults(node, schema);
  node = applyChildrenDefaults(node, schema);

  return node;
}

// ----------------------------------------------------------------------------------------------------
// END OF FILE
// ----------------------------------------------------------------------------------------------------
