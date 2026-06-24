// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/resolveRuntimeStyle.ts

import type { BlueprintNode } from "@/modules/builder/types";
import { resolveNodeStyle } from "@/modules/builder/renderer/resolveNodeStyle";

/**
 * RUNTIME STYLE RESOLVER (SSR / Static Export)
 * 
 * This is a wrapper around resolveNodeStyle for runtime/SSR contexts.
 * It delegates to the canonical style resolver to ensure consistency.
 * 
 * @deprecated Use resolveNodeStyle directly instead
 */
export function resolveRuntimeStyle(
  node: BlueprintNode,
  device: "desktop" | "tablet" | "mobile" = "desktop",
  page?: BlueprintNode
): Record<string, any> {
  // Extract design tokens from page
  const designTokens = page?.props?.designTokens;
  
  // Use the canonical resolver
  return resolveNodeStyle(node, device, designTokens);
}
