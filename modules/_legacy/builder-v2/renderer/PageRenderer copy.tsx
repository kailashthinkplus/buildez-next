"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  CSSProperties,
} from "react";

import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";
import { SectionToolbar } from "@app/app/(builder)/[siteSlug]/[pageSlugWithId]/toolbars/SectionToolbar";
import { BlockToolbar } from "@app/app/(builder)/[siteSlug]/[pageSlugWithId]/toolbars/BlockToolbar";
import { resolveNodeStyle } from "@/modules/builder/renderer/resolveNodeStyle";

/* ============================================================
   TYPES (LOCKED – DO NOT CHANGE)
============================================================ */

export type NodeType =
  | "page"
  | "section"
  | "container"
  | "column"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "spacer";

export interface BlueprintNode {
  id: string;
  type: NodeType;
  props?: Record<string, any>;
  children?: BlueprintNode[];
}

export interface PageRendererProps {
  blueprint: BlueprintNode;

  selectedId?: string | null;
  onSelect?: (id: string | null) => void;

  onUpdateNode?: (id: string, patch: Partial<BlueprintNode>) => void;
  onDuplicateNode?: (id: string) => void;
  onDeleteNode?: (id: string) => void;

  onAddChild?: (parentId: string) => void;
  onAIAction?: (id: string, type: NodeType) => void;
}

export interface RenderContext extends PageRendererProps {
  renderNode(node: BlueprintNode): React.ReactNode;
  moveUp(id: string): void;
  moveDown(id: string): void;
  device: "desktop" | "tablet" | "mobile";
}

/* ============================================================
   VISUAL CONSTANTS (CANONICAL)
============================================================ */

export const HOVER_OUTLINE = "1px dashed rgba(99,102,241,0.6)";
export const SELECT_OUTLINE = "2px solid rgba(99,102,241,1)";

/* ============================================================
   GLOBAL DRAG BOOTSTRAP (REQUIRED)
============================================================ */

function useGlobalToolbarDrag() {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const toolbar =
        target.closest("[data-bez-block-toolbar]") ||
        target.closest("[data-bez-section-toolbar]");

      if (!toolbar) return;

      const nodeEl = toolbar.closest("[data-node-id]");
      if (!nodeEl) return;

      const id = nodeEl.getAttribute("data-node-id");
      if (!id) return;

      window.dispatchEvent(
        new CustomEvent("builder:start-drag", {
          detail: {
            id,
            type: "block",
            source: "canvas",
            x: e.clientX,
            y: e.clientY,
          },
        })
      );

      document.body.classList.add("builder-dragging");
    }

    window.addEventListener("mousedown", onMouseDown);
    return () =>
      window.removeEventListener("mousedown", onMouseDown);
  }, []);
}
/* ============================================================
   PAGE RENDERER (SHELL)
============================================================ */

export function PageRenderer(props: PageRendererProps) {
  const device = useCanvasStore((s) => s.device);

  useGlobalToolbarDrag();

  const moveUp = useCallback((id: string) => {
    window.dispatchEvent(
      new CustomEvent("builder:move-node", {
        detail: { id, direction: "up" },
      })
    );
  }, []);

  const moveDown = useCallback((id: string) => {
    window.dispatchEvent(
      new CustomEvent("builder:move-node", {
        detail: { id, direction: "down" },
      })
    );
  }, []);

  const renderNode = useCallback(
    (node?: BlueprintNode | null): React.ReactNode => {
      if (!node) return null;

      const ctx: RenderContext = {
        ...props,
        renderNode,
        moveUp,
        moveDown,
        device,
      };

      switch (node.type) {
        case "page":
          return <PageNode key={node.id} node={node} ctx={ctx} />;

        case "section":
          return <Section key={node.id} node={node} ctx={ctx} />;

        case "container":
          return <Container key={node.id} node={node} ctx={ctx} />;

        case "column":
          return <Column key={node.id} node={node} ctx={ctx} />;

        case "heading":
          return <Heading key={node.id} node={node} ctx={ctx} />;

        case "text":
          return <Text key={node.id} node={node} ctx={ctx} />;

        case "button":
          return <ButtonBlock key={node.id} node={node} ctx={ctx} />;

        case "image":
          return <ImageBlock key={node.id} node={node} ctx={ctx} />;

        case "spacer":
          return <Spacer key={node.id} node={node} />;

        default:
          return null;
      }
    },
    [props, device, moveUp, moveDown]
  );

  return <>{renderNode(props.blueprint)}</>;
}

