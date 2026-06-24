// /Users/kailash/buildez/apps/web-app/modules/builder/renderer/PageRenderer.tsx

"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  CSSProperties,
} from "react";

import { useCanvasStore } from "@/modules/builder/state/useCanvasStore";
import { resolveNodeStyle } from "@/modules/builder/renderer/resolveNodeStyle";

import { SectionToolbar } from
  "@/app/app/(builder)/[siteSlug]/[pageSlugWithId]/toolbars/SectionToolbar";
import { BlockToolbar } from
  "@/app/app/(builder)/[siteSlug]/[pageSlugWithId]/toolbars/BlockToolbar";

/* ============================================================
   TYPES
============================================================ */

export type NodeType =
  | "page"
  | "header"
  | "footer"
  | "section"
  | "container"
  | "column"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "icon"
  | "video"
  | "code"
  | "spacer";

export interface BlueprintNode {
  id: string;
  type: NodeType;
  props?: Record<string, any>;
  children?: BlueprintNode[];
}

export interface PageRendererProps {
  blueprint: BlueprintNode;
  designTokens?: any;
  selectedId?: string | null;

  onSelect?: (id: string | null) => void;
  onUpdateNode?: (id: string, patch: Partial<BlueprintNode>) => void;
  onDuplicateNode?: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onAIAction?: (id: string, type: NodeType) => void;
}

interface RenderContext extends PageRendererProps {
  renderNode(node: BlueprintNode): React.ReactNode;
  moveUp(id: string): void;
  moveDown(id: string): void;
  device: "desktop" | "tablet" | "mobile";
  designTokens?: any;
  pageTokens?: {
    colors?: Record<string, string>;
    typography?: Record<string, any>;
  };
}

/* ============================================================
   VISUAL CONSTANTS
============================================================ */

const HOVER_OUTLINE = "1px dashed rgba(99,102,241,0.5)";
const SELECT_OUTLINE = "2px solid rgba(99,102,241,1)";

/* ============================================================
   STYLE RESOLVER HELPER
============================================================ */

function getNodeStyle(
  node: BlueprintNode,
  ctx: RenderContext
): CSSProperties {
  return {
    ...resolveNodeStyle(node, ctx.device, ctx.pageTokens),
    ...(node.props?.__inspectorStyle ?? {}),
  };
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
    outline: selected
      ? SELECT_OUTLINE
      : hovered
      ? HOVER_OUTLINE
      : "none",
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
   PAGE RENDERER ROOT
============================================================ */

export function PageRenderer(props: PageRendererProps) {
  const storeTokens = useCanvasStore((s) => s.designTokens);
  const device = useCanvasStore((s) => s.device);

  // Get design tokens from store, props, or blueprint
  const designTokens = 
    storeTokens ?? 
    props.designTokens ?? 
    props.blueprint?.props?.designTokens;

  // Create pageTokens object for style resolver
  const pageTokens = {
    colors: designTokens?.colors,
    typography: designTokens?.typography,
  };

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
    (node: BlueprintNode): React.ReactNode => {
      const ctx: RenderContext = {
        ...props,
        renderNode,
        moveUp,
        moveDown,
        device,
        designTokens,
        pageTokens,
      };

      switch (node.type) {
        case "page":
          return <PageNode key={node.id} node={node} ctx={ctx} />;
        case "header":
          return <HeaderNode key={node.id} node={node} ctx={ctx} />;
        case "footer":
          return <FooterNode key={node.id} node={node} ctx={ctx} />;
        case "section":
          return <Section key={node.id} node={node} ctx={ctx} />;
        case "container":
          return <Container key={node.id} node={node} ctx={ctx} />;
        case "column":
          return <Column key={node.id} node={node} ctx={ctx} />;
        case "heading":
          return <Heading key={node.id} node={node} ctx={ctx} />;
        case "text":
          return <TextBlock key={node.id} node={node} ctx={ctx} />;
        case "button":
          return <ButtonBlock key={node.id} node={node} ctx={ctx} />;
        case "image":
          return <ImageBlock key={node.id} node={node} ctx={ctx} />;
        case "icon":
          return <IconBlock key={node.id} node={node} ctx={ctx} />;
        case "video":
          return <VideoBlock key={node.id} node={node} />;
        case "code":
          return <CodeBlock key={node.id} node={node} />;
        case "spacer":
          return <Spacer key={node.id} node={node} />;
        default:
          return null;
      }
    },
    [props, device, moveUp, moveDown, designTokens, pageTokens]
  );

  return <>{renderNode(props.blueprint)}</>;
}

