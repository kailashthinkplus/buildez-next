// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/generateRuntimeOutput.ts

import { renderNodeToHtml } from "./renderNodeToHtml";
import { generateRuntimeCSS } from "./generateRuntimeCSS";
import { bindDesignTokensToCSS } from "./designTokens/bindDesignTokensToCSS";
import type { BlueprintNode } from "@/modules/builder/types";

/**
 * Generate complete runtime output (HTML + CSS)
 * 
 * Used for:
 * - Static exports
 * - Email generation
 * - PDF rendering
 * - Embeds
 * 
 * @param blueprint - Blueprint node (page)
 * @param device - Target device (default: desktop)
 * @returns Object with html and css strings
 */
export function generateRuntimeOutput(
  blueprint: BlueprintNode,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): {
  html: string;
  css: string;
  timestamp: Date;
} {
  if (!blueprint) {
    console.warn("[generateRuntimeOutput] No blueprint provided");
    return { 
      html: "", 
      css: "",
      timestamp: new Date()
    };
  }

  // Extract design tokens
  const designTokens = blueprint.props?.designTokens;

  // Generate HTML with inline styles
  const html = renderNodeToHtml(blueprint, device, designTokens);

  // Generate CSS (base styles + design tokens)
  const baseCSS = generateRuntimeCSS(blueprint as any);
  const tokenCSS = designTokens 
    ? bindDesignTokensToCSS(designTokens)
    : "";

  const css = `${tokenCSS}\n\n${baseCSS}`;

  return { 
    html, 
    css,
    timestamp: new Date()
  };
}

/**
 * Generate minimal output (HTML only with inline styles)
 * For embeds or when CSS is loaded externally
 */
export function generateRuntimeOutputMinimal(
  blueprint: BlueprintNode,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): string {
  if (!blueprint) return "";
  
  const designTokens = blueprint.props?.designTokens;
  return renderNodeToHtml(blueprint, device, designTokens);
}

/**
 * Generate complete HTML document (for email templates)
 */
export function generateRuntimeOutputDocument(
  blueprint: BlueprintNode,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): string {
  const { html, css } = generateRuntimeOutput(blueprint, device);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BuildEZ Page</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`.trim();
}