function stripResponsiveWidths(
  style: CSSProperties,
  device: "desktop" | "tablet" | "mobile"
): CSSProperties {
  if (device === "desktop") return style;

  const cleaned = { ...style };

  delete cleaned.width;
  delete cleaned.maxWidth;
  delete cleaned.minWidth;
  delete cleaned.flexBasis;

  return cleaned;
}

/* ============================================================
   STYLE MERGER (INSPECTOR / AI ALWAYS WINS)
============================================================ */

function applyInspectorStyles(
  base: CSSProperties,
  style?: Record<string, any>
): CSSProperties {
  if (!style) return base;
  return { ...base, ...style };
}

/* ============================================================
   SELECTION HOOK
============================================================ */

function useSelectable(
  id: string,
  selectedId?: string | null,
  onSelect?: (id: string | null) => void
) {
  const [hovered, setHovered] = useState(false);
  const selected = selectedId === id;

  return {
    selected,
    style: {
      outline: selected
        ? SELECT_OUTLINE
        : hovered
        ? HOVER_OUTLINE
        : "none",
      outlineOffset: "0px",
      cursor: "pointer",
    } as CSSProperties,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.(id);
      },
    },
  };
}

/* ============================================================
   PAGE NODE (DEFAULT RHYTHM ADDED)
============================================================ */

function PageNode({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  return (
    <div
      data-node-id={node.id}
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "transparent",
      }}
      onClick={(e) => {
        e.stopPropagation();
        ctx.onSelect?.(node.id);
      }}
    >
      {(node.children ?? []).map(ctx.renderNode)}
    </div>
  );
}
/* ============================================================
   SECTION NODE
============================================================ */

function Section({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  return (
    <section
      data-node-id={node.id}
      {...sel.handlers}
style={{
  position: "relative",
  outline: sel.style.outline,
  ...resolveNodeStyle(node, ctx.device),
}}

    >
      <SectionToolbar
        id={node.id}
        nodeType="section"
        label="Section"
        isSelected={sel.selected}
        onAddInside={() => ctx.onAddChild?.(node.id)}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
        onAIRewrite={() =>
          ctx.onAIAction?.(node.id, node.type)
        }
      />

      {(node.children ?? []).map(ctx.renderNode)}
    </section>
  );
}

function Container({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  const isColumns = node.props?.layout === "columns";
  const shouldStack =
    isColumns &&
    (ctx.device === "tablet" || ctx.device === "mobile");

  const baseStyle = resolveNodeStyle(node, ctx.device);

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        outline: sel.style.outline,

        /* inspector / AI styles FIRST */
        ...baseStyle,

        /* 🔥 HARD CANVAS OVERRIDES LAST */
        ...(isColumns && shouldStack && {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }),
      }}
    >
      <SectionToolbar
        id={node.id}
        nodeType="container"
        label="Container"
        isSelected={sel.selected}
        onAddInside={() => ctx.onAddChild?.(node.id)}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      {(node.children ?? []).map(ctx.renderNode)}
    </div>
  );
}


/* ============================================================
   COLUMN NODE
============================================================ */

function Column({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  const baseStyle = resolveNodeStyle(node, ctx.device);
  const responsiveStyle = stripResponsiveWidths(baseStyle, ctx.device);

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        outline: sel.style.outline,

        /* inspector styles (cleaned) */
        ...responsiveStyle,

        /* enforce stacking */
        ...(ctx.device !== "desktop" && {
          width: "100%",
          flex: "0 0 auto",
        }),
      }}
    >
      <SectionToolbar
        id={node.id}
        nodeType="column"
        label="Column"
        isSelected={sel.selected}
        onAddInside={() => ctx.onAddChild?.(node.id)}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      {(node.children ?? []).map(ctx.renderNode)}
    </div>
  );
}


