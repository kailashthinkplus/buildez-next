// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/engine/blueprintSanitizer.ts

import type { BlueprintNode } from "@/modules/builder/types";

/**
 * BLUEPRINT SANITIZER — V7
 * 
 * Validates blueprint structure while preserving AI-generated content.
 * 
 * Rules:
 * - AI-generated content (__source === "ai") bypasses all restrictions
 * - User-edited content validates against grammar rules
 * - Preserves visual properties and modern design elements
 */

/* ============================================================
   ALLOWED CHILDREN (STRUCTURAL GRAMMAR)
============================================================ */

const ALLOWED_CHILDREN: Record<string, string[]> = {
  page: ["section"],
  
  section: ["container"],
  
  container: ["column", "container"], // ✅ Allow nested containers
  
  column: [
    "heading",
    "text",
    "image",
    "button",
    "icon",        // ✅ Added icon
    "spacer",
    "container",   // ✅ Allow nested containers (for cards)
  ],
};

/* ============================================================
   ALLOWED PROPS (PROPERTY WHITELIST)
============================================================ */

const ALLOWED_PROPS: Record<string, string[]> = {
  page: [
    "title",
    "description",
    "designTokens",
    "nodeStyles",
    "logoUrl",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  section: [
    "sectionName",
    "intent",
    "role",
    "backgroundVariant",
    "background",
    "backgroundColor",
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "margin",
    "marginTop",
    "marginBottom",
    "style",
    "__darkSection",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  container: [
    "layout",
    "visual",
    "gap",
    "columns",
    "maxWidth",
    "minWidth",
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "margin",
    "marginTop",
    "marginBottom",
    "align",
    "justify",
    "wrap",
    "background",
    "backgroundColor",
    "borderRadius",
    "boxShadow",
    "border",
    "backdropFilter",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  column: [
    "width",
    "minWidth",
    "maxWidth",
    "flex",
    "align",
    "justify",
    "gap",
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "margin",
    "marginTop",
    "marginBottom",
    "background",
    "backgroundColor",
    "borderRadius",
    "boxShadow",
    "border",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  heading: [
    "text",
    "level",
    "emphasis",
    "variant",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "color",
    "textAlign",
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "padding",
    "textShadow",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  text: [
    "text",
    "html",
    "role", // ✅ For subheading, lead text, etc.
    "variant",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "color",
    "textAlign",
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
    "padding",
    "opacity",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  image: [
    "src",
    "alt",
    "radius",
    "borderRadius",
    "aspectRatio",
    "objectFit",
    "width",
    "height",
    "maxWidth",
    "maxHeight",
    "boxShadow",
    "border",
    "filter",
    "opacity",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  button: [
    "label",
    "href",
    "variant",
    "size",
    "disabled",
    "fontSize",
    "fontWeight",
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "borderRadius",
    "background",
    "backgroundColor",
    "color",
    "border",
    "boxShadow",
    "transition",
    "cursor",
    "whiteSpace",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  icon: [
    "icon",
    "variant",
    "size",
    "color",
    "fontSize",
    "background",
    "backgroundColor",
    "borderRadius",
    "padding",
    "boxShadow",
    "opacity",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
  
  spacer: [
    "height",
    "width",
    "style",
    "__inspectorStyle",
    "__aiGeneratedStyles",
  ],
};

/* ============================================================
   SANITIZE PROPS
============================================================ */

function sanitizeProps(
  type: string,
  props?: Record<string, any>
): Record<string, any> {
  if (!props) return {};
  
  const allowed = ALLOWED_PROPS[type];
  
  // Unknown type - keep all props (defensive)
  if (!allowed) {
    console.warn(`[Sanitizer] Unknown node type: ${type}, preserving all props`);
    return props;
  }
  
  const clean: Record<string, any> = {};
  
  // Copy allowed props
  for (const key of allowed) {
    if (key in props) {
      clean[key] = props[key];
    }
  }
  
  // Always preserve special props
  if (props.__inspectorStyle) {
    clean.__inspectorStyle = props.__inspectorStyle;
  }
  if (props.__aiGeneratedStyles) {
    clean.__aiGeneratedStyles = props.__aiGeneratedStyles;
  }
  if (props.__source) {
    clean.__source = props.__source;
  }
  
  return clean;
}

/* ============================================================
   SANITIZE CHILDREN
============================================================ */

function sanitizeChildren(
  parentType: string,
  children: BlueprintNode[] | undefined,
  isAIGenerated: boolean
): BlueprintNode[] {
  if (!children || !Array.isArray(children)) return [];
  
  const allowedChildren = ALLOWED_CHILDREN[parentType];
  
  // Unknown parent type - allow all children (defensive)
  if (!allowedChildren) {
    console.warn(`[Sanitizer] Unknown parent type: ${parentType}, allowing all children`);
    return children.map(sanitizeBlueprint);
  }
  
  return children
    .filter((child) => {
      // AI-generated content bypasses validation
      if (isAIGenerated) return true;
      
      // Validate child type
      const isAllowed = allowedChildren.includes(child.type);
      if (!isAllowed) {
        console.warn(
          `[Sanitizer] Removing invalid child type "${child.type}" from parent "${parentType}"`
        );
      }
      return isAllowed;
    })
    .map(sanitizeBlueprint);
}

/* ============================================================
   MAIN SANITIZER
============================================================ */

export function sanitizeBlueprint(node: BlueprintNode): BlueprintNode {
  // Check if this node is AI-generated
  const isAIGenerated = (node as any).__source === "ai" || 
                        (node.props as any)?.__source === "ai";
  
  // Log AI-generated nodes for debugging
  if (isAIGenerated) {
    console.log(`[Sanitizer] Preserving AI-generated node: ${node.type} (${node.id})`);
  }
  
  // Sanitize props (AI nodes keep all props)
  const sanitizedProps = isAIGenerated 
    ? node.props 
    : sanitizeProps(node.type, node.props);
  
  // Sanitize children recursively
  const sanitizedChildren = sanitizeChildren(
    node.type,
    node.children,
    isAIGenerated
  );
  
  return {
    ...node,
    props: sanitizedProps,
    children: sanitizedChildren,
  };
}

/* ============================================================
   VALIDATION UTILITIES
============================================================ */

/**
 * Check if a blueprint is valid without modifying it
 */
export function validateBlueprint(node: BlueprintNode): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  function walk(n: BlueprintNode, path: string): void {
    const allowedChildren = ALLOWED_CHILDREN[n.type];
    const allowedProps = ALLOWED_PROPS[n.type];
    
    // Check if type is known
    if (!allowedChildren) {
      errors.push(`${path}: Unknown node type "${n.type}"`);
    }
    
    // Check children types
    if (n.children && allowedChildren) {
      n.children.forEach((child, i) => {
        if (!allowedChildren.includes(child.type)) {
          errors.push(
            `${path}: Invalid child type "${child.type}" in "${n.type}"`
          );
        }
        walk(child, `${path}.children[${i}]`);
      });
    }
    
    // Check props
    if (n.props && allowedProps) {
      Object.keys(n.props).forEach((key) => {
        if (
          !key.startsWith("__") && 
          !allowedProps.includes(key)
        ) {
          errors.push(
            `${path}: Invalid prop "${key}" in "${n.type}"`
          );
        }
      });
    }
  }
  
  walk(node, "root");
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Count nodes by type for debugging
 */
export function countNodeTypes(node: BlueprintNode): Record<string, number> {
  const counts: Record<string, number> = {};
  
  function walk(n: BlueprintNode): void {
    counts[n.type] = (counts[n.type] || 0) + 1;
    if (n.children) {
      n.children.forEach(walk);
    }
  }
  
  walk(node);
  return counts;
}
