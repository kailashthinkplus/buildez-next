"use client";

import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import { useSelectionStore } from "../store/useSelectionStore";
import { useCanvasStore } from "../store/useCanvasStore";
import { useHoverStore } from "../store/useHoverStore";
import { commandBus } from "../core/commands/CommandBus";
import { UpdateNodeCommand } from "../core/commands/MoveNodeCommand";

interface NodeRendererProps {
  nodes: BuilderNode[];
  blueprint: BuilderBlueprint;
}

export default function NodeRenderer({ nodes, blueprint }: NodeRendererProps) {
  return (
    <div className="w-full h-full">
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} blueprint={blueprint} />
      ))}
    </div>
  );
}

interface RenderNodeProps {
  node: BuilderNode;
  blueprint: BuilderBlueprint;
}

function RenderNode({ node, blueprint }: RenderNodeProps) {
  const { type, props } = node;
  const selectedId = useSelectionStore((s) => s.selectedNodeId);
  const select = useSelectionStore((s) => s.select);
  const showOutlines = useCanvasStore((s) => s.showOutlines);
  const setHoveredNodeId = useHoverStore((s) => s.setHoveredNodeId);
  const isSelected = selectedId === node.id;

  const handleMouseEnter = () => {
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = () => {
    setHoveredNodeId(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({
      nodeId: node.id,
      type: node.type,
    }));
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.nodeId !== node.id) {
        // Dispatch reparenting event to be handled by BuilderShell
        window.dispatchEvent(
          new CustomEvent("builder:reparent", {
            detail: { nodeId: data.nodeId, targetParentId: node.id },
          })
        );
      }
    } catch (err) {
      console.error("Failed to parse drop data", err);
    }
  };
  
  // Look up child nodes by their IDs
  const childIds = node.children || [];
  const children = childIds
    .map((id) => blueprint.nodes[id])
    .filter((child): child is BuilderNode => !!child);

  function resolveTokenColor(value: unknown, fallback: string): string {
    if (typeof value !== "string" || !value) return fallback;
    const map: Record<string, string> = {
      "text.primary": "#0f172a",
      "text.secondary": "#334155",
      "primary.500": "#2563eb",
      white: "#ffffff",
      black: "#000000",
    };
    return map[value] ?? value;
  }

  function pickResponsive(value: unknown): unknown {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const obj = value as Record<string, unknown>;
    return obj.desktop ?? obj.laptop ?? obj.tablet ?? obj.mobile ?? value;
  }

  function toCssUnit(value: unknown): string | number | undefined {
    const v = pickResponsive(value);
    if (v === undefined || v === null || v === "") return undefined;
    if (typeof v === "number") return `${v}px`;
    return String(v);
  }

  const nodeStyle: React.CSSProperties = {
    color: resolveTokenColor(node.style?.color, "#0f172a"),
    backgroundColor:
      node.style?.backgroundColor !== undefined
        ? resolveTokenColor(node.style?.backgroundColor, "transparent")
        : undefined,
    fontSize: toCssUnit(node.style?.fontSize),
    fontWeight: (node.style?.fontWeight as number | undefined) ?? undefined,
    lineHeight: (node.style?.lineHeight as number | undefined) ?? undefined,
    textAlign: (node.style?.textAlign as React.CSSProperties["textAlign"]) ?? undefined,
    padding: toCssUnit(node.style?.padding),
    margin: toCssUnit(node.style?.margin),
    marginTop: toCssUnit(node.style?.marginTop),
    marginBottom: toCssUnit(node.style?.marginBottom),
    borderRadius: toCssUnit(node.style?.borderRadius),
    width: toCssUnit(node.style?.width),
    minHeight: toCssUnit(node.style?.minHeight),
    maxWidth: toCssUnit(node.style?.maxWidth),
    gap: toCssUnit(node.style?.gap) as string | number | undefined,
  };

  const outlineClass = showOutlines
    ? isSelected
      ? "outline outline-2 outline-blue-600 bg-blue-50/40"
      : "outline outline-1 outline-gray-300"
    : "";

  // Base styling: border + cursor + hover effect
  const baseClass = `
    relative 
    box-border 
    select-none 
    cursor-pointer
    pointer-events-auto
    hover:bg-blue-50
    hover:outline 
    hover:outline-2 
    hover:outline-blue-400
    transition-all
    ${outlineClass}
  `;

  const emptyState =
    children.length === 0 &&
    (type === "section" || type === "container" || type === "column");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select(node.id);
  };

  const updateInlineText = (value: string) => {
    if (type === "button") {
      commandBus.execute(
        new UpdateNodeCommand(node.id, {
          props: {
            ...node.props,
            text: value,
            label: value,
          },
        })
      );
      return;
    }

    commandBus.execute(
      new UpdateNodeCommand(node.id, {
        props: {
          ...node.props,
          text: value,
        },
      })
    );
  };

  switch (type) {
    case "page":
      return (
        <div 
          className="w-full min-h-screen bg-white text-slate-900 p-6 space-y-4" 
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={nodeStyle}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
        </div>
      );

    case "section":
      return (
        <section
          className={`w-full py-12 px-4 ${baseClass}`}
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={node.id !== blueprint.root}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={nodeStyle}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
          {emptyState && (
            <div className="border border-dashed border-slate-300 rounded-md px-3 py-4 text-xs text-slate-500 bg-slate-50/70">
              Empty section. Use Add from toolbar or sidebar to insert widgets.
            </div>
          )}
        </section>
      );

   case "container": {
  const layout = props?.layout ?? "flex";
  const direction = props?.direction ?? "row";
  const gap = props?.gap ?? 24;

  return (
    <div
      className={`
        ${baseClass}
        ${layout === "grid" ? "grid" : "flex"}
        ${layout !== "grid"
          ? direction === "row"
            ? "flex-row"
            : "flex-col"
          : ""}
      `}
      style={{
        ...nodeStyle,
        gap: toCssUnit(gap),
      }}
      data-drop-target="true"
      data-node-id={node.id}
      onClick={handleClick}
      draggable={node.id !== blueprint.root}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children.map((child) => (
        <RenderNode
          key={child.id}
          node={child}
          blueprint={blueprint}
        />
      ))}

      {emptyState && (
        <div className="w-full rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-3 py-4 text-xs text-slate-500">
          Empty container. Insert columns or elements.
        </div>
      )}
    </div>
  );
}

    case "column":
      const width = props?.width;
      const columnLayout = props?.layout || "vertical";
      const columnClass = columnLayout === "horizontal" ? "flex flex-row flex-wrap items-start gap-4" : "flex flex-col";
      
      return (
        <div
          className={`${baseClass} ${columnClass} min-h-24 p-2 bg-slate-50/40`}
          style={{
  ...nodeStyle,
  flex: (node.style?.flex as React.CSSProperties["flex"]) ?? 1,
  minWidth: 0,
  width: width ? toCssUnit(width) : undefined,
}}
          data-drop-target="true"
          data-node-id={node.id}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          draggable={node.id !== blueprint.root}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
          {emptyState && (
            <div className="border border-dashed border-slate-300 rounded-md px-3 py-4 text-xs text-slate-500 bg-white/70">
              Empty column. Drop or add elements here.
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div
          className={`${baseClass} min-h-8 p-2`}
          data-node-id={node.id}
          onClick={handleClick}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={nodeStyle}
        >
          {String(props?.text ?? props?.content ?? props?.html ?? "Text")}
        </div>
      );

    case "heading":
      const level = (props?.level || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const HeadingTag = level;
      return (
        <HeadingTag
          className={`${baseClass} min-h-12 p-2 text-slate-900`}
          data-node-id={node.id}
          onClick={handleClick}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={nodeStyle}
        >
          {String(props?.text ?? props?.content ?? "Heading")}
        </HeadingTag>
      );

    case "image":
      if (!props?.src) {
        return (
          <div
            className={`${baseClass} min-h-32 flex items-center justify-center text-slate-500 bg-slate-100`}
            data-node-id={node.id}
            onClick={handleClick}
            style={nodeStyle}
          >
            Image placeholder
          </div>
        );
      }

      return (
        <img
          src={String(props?.src)}
          alt={String(props?.alt ?? "")}
          className={`${baseClass} min-h-32`}
          data-node-id={node.id}
          onClick={handleClick}
          style={nodeStyle}
        />
      );

    case "video":
      return (
        <video
          className={`${baseClass} min-h-32`}
          data-node-id={node.id}
          onClick={handleClick}
          controls
          poster={String(props?.poster ?? "")}
          style={nodeStyle}
        >
          <source src={String(props?.src ?? "")} type={String(props?.mimeType ?? "video/mp4")} />
        </video>
      );

    case "icon":
      return (
        <span
          className={`${baseClass} inline-flex items-center justify-center min-w-8 min-h-8 p-2`}
          data-node-id={node.id}
          onClick={handleClick}
          style={nodeStyle}
        >
          {String(props?.glyph ?? "*")}
        </span>
      );

    case "divider":
      return (
        <div
          className={`${baseClass} py-2`}
          data-node-id={node.id}
          onClick={handleClick}
          style={nodeStyle}
        >
          <hr className="border-0 border-t border-slate-300" />
        </div>
      );

    case "spacer":
      return (
        <div
          className={`${baseClass}`}
          data-node-id={node.id}
          onClick={handleClick}
          style={{
            ...nodeStyle,
            height: toCssUnit(node.style?.height ?? 24),
            minHeight: toCssUnit(node.style?.height ?? 24),
          }}
        />
      );

    case "button":
      return (
        <button
          className={`px-4 py-2 rounded bg-blue-600 text-white ${baseClass}`}
          data-node-id={node.id}
          onClick={handleClick}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => updateInlineText(e.currentTarget.textContent ?? "")}
          style={{
            ...nodeStyle,
            backgroundColor: resolveTokenColor(node.style?.backgroundColor, "#2563eb"),
            color: resolveTokenColor(node.style?.color, "#ffffff"),
          }}
        >
          {String(props?.label ?? props?.text ?? "Button")}
        </button>
      );

    default:
      return (
        <div
          className={`${baseClass} p-2 min-h-12`}
          data-node-id={node.id}
          onClick={handleClick}
          style={nodeStyle}
        >
          {children.map((child) => (
            <RenderNode key={child.id} node={child} blueprint={blueprint} />
          ))}
        </div>
      );
  }
}