/* ============================================================
   HEADING BLOCK
============================================================ */

function Heading({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const level = node.props?.level ?? "h2";
  const Tag = level as keyof JSX.IntrinsicElements;

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar
        id={node.id}
        label="Heading"
        isSelected={sel.selected}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onSettings={() => ctx.onSelect?.(node.id)}
        onAI={() => ctx.onAIAction?.(node.id, node.type)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      <Tag
        {...sel.handlers}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          ctx.onUpdateNode?.(node.id, {
            props: {
              ...node.props,
              text: e.currentTarget.innerText,
            },
          })
        }
        style={{
  position: "relative",
  outline: sel.style.outline,
  ...resolveNodeStyle(node, ctx.device),
}}
      >
        {node.props?.text ?? "Heading"}
      </Tag>
    </div>
  );
}

/* ============================================================
   TEXT BLOCK
============================================================ */

function Text({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  const html =
    typeof node.props?.html === "string"
      ? node.props.html
      : node.props?.text ?? "";

  const [editing, setEditing] = useState(false);
  const ref = React.useRef<HTMLParagraphElement>(null);

  // 🔑 Rehydrate DOM when entering edit mode
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.innerHTML = html;
    }
  }, [editing, html]);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar
        id={node.id}
        label="Text"
        isSelected={sel.selected}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onSettings={() => ctx.onSelect?.(node.id)}
        onAI={() => ctx.onAIAction?.(node.id, node.type)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      <p
        ref={ref}
        {...sel.handlers}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setEditing(true)}
        onBlur={(e) => {
          setEditing(false);
          ctx.onUpdateNode?.(node.id, {
            props: {
              ...node.props,
              html: e.currentTarget.innerHTML,
            },
          });
        }}
        {...(!editing && {
          dangerouslySetInnerHTML: { __html: html },
        })}
        style={{
          position: "relative",
          outline: sel.style.outline,
          ...resolveNodeStyle(node, ctx.device),
        }}
      />
    </div>
  );
}

/* ============================================================
   BUTTON BLOCK
============================================================ */

function ButtonBlock({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar
        id={node.id}
        label="Button"
        isSelected={sel.selected}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onSettings={() => ctx.onSelect?.(node.id)}
        onAI={() => ctx.onAIAction?.(node.id, node.type)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      <button
        {...sel.handlers}
        style={{
  position: "relative",
  outline: sel.style.outline,
  ...resolveNodeStyle(node, ctx.device),
}}

      >
        {node.props?.text ?? "Button"}
      </button>
    </div>
  );
}

/* ============================================================
   IMAGE BLOCK
============================================================ */

function ImageBlock({
  node,
  ctx,
}: {
  node: BlueprintNode;
  ctx: RenderContext;
}) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);

  const src =
    typeof node.props?.src === "string" && node.props.src.trim() !== ""
      ? node.props.src
      : null;

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        outline: sel.style.outline,
        minHeight: src ? undefined : 200, // prevents zero-height columns
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...resolveNodeStyle(node, ctx.device), // 🔥 styles still dynamic
      }}
    >
      <BlockToolbar
        id={node.id}
        label="Image"
        isSelected={sel.selected}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onSettings={() => ctx.onSelect?.(node.id)}
        onAI={() => ctx.onAIAction?.(node.id, node.type)}
        onMoveUp={() => ctx.moveUp(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />

      {src ? (
        <img
          src={src}
          alt={node.props?.alt ?? ""}
          draggable={false}
          style={{
            maxWidth: "100%",
            height: "auto",
            pointerEvents: "none", // 👈 critical
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 300,
            borderRadius: 8,
            background:
              "repeating-linear-gradient(45deg, #1e293b, #1e293b 10px, #0f172a 10px, #0f172a 20px)",
            color: "#64748b",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          Image
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SPACER BLOCK
============================================================ */

function Spacer({ node }: { node: BlueprintNode }) {
  return (
    <div
      data-node-id={node.id}
      style={{ height: node.props?.height ?? 32 }}
    />
  );
}