/* ============================================================
   PAGE NODE
============================================================ */

function PageNode({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const style = getNodeStyle(node, ctx);

  return (
    <div
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        ctx.onSelect?.(node.id);
      }}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        backgroundColor: ctx.pageTokens?.colors?.background ?? "#ffffff",
        color: ctx.pageTokens?.colors?.textPrimary ?? "#0f172a",
        fontFamily: ctx.pageTokens?.typography?.fontFamily ?? "system-ui, sans-serif",
        ...style,
        paddingTop: style.paddingTop ?? 56,
        paddingBottom: style.paddingBottom ?? 80,
      }}
    >
      {(node.children ?? []).map(ctx.renderNode)}
    </div>
  );
}

/* ============================================================
   HEADER
============================================================ */

function HeaderNode({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);

  return (
    <header
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 64,
        zIndex: 20,
        ...style,
        background: "transparent",
        outline: sel.outline,
      }}
    >
      <SectionToolbar
        id={node.id}
        nodeType="header"
        label="Header"
        isSelected={sel.selected}
        onAddInside={() => ctx.onAddChild?.(node.id)}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onMoveDown={() => ctx.moveDown(node.id)}
      />
      {(node.children ?? []).map(ctx.renderNode)}
    </header>
  );
}

/* ============================================================
   FOOTER
============================================================ */

function FooterNode({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);

  return (
    <footer
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 96,
        marginTop: 64,
        ...style,
        outline: sel.outline,
      }}
    >
      <SectionToolbar
        id={node.id}
        nodeType="footer"
        label="Footer"
        isSelected={sel.selected}
        onAddInside={() => ctx.onAddChild?.(node.id)}
        onDuplicate={() => ctx.onDuplicateNode?.(node.id)}
        onDelete={() => ctx.onDeleteNode?.(node.id)}
        onMoveUp={() => ctx.moveUp(node.id)}
      />
      {(node.children ?? []).map(ctx.renderNode)}
    </footer>
  );
}

/* ============================================================
   SECTION
============================================================ */

function Section({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);

  return (
    <section
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        ...style,
        outline: sel.outline,
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
        onAIRewrite={() => ctx.onAIAction?.(node.id, node.type)}
      />
      {(node.children ?? []).map(ctx.renderNode)}
    </section>
  );
}

/* ============================================================
   CONTAINER
============================================================ */

function Container({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const isColumns = node.props?.layout === "columns";

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        ...style,
        display: "flex",
        flexDirection: isColumns ? "row" : "column",
        gap: node.props?.gap ?? 24,
        width: "100%",
        maxWidth: node.props?.maxWidth ?? 1200,
        marginLeft: "auto",
        marginRight: "auto",
        minWidth: 0,
        boxSizing: "border-box",
        outline: sel.outline,
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
   COLUMN
============================================================ */

function Column({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const widthFromProps = node.props?.width ?? node.props?.style?.width;

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        ...style,
        display: "flex",
        flexDirection: "column",
        flex: widthFromProps ? "0 0 auto" : "1 1 0%",
        width: widthFromProps,
        minWidth: 0,
        boxSizing: "border-box",
        pointerEvents: "auto",
        outline: sel.outline,
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
      {node.children?.length ? (
        node.children.map(ctx.renderNode)
      ) : (
        <div style={{ minHeight: 48 }} />
      )}
    </div>
  );
}

/* ============================================================
   HEADING
============================================================ */

function Heading({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const Tag = (node.props?.level ?? "h2") as keyof JSX.IntrinsicElements;
  const [draft, setDraft] = useState(node.props?.text ?? "");

  useEffect(() => {
    setDraft(node.props?.text ?? "");
  }, [node.props?.text]);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <Tag
        {...sel.handlers}
        contentEditable
        suppressContentEditableWarning
        onInput={(e: any) => setDraft(e.currentTarget.innerText)}
        onBlur={() =>
          ctx.onUpdateNode?.(node.id, {
            props: { ...node.props, text: draft },
          })
        }
        style={{
          ...style,
          color: style.color ?? ctx.pageTokens?.colors?.textPrimary,
          outline: sel.outline,
        }}
      >
        {draft || "Heading"}
      </Tag>
    </div>
  );
}

/* ============================================================
   TEXT
============================================================ */

function TextBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const source = node.props?.html ?? node.props?.text ?? "";
  const [draft, setDraft] = useState(source);

  useEffect(() => {
    setDraft(source);
  }, [source]);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <p
        {...sel.handlers}
        contentEditable
        suppressContentEditableWarning
        onInput={(e: any) => setDraft(e.currentTarget.innerHTML)}
        onBlur={() => {
          ctx.onUpdateNode?.(node.id, {
            props: {
              ...node.props,
              html: draft,
              text: undefined,
            },
          });
        }}
        dangerouslySetInnerHTML={{ __html: draft || "Text content" }}
        style={{
          ...style,
          color: style.color ?? ctx.pageTokens?.colors?.textSecondary,
          outline: sel.outline,
        }}
      />
    </div>
  );
}

