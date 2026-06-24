// /Users/kailash/buildez/apps/web-app/modules/builder/renderer/PageRenderer.tsx

"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  CSSProperties,
} from "react";
import * as LucideIcons from "lucide-react";

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
  | "spacer"
  | "html-block"
  | "react-component";

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
  onRequestAdd?: (parentId: string) => void;
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
const SELECT_OUTLINE = "2px solid rgba(59,130,246,1)";

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
   LUCIDE ICON HELPER
============================================================ */

type LucideIconName = keyof typeof LucideIcons;

function getLucideIcon(name: string): React.ComponentType<any> | null {
  const pascalName = name
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as LucideIconName;

  const Icon = LucideIcons[pascalName] || LucideIcons[name as LucideIconName];
  
  if (Icon && typeof Icon === "function") {
    return Icon as React.ComponentType<any>;
  }
  
  return null;
}

/* ============================================================
   PAGE RENDERER ROOT
============================================================ */

export function PageRenderer(props: PageRendererProps) {
  const storeTokens = useCanvasStore((s) => s.designTokens);
  const device = useCanvasStore((s) => s.device);

  const designTokens = 
    storeTokens ?? 
    props.designTokens ?? 
    props.blueprint?.props?.designTokens;

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

      // ✅ React Component (AI Generated TSX)
      if (node.type === "react-component") {
        return <ReactComponentNode key={node.id} node={node} ctx={ctx} />;
      }

      // ✅ HTML Block (Legacy HTML)
      if (node.type === "html-block") {
        return <HTMLBlock key={node.id} node={node} ctx={ctx} />;
      }

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
   ✅ REACT COMPONENT NODE (Direct Iframe Render - No Parsing!)
============================================================ */

function ReactComponentNode({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const tsxCode = node.props?.code || "";
  
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef || !tsxCode) return;

    try {
      const doc = iframeRef.contentDocument;
      if (!doc) {
        setError("Failed to access iframe document");
        return;
      }

      // ✅ Write complete HTML with Tailwind + React
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"><\/script>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                overflow-x: hidden;
                font-family: system-ui, -apple-system, sans-serif;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              try {
                ${tsxCode}
                
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(<Website />);
              } catch (err) {
                document.body.innerHTML = \`
                  <div style="padding: 40px; background: #fee; border: 2px solid #f00; margin: 20px; border-radius: 8px;">
                    <h2 style="color: #c00; margin: 0 0 16px 0;">⚠️ React Component Error</h2>
                    <pre style="background: #fff; padding: 12px; border-radius: 4px; overflow: auto;">\${err.toString()}</pre>
                  </div>
                \`;
              }
            <\/script>
          </body>
        </html>
      `);
      doc.close();
      setError(null);
    } catch (err: any) {
      console.error('[ReactComponentNode] Iframe error:', err);
      setError(err.message);
    }
  }, [iframeRef, tsxCode]);

  if (error) {
    return (
      <div
        data-node-id={node.id}
        style={{
          padding: 40,
          background: '#fee',
          border: '2px solid #f00',
          margin: 20,
          borderRadius: 8,
        }}
      >
        <h2 style={{ color: '#c00', margin: '0 0 16px 0' }}>⚠️ Component Render Error</h2>
        <pre style={{ background: '#fff', padding: 12, borderRadius: 4, overflow: 'auto' }}>
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div
      data-node-id={node.id}
      data-node-type="react-component"
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        isolation: "isolate",
        outline: sel.outline,
      }}
    >
      {/* Render AI-generated React in isolated iframe */}
      <iframe
        ref={setIframeRef}
        style={{
          width: "100%",
          minHeight: "100vh",
          border: "none",
          display: "block",
        }}
        title="AI Generated Component"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Selection Toolbar */}
      {sel.selected && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex",
            gap: 8,
            background: "rgba(59, 130, 246, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "10px 16px",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>⚛️</span>
            AI Generated React Component
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("React Code:", tsxCode);
              // TODO: Open modal with code editor
              alert("Code logged to console. Code editor modal coming soon!");
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            View Code
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this AI-generated component?")) {
                ctx.onDeleteNode?.(node.id);
              }
            }}
            style={{
              background: "rgba(239, 68, 68, 0.9)",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ✅ HTML-BLOCK (LEGACY - FOR BACKWARD COMPATIBILITY)
============================================================ */

function HTMLBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const htmlContent = node.props?.html || "";

  return (
    <div
      data-node-id={node.id}
      data-node-type="html-block"
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        isolation: "isolate",
        outline: sel.outline,
      }}
    >
      {/* Load Tailwind CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      
      {/* AI-Generated HTML Content */}
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ 
          width: "100%",
          minHeight: "inherit",
        }}
      />

      {/* Selection Toolbar */}
      {sel.selected && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1000,
            display: "flex",
            gap: 8,
            background: "rgba(59, 130, 246, 0.95)",
            padding: "8px 12px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>🎨</span>
            AI Generated HTML
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this HTML block?")) {
                ctx.onDeleteNode?.(node.id);
              }
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE NODE
============================================================ */

