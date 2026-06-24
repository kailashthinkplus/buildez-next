// imagePromptBuilder.ts

import type { BlueprintNode } from "@/modules/builder/renderer/PageRenderer";

export function buildImagePrompt(node: BlueprintNode): string {
  const alt =
    node.props?.alt ||
    node.props?.description ||
    "Website illustration";

  return `
High-quality website illustration.
${alt}.
Modern, clean, professional.
Flat lighting, no text, no UI chrome.
`.trim();
}
