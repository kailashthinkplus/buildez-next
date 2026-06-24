// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/generateRuntimeSnapshot.ts

import { resolveBlueprintTree } from "./resolveBlueprintTree";
import { generateRuntimeCSS } from "./generateRuntimeCSS";
import { bindDesignTokensToCSS } from "./designTokens/bindDesignTokensToCSS";
import { renderNodeToHtml } from "./renderNodeToHtml";
import type { BlueprintNode } from "@/modules/builder/types";

/**
 * Blueprint data (flat format from database)
 */
interface BlueprintData {
  page: BlueprintNode;
  nodes?: Record<string, BlueprintNode>;
}

/**
 * Runtime snapshot output
 */
interface RuntimeSnapshot {
  html: string;
  css: string;
  generatedAt: Date;
  stats: {
    nodeCount: number;
    hasDesignTokens: boolean;
    device: string;
  };
}

/**
 * Generate runtime snapshot (HTML + CSS)
 * 
 * Used for:
 * - Publishing pages
 * - Preview generation
 * - Static exports
 * - Performance snapshots
 * 
 * Process:
 * 1. Resolve flat blueprint → nested tree
 * 2. Render tree → HTML with inline styles
 * 3. Generate CSS (base styles + design tokens)
 * 4. Return complete snapshot
 * 
 * @param data - Blueprint data (flat format)
 * @param device - Target device (default: desktop)
 * @returns Runtime snapshot with HTML, CSS, and metadata
 */
export function generateRuntimeSnapshot(
  data: BlueprintData,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): RuntimeSnapshot {
  if (!data?.page) {
    console.warn("[generateRuntimeSnapshot] No page node provided");
    return {
      html: "",
      css: "",
      generatedAt: new Date(),
      stats: {
        nodeCount: 0,
        hasDesignTokens: false,
        device,
      },
    };
  }

  // 1️⃣ Resolve ID-based blueprint → real tree
  const resolvedTree = resolveBlueprintTree(data);

  // Extract design tokens
  const designTokens = resolvedTree.props?.designTokens;

  // 2️⃣ Generate HTML using canonical renderer
  const html = renderNodeToHtml(resolvedTree, device, designTokens);

  // 3️⃣ Generate CSS
  const baseCSS = generateRuntimeCSS();
  const tokenCSS = designTokens
    ? bindDesignTokensToCSS(designTokens)
    : "";

  const css = `${tokenCSS}\n\n${baseCSS}`;

  // 4️⃣ Calculate stats
  const nodeCount = countNodes(resolvedTree);

  return {
    html,
    css,
    generatedAt: new Date(),
    stats: {
      nodeCount,
      hasDesignTokens: !!designTokens,
      device,
    },
  };
}

/**
 * Generate snapshot for all devices (responsive bundle)
 */
export function generateRuntimeSnapshotResponsive(
  data: BlueprintData
): {
  desktop: RuntimeSnapshot;
  tablet: RuntimeSnapshot;
  mobile: RuntimeSnapshot;
} {
  return {
    desktop: generateRuntimeSnapshot(data, "desktop"),
    tablet: generateRuntimeSnapshot(data, "tablet"),
    mobile: generateRuntimeSnapshot(data, "mobile"),
  };
}

/**
 * Generate snapshot as complete HTML document
 */
export function generateRuntimeSnapshotDocument(
  data: BlueprintData,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): string {
  const snapshot = generateRuntimeSnapshot(data, device);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="BuildEZ">
  <title>BuildEZ Page</title>
  <style>
${snapshot.css}
  </style>
</head>
<body>
${snapshot.html}
</body>
</html>`.trim();
}

/**
 * Helper: Count total nodes in tree
 */
function countNodes(node: BlueprintNode): number {
  let count = 1;
  
  (node.children ?? []).forEach((child) => {
    if (typeof child === "object" && child.id) {
      count += countNodes(child);
    }
  });
  
  return count;
}

/**
 * Helper: Validate snapshot quality
 */
export function validateRuntimeSnapshot(snapshot: RuntimeSnapshot): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!snapshot.html) {
    warnings.push("HTML is empty");
  }

  if (!snapshot.css) {
    warnings.push("CSS is empty");
  }

  if (!snapshot.stats.hasDesignTokens) {
    warnings.push("No design tokens found - using defaults");
  }

  if (snapshot.stats.nodeCount === 0) {
    warnings.push("No nodes in blueprint");
  }

  if (snapshot.html.length > 1000000) {
    warnings.push("HTML is very large (>1MB) - consider optimization");
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