function PageNode({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const style = getNodeStyle(node, ctx);
  const className = node.props?.className || "";

  return (
    <div
      data-node-id={node.id}
      className={`buildez-page ${className}`}
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
  const className = node.props?.className || "";

  return (
    <header
      data-node-id={node.id}
      className={`be-header ${className}`}
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
        onAddInside={() => ctx.onRequestAdd?.(node.id)}
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
  const className = node.props?.className || "";

  return (
    <footer
      data-node-id={node.id}
      className={`be-footer ${className}`}
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
        onAddInside={() => ctx.onRequestAdd?.(node.id)}
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
  const className = node.props?.className || "";

  return (
    <section
      data-node-id={node.id}
      className={`be-section ${className}`}
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
        onAddInside={() => ctx.onRequestAdd?.(node.id)}
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
  const className = node.props?.className || "";
  const isColumns = node.props?.layout === "columns";
  const isGrid = node.props?.layout === "grid";

  const containerStyle: CSSProperties = {
    position: "relative",
    ...style,
    width: "100%",
    maxWidth: node.props?.maxWidth ?? 1200,
    marginLeft: "auto",
    marginRight: "auto",
    minWidth: 0,
    boxSizing: "border-box",
    outline: sel.outline,
  };

  if (isGrid) {
    containerStyle.display = "grid";
    containerStyle.gridTemplateColumns = `repeat(${node.props?.columns ?? 3}, 1fr)`;
    containerStyle.gap = node.props?.gap ?? 24;
  } else {
    containerStyle.display = "flex";
    containerStyle.flexDirection = isColumns ? "row" : "column";
    containerStyle.gap = node.props?.gap ?? 24;
  }

  return (
    <div
      data-node-id={node.id}
      data-layout={node.props?.layout}
      className={`be-container ${className}`}
      {...sel.handlers}
      style={containerStyle}
    >
      <SectionToolbar
        id={node.id}
        nodeType="container"
        label="Container"
        isSelected={sel.selected}
        onAddInside={() => ctx.onRequestAdd?.(node.id)}
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
  const className = node.props?.className || "";
  const widthFromProps = node.props?.width ?? node.props?.style?.width;

  return (
    <div
      data-node-id={node.id}
      className={`be-column ${className}`}
      {...sel.handlers}
      style={{
        position: "relative",
        ...style,
        display: "flex",
        flexDirection: "column",
        flex: widthFromProps ? "0 0 auto" : node.props?.flex || "1 1 0%",
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
        onAddInside={() => ctx.onRequestAdd?.(node.id)}
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
  const className = node.props?.className || "";
  const Tag = (node.props?.level ?? "h2") as keyof JSX.IntrinsicElements;
  const [draft, setDraft] = useState(node.props?.text ?? "");

  useEffect(() => {
    setDraft(node.props?.text ?? "");
  }, [node.props?.text]);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <Tag
        className={`be-heading ${className}`}
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
  const className = node.props?.className || "";
  const source = node.props?.html ?? node.props?.text ?? "";
  const [draft, setDraft] = useState(source);

  useEffect(() => {
    setDraft(source);
  }, [source]);

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <div
        className={`be-text ${className}`}
        data-role="body"
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
  const className = node.props?.className || "";
  const colors = ctx.pageTokens?.colors;
  const variant = node.props?.variant ?? "primary";

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: style.backgroundColor ?? colors?.primary ?? "#2563eb",
      color: style.color ?? colors?.onPrimary ?? "#ffffff",
      border: "none",
    },
    secondary: {
      backgroundColor: "transparent",
      color: colors?.primary ?? "#2563eb",
      border: `2px solid ${colors?.primary ?? "#2563eb"}`,
    },
    ghost: {
      backgroundColor: "transparent",
      color: colors?.textPrimary ?? "#0f172a",
      border: "none",
    },
    gradient: {
      background: `linear-gradient(135deg, ${colors?.primary ?? "#2563eb"}, ${colors?.accent ?? "#6366f1"})`,
      color: "#ffffff",
      border: "none",
      boxShadow: `0 4px 14px ${colors?.primary ?? "#2563eb"}40`,
    },
  };

  const buttonStyle = variantStyles[variant] ?? variantStyles.primary;

  return (
    <div data-node-id={node.id} style={{ position: "relative" }}>
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <button
        className={`be-button ${className}`}
        data-variant={variant}
        {...sel.handlers}
        style={{
          cursor: "pointer",
          padding: "14px 28px",
          borderRadius: style.borderRadius ?? 12,
          fontWeight: 600,
          fontSize: 16,
          transition: "all 0.2s ease",
          ...style,
          ...buttonStyle,
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
  const className = node.props?.className || "";

  const PLACEHOLDER = "https://placehold.co/800x450/e2e8f0/94a3b8?text=Image";
  const src = node.props?.src || PLACEHOLDER;

  const effect = node.props?.effect ?? "none";
  const effectStyles: Record<string, CSSProperties> = {
    none: {},
    shadow: {
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    },
    border: {
      border: "4px solid rgba(255,255,255,0.9)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    },
    glow: {
      boxShadow: `0 0 60px ${ctx.pageTokens?.colors?.primary ?? "#2563eb"}30`,
    },
  };

  return (
    <div
      data-node-id={node.id}
      className={`be-image-wrapper ${className}`}
      {...sel.handlers}
      style={{
        position: "relative",
        width: "100%",
        ...style,
        ...effectStyles[effect],
        outline: sel.outline,
        overflow: "hidden",
        borderRadius: node.props?.radius ?? 12,
      }}
    >
      <BlockToolbar {...toolbar(node, ctx, sel)} />
      <img
        className="be-image"
        src={src}
        alt={node.props?.alt ?? "Image"}
        loading="lazy"
        decoding="async"
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
          aspectRatio: node.props?.aspectRatio,
        }}
      />
    </div>
  );
}

/* ============================================================
   ICON (LUCIDE ICONS)
============================================================ */

function IconBlock({ node, ctx }: { node: BlueprintNode; ctx: RenderContext }) {
  const sel = useSelectable(node.id, ctx.selectedId, ctx.onSelect);
  const style = getNodeStyle(node, ctx);
  const className = node.props?.className || "";
  const colors = ctx.pageTokens?.colors;
  
  const iconName = node.props?.icon ?? "Sparkles";
  const size = node.props?.size ?? 40;
  const variant = node.props?.variant ?? "default";

  const IconComponent = getLucideIcon(iconName);

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      color: colors?.primary ?? "#2563eb",
    },
    filled: {
      backgroundColor: colors?.primary ?? "#2563eb",
      color: colors?.onPrimary ?? "#ffffff",
      padding: 12,
      borderRadius: 12,
    },
    outlined: {
      border: `2px solid ${colors?.primary ?? "#2563eb"}`,
      color: colors?.primary ?? "#2563eb",
      padding: 12,
      borderRadius: 12,
    },
    soft: {
      backgroundColor: `${colors?.primary ?? "#2563eb"}15`,
      color: colors?.primary ?? "#2563eb",
      padding: 12,
      borderRadius: 12,
    },
    gradient: {
      background: `linear-gradient(135deg, ${colors?.primary ?? "#2563eb"}, ${colors?.accent ?? "#6366f1"})`,
      color: "#ffffff",
      padding: 12,
      borderRadius: 12,
    },
  };

  const containerStyle = variantStyles[variant] ?? variantStyles.default;

  return (
    <div
      data-node-id={node.id}
      className={`be-icon ${className}`}
      {...sel.handlers}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        ...style,
        ...containerStyle,
        outline: sel.outline,
      }}
    >
      {IconComponent ? (
        <IconComponent size={size} strokeWidth={node.props?.strokeWidth ?? 2} />
      ) : (
        <LucideIcons.Sparkles size={size} strokeWidth={2} />
      )}
    </div>
  );
}

/* ============================================================
   VIDEO
============================================================ */

function VideoBlock({ node }: { node: BlueprintNode }) {
  const className = node.props?.className || "";
  return (
    <video
      className={`be-video ${className}`}
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
  const className = node.props?.className || "";
  return (
    <pre
      className={`be-code ${className}`}
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
  const className = node.props?.className || "";
  return (
    <div 
      className={`be-spacer ${className}`}
      style={{ height: node.props?.height ?? 32 }} 
    />
  );
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
