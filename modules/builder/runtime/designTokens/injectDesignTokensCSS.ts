// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/designTokens/injectDesignTokensCSS.ts

import { DesignTokens } from "./designTokens.types";
import { bindDesignTokensToCSS } from "./bindDesignTokensToCSS";

/**
 * INJECT DESIGN TOKENS AS CSS
 * 
 * Generates a <style> tag with all design tokens as CSS variables.
 * Used for SSR and static HTML generation.
 * 
 * @deprecated Use bindDesignTokensToCSS directly instead
 */
export function injectDesignTokensCSS(tokens: DesignTokens): string {
  if (!tokens) return "";
  
  const css = bindDesignTokensToCSS(tokens);
  
  return `<style id="buildez-design-tokens">\n${css}\n</style>`;
}
