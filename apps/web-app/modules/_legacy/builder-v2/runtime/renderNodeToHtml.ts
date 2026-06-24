import { resolveNodeStyle } from "../renderer/resolveNodeStyle";
import type { BlueprintNode } from "../renderer/PageRenderer";

/* ============================================================
   HELPERS
============================================================ */

function escapeHtml(str: string = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function styleToString(
  style: Record<string, any> = {}
): string {
  return Object.entries(style)
    .filter(([, v]) => v != null)
    .map(([k, v]) => {
      const cssKey = k.replace(
        /[A-Z]/g,
        (m) => `-${m.toLowerCase()}`
      );

      const cssValue =
        typeof v === "number" && !cssKey.includes("opacity")
          ? `${v}px`
          : String(v);

      return `${cssKey}:${cssValue}`;
    })
    .join(";");
}

/* ============================================================
   HTML RENDERER (CANONICAL)
============================================================ */

export function renderNodeToHtml(
  node: BlueprintNode,
  device: "desktop" | "tablet" | "mobile" = "desktop"
): string {
  if (!node) return "";

  const style = resolveNodeStyle(node, device);
  const styleAttr = styleToString(style);
  const styleString = styleAttr
    ? ` style="${styleAttr}"`
    : "";

  switch (node.type) {
    case "page":
      return `
<main class="be-page"${styleString}>
  ${node.children?.map((c) => renderNodeToHtml(c, device)).join("") ?? ""}
</main>
`;

    case "section":
      return `
<section class="be-section" data-id="${node.id}"${styleString}>
  ${node.children?.map((c) => renderNodeToHtml(c, device)).join("") ?? ""}
</section>
`;

    case "container":
      return `
<div class="be-container" data-id="${node.id}"${styleString}>
  ${node.children?.map((c) => renderNodeToHtml(c, device)).join("") ?? ""}
</div>
`;

    case "column":
      return `
<div class="be-column" data-id="${node.id}"${styleString}>
  ${node.children?.map((c) => renderNodeToHtml(c, device)).join("") ?? ""}
</div>
`;

    case "heading": {
      const level = Math.min(
        Math.max(Number(node.props?.level) || 2, 1),
        6
      );

      return `
<h${level} class="be-heading"${styleString}>
  ${escapeHtml(node.props?.text ?? "")}
</h${level}>
`;
    }

    case "text":
      return `
<p class="be-text"${styleString}>
  ${node.props?.html ?? escapeHtml(node.props?.text ?? "")}
</p>
`;

    case "image": {
      const { src, alt = "" } = node.props || {};
      if (!src) return "";

      return `
<img
  class="be-image"
  src="${src}"
  alt="${escapeHtml(alt)}"
  loading="lazy"
  decoding="async"
  ${styleAttr ? `style="${styleAttr}"` : ""}
/>
`;
    }

    case "button":
      return `
<a
  class="be-button"
  href="${node.props?.href || "#"}"
  ${styleAttr ? `style="${styleAttr}"` : ""}
>
  ${escapeHtml(node.props?.text || "Button")}
</a>
`;

    case "spacer":
      return `
<div
  class="be-spacer"
  style="height:${Number(node.props?.height) || 32}px"
></div>
`;

    default:
      return "";
  }
}
