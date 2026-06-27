// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/resolveBlueprintTree.ts

interface BlueprintNode {
  id: string;
  type: string;
  props?: any;
  children?: string[] | BlueprintNode[];
}

interface BlueprintData {
  page?: BlueprintNode;
  root?: string;
  nodes?: Record<string, BlueprintNode>;
}

/**
 * 🔑 Converts ID-based blueprint into a real + SAFE tree
 * 
 * Transforms flat blueprint structure (children as string IDs) into
 * nested tree structure (children as objects). Essential for:
 * - Public page rendering
 * - Preview API
 * - Publishing workflow
 * - Snapshot generation
 * 
 * Features:
 * - Circular reference protection
 * - Safe defaults (props, children always present)
 * - Design token preservation
 * - Type safety
 * 
 * @param data - Blueprint data with page node and optional flat nodes map
 * @returns Fully resolved blueprint tree
 */
export function resolveBlueprintTree(
  data: BlueprintData
): BlueprintNode {
  const nodes = data?.nodes ?? {};
  const page = data?.page ?? (data?.root ? nodes[data.root] : undefined);

  if (!page) {
    console.warn("[resolveBlueprintTree] No page node provided");
    return {
      id: "empty-page",
      type: "page",
      props: {},
      children: [],
    };
  }

  const visited = new Set<string>();

  function resolve(node: BlueprintNode): BlueprintNode {
    // Prevent circular references
    if (visited.has(node.id)) {
      console.warn(`[resolveBlueprintTree] Circular reference detected: ${node.id}`);
      return {
        ...node,
        props: node.props ?? {},
        children: [],
      };
    }

    visited.add(node.id);

    const rawChildren = node.children ?? [];

    // Resolve children (convert string IDs to objects)
    const resolvedChildren = rawChildren
      .map((child: any) => {
        // Case 1: Child is a string ID (lookup in nodes map)
        if (typeof child === "string") {
          const found = nodes[child];
          if (!found) {
            console.warn(`[resolveBlueprintTree] Node not found: ${child}`);
            return null;
          }
          return resolve(found);
        }

        // Case 2: Child is already an object
        if (typeof child === "object" && child?.id) {
          return resolve(child);
        }

        // Case 3: Invalid child
        console.warn(`[resolveBlueprintTree] Invalid child:`, child);
        return null;
      })
      .filter(Boolean) as BlueprintNode[];

    // Return resolved node with guaranteed props and children
    return {
      ...node,

      // 🔐 CRITICAL: never allow undefined props
      // Preserves designTokens, style, __aiGeneratedStyles, etc.
      props: node.props ?? {},

      // 🔐 Always resolved children array
      children: resolvedChildren,
    };
  }

  // Start resolution from page node
  const resolvedTree = resolve(page);

  // ✅ ENHANCEMENT: Ensure design tokens are at root level
  // This handles cases where tokens might be in data.designTokens
  if (!resolvedTree.props.designTokens && page.props?.designTokens) {
    resolvedTree.props.designTokens = page.props.designTokens;
  }

  return resolvedTree;
}

/**
 * Type guard to check if blueprint data is valid
 */
export function isValidBlueprintData(data: any): data is BlueprintData {
  return !!(
    data &&
    typeof data === "object" &&
    ((data.page &&
      typeof data.page === "object" &&
      data.page.id &&
      data.page.type) ||
      (typeof data.root === "string" &&
        data.nodes &&
        typeof data.nodes === "object" &&
        data.nodes[data.root]))
  );
}

/**
 * Get all node IDs in blueprint (for debugging)
 */
export function getBlueprintNodeIds(data: BlueprintData): string[] {
  const ids: string[] = [];
  
  function collect(node: BlueprintNode) {
    ids.push(node.id);
    (node.children ?? []).forEach((child: any) => {
      if (typeof child === "object" && child?.id) {
        collect(child);
      }
    });
  }
  
  if (data.page) {
    collect(data.page);
  }
  
  return ids;
}

/**
 * Count total nodes in blueprint (for analytics)
 */
export function countBlueprintNodes(tree: BlueprintNode): number {
  let count = 1; // Count current node
  
  (tree.children ?? []).forEach((child) => {
    if (typeof child === "object" && child.id) {
      count += countBlueprintNodes(child);
    }
  });
  
  return count;
}

/**
 * Validate blueprint tree structure (for debugging)
 */
export function validateBlueprintTree(tree: BlueprintNode): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  function validate(node: BlueprintNode, path: string = "root") {
    // Check required fields
    if (!node.id) {
      errors.push(`${path}: Missing id`);
    }
    if (!node.type) {
      errors.push(`${path}: Missing type`);
    }

    // Check for duplicate IDs
    if (seenIds.has(node.id)) {
      errors.push(`${path}: Duplicate id "${node.id}"`);
    } else {
      seenIds.add(node.id);
    }

    // Check props
    if (node.props !== undefined && typeof node.props !== "object") {
      errors.push(`${path}: props must be an object`);
    }

    // Check children
    if (node.children !== undefined) {
      if (!Array.isArray(node.children)) {
        errors.push(`${path}: children must be an array`);
      } else {
        node.children.forEach((child, index) => {
          if (typeof child === "string") {
            errors.push(`${path}.children[${index}]: Unresolved string ID "${child}"`);
          } else if (typeof child === "object" && child.id) {
            validate(child, `${path}.children[${index}]`);
          } else {
            errors.push(`${path}.children[${index}]: Invalid child`);
          }
        });
      }
    }
  }

  validate(tree);

  return {
    valid: errors.length === 0,
    errors,
  };
}