/* ============================================================
   BUTTON
============================================================ */

function ButtonBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const colors = ctx.pageTokens?.colors;

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <button
        {...sel.handlers}
        style={{
          cursor: "pointer",
          border: "none",
          ...style,
          backgroundColor: style.backgroundColor ?? colors?.primary ?? "#2563eb",
          color: style.color ?? colors?.onPrimary ?? "#ffffff",
          borderRadius: style.borderRadius ?? 10,
          fontWeight: 600,
          outline: sel.outline,
        }}
      >
        {node.props?.label ?? "Button"}
      </button>
    </div>
  );
}

/* ============================================================
   IMAGE
============================================================ */

function ImageBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);

  const PLACEHOLDER = "https://placehold.co/800x450/e2e8f0/94a3b8?text=Image";
  const src = node.props?.src || PLACEHOLDER;

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        ...style,
        outline: sel.outline,
        overflow: "hidden",
        borderRadius: node.props?.radius ?? 12,
      }}
    >
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <img
        src={src}
        alt={node.props?.alt ?? "Image"}
        draggable={false}
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER;
        }}
        style={{
          width: "100%",
          height: "auto",
          minHeight: 200,
          objectFit: node.props?.objectFit ?? "cover",
          display: "block",
        }}
      />
    </div>
  );
}

/* ============================================================
   ICON
============================================================ */

function IconBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);

  return (
    <div
      data-node-id={node.id}
      {...sel.handlers}
      style={{
        fontSize: node.props?.size ?? 32,
        lineHeight: 1,
        ...style,
        outline: sel.outline,
      }}
    >
      {node.props?.icon ?? "⭐"}
    </div>
  );
}

/* ============================================================
   VIDEO
============================================================ */

function VideoBlock({ node }: { node: BlueprintNode }) {
  return (
    <video
      controls
      src={node.props?.src}
      style={{ width: "100%", borderRadius: 12 }}
    />
  );
}

/* ============================================================
   CODE
============================================================ */

function CodeBlock({ node }: { node: BlueprintNode }) {
  return (
    <pre
      style={{
        background: "#1e293b",
        color: "#e2e8f0",
        padding: 16,
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 14,
      }}
    >
      <code>{node.props?.code ?? "// code"}</code>
    </pre>
  );
}

/* ============================================================
   SPACER
============================================================ */

function Spacer({ node }: { node: BlueprintNode }) {
  return <div style={{ height: node.props?.height ?? 32 }} />;
}

/* ============================================================
   TOOLBAR HELPER
============================================================ */

function toolbar(node: BlueprintNode, ctx: RenderContext, sel: any) {
  return {
    id: node.id,
    label: node.type,
    isSelected: sel.selected,
    onDuplicate: () => ctx.onDuplicateNode?.(node.id),
    onDelete: () => ctx.onDeleteNode?.(node.id),
    onSettings: () => ctx.onSelect?.(node.id),
    onAI: () => ctx.onAIAction?.(node.id, node.type as NodeType),
    onMoveUp: () => ctx.moveUp(node.id),
    onMoveDown: () => ctx.moveDown(node.id),
  };
}