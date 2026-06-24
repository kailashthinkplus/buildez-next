// /modules/builder/renderer/RuntimeRenderer.tsx

import React from "react";
import type { BlueprintNode } from "./PageRenderer";
import { resolveNodeStyle } from "./resolveNodeStyle";

/* ============================================================
   KEYFRAMES (SAFE TO KEEP)
============================================================ */

const keyframes = `
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
`;

/* ============================================================
   RUNTIME RENDERER
============================================================ */

export function RuntimeRenderer({
  blueprint,
  device = "desktop",
}: {
  blueprint: BlueprintNode;
  device?: "desktop" | "tablet" | "mobile";
}) {
  return (
    <>
      <style>{keyframes}</style>
      {renderNode(blueprint, device)}
    </>
  );
}

/* ============================================================
   NODE RENDERER (CANONICAL)
============================================================ */

function renderNode(
  node: BlueprintNode,
  device: "desktop" | "tablet" | "mobile"
): React.ReactNode {
  if (!node) return null;

  const style = resolveNodeStyle(node, device);

  switch (node.type) {
    case "page":
      return (
        <main key={node.id} style={style}>
          {node.children?.map((c) => renderNode(c, device))}
        </main>
      );

    case "section":
      return (
        <section key={node.id} style={style}>
          {node.children?.map((c) => renderNode(c, device))}
        </section>
      );

    case "container":
      return (
        <div key={node.id} style={style}>
          {node.children?.map((c) => renderNode(c, device))}
        </div>
      );

    case "column":
      return (
        <div key={node.id} style={style}>
          {node.children?.map((c) => renderNode(c, device))}
        </div>
      );

    case "heading": {
      const Tag =
        (node.props?.level as keyof JSX.IntrinsicElements) ||
        "h2";

      return (
        <Tag key={node.id} style={style}>
          {node.props?.text}
        </Tag>
      );
    }

    case "text":
      return (
        <div
          key={node.id}
          style={style}
          dangerouslySetInnerHTML={{
            __html:
              node.props?.html ??
              node.props?.text ??
              "",
          }}
        />
      );

    case "image":
      return (
        <img
          key={node.id}
          src={node.props?.src}
          alt={node.props?.alt ?? ""}
          style={{
            ...style,
            animation: "fadeIn 0.8s ease-out",
          }}
        />
      );

    case "button":
      return (
        <button
          key={node.id}
          style={{
            ...style,
            animation: "slideUp 0.4s ease-out",
          }}
        >
          {node.props?.text ?? node.props?.label}
        </button>
      );

    case "spacer":
      return (
        <div
          key={node.id}
          style={{
            height:
              node.props?.height ??
              node.props?.style?.height ??
              32,
          }}
        />
      );

    default:
      return null;
  }
}
