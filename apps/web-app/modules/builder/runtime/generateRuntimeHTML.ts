// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/generateRuntimeHTML.ts

import { resolveRuntimeStyle } from "./resolveRuntimeStyle";
import { injectDesignTokensCSS } from "./designTokens/injectDesignTokensCSS";
import type { BlueprintNode } from "@/modules/builder/types";
import type { DesignTokens } from "./designTokens/designTokens.types";

/* ============================================================
   RUNTIME HTML GENERATOR (SSR / STATIC EXPORT)
============================================================ */

interface GenerateRuntimeHTMLInput {
  page?: BlueprintNode;
  designTokens?: DesignTokens;
}

/* ------------------------------------------------------------
   ESCAPE HTML
------------------------------------------------------------ */
function escapeHtml(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------------------------------------
   STYLE OBJECT → CSS STRING
------------------------------------------------------------ */
function styleObjectToCss(style?: Record<string, unknown>): string {
  if (!style || typeof style !== "object") return "";

  const UNITLESS = new Set([
    "opacity", "zIndex", "fontWeight", "lineHeight", 
    "flex", "flexGrow", "flexShrink", "order"
  ]);

  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);

      if (UNITLESS.has(key)) {
        return `${cssKey}:${value}`;
      }

      if (typeof value === "number") {
        return `${cssKey}:${value}px`;
      }

      return `${cssKey}:${value}`;
    })
    .join(";");
}

/* ------------------------------------------------------------
   RENDER NODE (HTML)
------------------------------------------------------------ */
function renderNode(
  node: BlueprintNode,
  page?: BlueprintNode
): string {
  if (!node || typeof node !== "object") return "";

  // Resolve styles using runtime resolver
  const style = resolveRuntimeStyle(node, "desktop", page);
  const styleStr = styleObjectToCss(style);

  switch (node.type) {
    case "page":
      return (node.children ?? [])
        .map(child => renderNode(child, page))
        .join("");

    case "section": {
      const role = node.props?.role;
      const variant = node.props?.backgroundVariant;
      const className = node.props?.className ? ` ${node.props.className}` : "";
      
      return `
<section 
  class="be-section${className}" 
  data-id="${node.id}"
  ${role ? `data-role="${role}"` : ""}
  ${variant ? `data-background="${variant}"` : ""}
  style="${styleStr}"
>
${(node.children ?? []).map(child => renderNode(child, page)).join("")}
</section>`;
    }

    case "header":
      return renderNode(
        {
          ...node,
          type: "section",
          props: { ...(node.props || {}), role: node.props?.role || "header" },
        } as BlueprintNode,
        page
      );

    case "footer":
      return renderNode(
        {
          ...node,
          type: "section",
          props: { ...(node.props || {}), role: node.props?.role || "footer" },
        } as BlueprintNode,
        page
      );

    case "container": {
      const layout = node.props?.layout;
      const visual = node.props?.visual;
      const className = node.props?.className ? ` ${node.props.className}` : "";
      
      return `
<div 
  class="be-container${className}" 
  data-id="${node.id}"
  ${layout ? `data-layout="${layout}"` : ""}
  ${visual ? `data-visual="${visual}"` : ""}
  style="${styleStr}"
>
${(node.children ?? []).map(child => renderNode(child, page)).join("")}
</div>`;
    }

    case "column": {
      const columnClass = node.props?.className ? ` ${node.props.className}` : "";
      return `
<div class="be-column${columnClass}" data-id="${node.id}" style="${styleStr}">
${(node.children ?? []).map(child => renderNode(child, page)).join("")}
</div>`;
    }

    case "heading": {
      const level = node.props?.level || "h2";
      const tag = level.replace(/[^a-z0-9]/gi, "");
      const emphasis = node.props?.emphasis;
      
      return `
<${tag} 
  class="be-heading${node.props?.className ? ` ${node.props.className}` : ""}" 
  data-id="${node.id}"
  ${emphasis ? `data-emphasis="${emphasis}"` : ""}
  style="${styleStr}"
>
${escapeHtml(node.props?.text || "")}
</${tag}>`;
    }

    case "text": {
      const role = node.props?.role || "body";
      
      if (node.props?.html) {
        return `
<div 
  class="be-text${node.props?.className ? ` ${node.props.className}` : ""}" 
  data-id="${node.id}"
  data-role="${role}"
  style="${styleStr}"
>
${node.props.html}
</div>`;
      }

      return `
<p 
  class="be-text${node.props?.className ? ` ${node.props.className}` : ""}" 
  data-id="${node.id}"
  data-role="${role}"
  style="${styleStr}"
>
${escapeHtml(node.props?.text || "")}
</p>`;
    }

    case "image": {
      if (!node.props?.src) return "";
      
      const effect = node.props?.effect;
      
      return `
<img 
  class="be-image${node.props?.className ? ` ${node.props.className}` : ""}"
  data-id="${node.id}"
  src="${node.props.src}"
  alt="${escapeHtml(node.props.alt || "")}"
  loading="${node.props.priority ? "eager" : "lazy"}"
  decoding="async"
  ${effect ? `data-effect="${effect}"` : ""}
  style="${styleStr}"
/>`;
    }

    case "button": {
      const variant = node.props?.variant || "primary";
      const href = node.props?.href || "#";
      
      return `
<a 
  class="be-button${node.props?.className ? ` ${node.props.className}` : ""}"
  data-id="${node.id}"
  data-variant="${variant}"
  href="${href}"
  style="${styleStr}"
>
${escapeHtml(node.props?.text || "Button")}
</a>`;
    }

    case "spacer": {
      const height = Number(node.props?.height) || 32;
      
      return `
<div 
  class="be-spacer" 
  data-id="${node.id}"
  style="height:${height}px"
></div>`;
    }

    case "icon": {
      const variant = node.props?.variant || "default";
      const name = node.props?.name || "star";
      
      return `
<span 
  class="be-icon"
  data-id="${node.id}"
  data-variant="${variant}"
  data-icon="${name}"
  style="${styleStr}"
></span>`;
    }

    case "divider":
      return `
<hr 
  class="be-divider"
  data-id="${node.id}"
  style="${styleStr}"
/>`;

    default:
      console.warn(`[generateRuntimeHTML] Unknown node type: ${node.type}`);
      return "";
  }
}

/* ------------------------------------------------------------
   PUBLIC API
------------------------------------------------------------ */
export function generateRuntimeHTML(input: GenerateRuntimeHTMLInput | BlueprintNode): string {
  // Handle both input formats
  let page: BlueprintNode | undefined;
  let designTokens: DesignTokens | undefined;

  if ("type" in input && input.type === "page") {
    page = input;
    designTokens = input.props?.designTokens;
  } else if ("page" in input) {
    page = input.page;
    designTokens = input.designTokens ?? input.page?.props?.designTokens;
  }

  if (!page) {
    console.warn("⚠️ generateRuntimeHTML: No page node found");
    return "";
  }

  // Generate design tokens CSS
  const tokenCSS = designTokens
    ? injectDesignTokensCSS(designTokens)
    : "";

  // Generate HTML
  const html = renderNode(page, page);

  return `
${tokenCSS}
<div id="buildez-preview-root" class="buildez-page">
${html}
</div>
`.trim();
}
