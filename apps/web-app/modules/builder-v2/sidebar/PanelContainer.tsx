"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Wand2,
  Blocks,
  Layers,
  Image as ImageIcon,
  Droplet,
  Settings,
  ArrowDown,
  ArrowUp,
  Box,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Image,
  LayoutPanelLeft,
  MousePointer2,
  Search,
  Square,
  Type,
} from "lucide-react";

import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import AiPanel from "../ai/components/AiPanel";
import BlockMenu from "./panels/BlockMenu";
import MediaLibrary from "../media/components/MediaLibrary";
import { commandBus } from "../core/commands/CommandBus";
import { ReorderNodeCommand } from "../core/commands/ReorderNodeCommand";
import type { BuilderThemeTokens } from "../theme/theme.types";
import { defaultThemeTokens, mergeThemeTokens } from "../theme/defaultTheme";
import { buildThemeTokenMetadata, type ThemeTokenMetadata } from "../theme/themeTokenMetadata";
import { HEADER_FOOTER_EDITABLE_POLICY } from "../theme/globalSectionPolicy";
import ColorPicker from "../inspector/components/ColorPicker";
import { LAYERS_MODERNIZATION_METADATA } from "../layers/layersMetadata";

const LayersPanel = ({ blueprint, selectedId, onSelect }: any) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const reorder = (nodeId: string, direction: "up" | "down") => {
    commandBus.execute(new ReorderNodeCommand(nodeId, direction));
    onSelect(nodeId);
  };

  const allNodeIds = useMemo(() => Object.keys(blueprint.nodes ?? {}), [blueprint.nodes]);
  const normalizedQuery = query.trim().toLowerCase();

  const matchesFilter = (node: BuilderNode) =>
    filter === "all" ||
    node.type === filter ||
    (filter === "hidden" && node.hidden) ||
    (filter === "locked" && node.locked);

  const matchesSearch = (node: BuilderNode) => {
    if (!normalizedQuery) return true;
    return `${node.name ?? ""} ${node.type} ${node.id}`.toLowerCase().includes(normalizedQuery);
  };

  const hasMatchingDescendant = (node: BuilderNode): boolean =>
    node.children.some((childId) => {
      const child = blueprint.nodes[childId];
      if (!child) return false;
      return (matchesFilter(child) && matchesSearch(child)) || hasMatchingDescendant(child);
    });

  const expandAll = () => setCollapsed({});
  const collapseAll = () =>
    setCollapsed(
      Object.fromEntries(
        allNodeIds
          .filter((id) => (blueprint.nodes[id]?.children.length ?? 0) > 0)
          .map((id) => [id, true])
      )
    );

  const renderNode = (nodeId: string, depth = 0): React.ReactNode => {
    const node: BuilderNode | undefined = blueprint.nodes[nodeId];
    if (!node) return null;
    const visibleByFilter = matchesFilter(node) && matchesSearch(node);
    const descendantMatch = hasMatchingDescendant(node);
    if (!visibleByFilter && !descendantMatch) return null;

    const isSelected = node.id === selectedId;
    const parent = node.parentId ? blueprint.nodes[node.parentId] : null;
    const siblingIndex = parent?.children.indexOf(node.id) ?? -1;
    const canMoveUp = Boolean(parent && siblingIndex > 0);
    const canMoveDown = Boolean(parent && siblingIndex >= 0 && siblingIndex < parent.children.length - 1);
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsed[node.id] === true;
    const Icon = layerIcon(node.type);

    return (
      <div key={node.id}>
        <div
          data-layer-node-id={node.id}
          data-layer-multiselect-ready={LAYERS_MODERNIZATION_METADATA.multiSelectMetadata ? "true" : "false"}
          data-layer-keyboard-ready={LAYERS_MODERNIZATION_METADATA.keyboardNavigationMetadata ? "true" : "false"}
          className={`group flex items-center gap-1 rounded-md border border-transparent py-0.5 pr-1 transition ${
            isSelected
              ? "border-blue-400/40 bg-blue-500/20 text-white"
              : "text-white/70 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
          }`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          role="treeitem"
          aria-expanded={hasChildren ? !isCollapsed : undefined}
          tabIndex={0}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) {
                setCollapsed((current) => ({ ...current, [node.id]: !current[node.id] }));
              }
            }}
            className="flex h-6 w-5 items-center justify-center rounded text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label={isCollapsed ? "Expand layer" : "Collapse layer"}
          >
            {hasChildren ? (isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />) : <span className="h-3 w-3" />}
          </button>
          <button
            onClick={() => onSelect(node.id)}
            className="flex min-w-0 flex-1 items-center gap-2 truncate px-1.5 py-1 text-left text-xs"
          >
            <Icon size={14} className="shrink-0 text-white/45" aria-hidden />
            <span className="truncate">{node.name ?? node.type}</span>
            <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/40">{node.type}</span>
          </button>
          {node.parentId && (
            <span className="flex shrink-0 items-center gap-0.5 pr-1">
              <span className="mr-1 h-4 w-px bg-white/10 opacity-0 transition group-hover:opacity-100" aria-hidden />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  reorder(node.id, "up");
                }}
                disabled={!canMoveUp}
                aria-label="Move layer up"
                className="rounded p-1 opacity-55 transition hover:bg-white/10 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  reorder(node.id, "down");
                }}
                disabled={!canMoveDown}
                aria-label="Move layer down"
                className="rounded p-1 opacity-55 transition hover:bg-white/10 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ArrowDown size={12} />
              </button>
            </span>
          )}
        </div>
        {!isCollapsed && node.children?.map((childId) => renderNode(childId, depth + 1))}
      </div>
    );
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      data-layers-modernized="true"
      data-layers-ordering="command-bus"
    >
      <div className="space-y-3 border-b border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-1.5">
          <Search size={14} className="text-white/35" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search layers"
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
          />
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white/60">
            <Filter size={13} aria-hidden />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none"
            >
              <option value="all">All</option>
              <option value="section">Sections</option>
              <option value="container">Containers</option>
              <option value="column">Columns</option>
              <option value="heading">Headings</option>
              <option value="image">Images</option>
              <option value="hidden">Hidden</option>
              <option value="locked">Locked</option>
            </select>
          </label>
          <button type="button" onClick={expandAll} className="rounded-md border border-white/10 px-2 text-xs text-white/55 transition hover:bg-white/10 hover:text-white">
            Expand
          </button>
          <button type="button" onClick={collapseAll} className="rounded-md border border-white/10 px-2 text-xs text-white/55 transition hover:bg-white/10 hover:text-white">
            Collapse
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3" role="tree" aria-label="Builder layers">
        {renderNode(blueprint.root)}
      </div>
    </div>
  );
};

function layerIcon(type: string) {
  if (type === "page") return FileText;
  if (type === "section") return LayoutPanelLeft;
  if (type === "container" || type === "column") return Box;
  if (type === "heading" || type === "text") return Type;
  if (type === "image" || type === "gallery") return Image;
  if (type === "button") return MousePointer2;
  return Square;
}

const ColorsPanel = ({ blueprint }: { blueprint: BuilderBlueprint }) => {
  const tokens = getBlueprintThemeTokens(blueprint);
  const colorSection = buildThemeTokenMetadata(tokens).find((section) => section.id === "colors");
  const buttonSection = buildThemeTokenMetadata(tokens).find((section) => section.id === "buttons");
  const colorTokens = [
    ...(colorSection?.tokens ?? []),
    ...(buttonSection?.tokens.filter((token) => /color/i.test(token.key)) ?? []),
  ];

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        <PanelIntro title="Global colors" body="Theme color tokens used by the canvas, runtime, and token-ready inspector controls." />
        <div className="space-y-3">
          {colorTokens.map((token) => (
            <ThemeTokenField key={token.path} blueprint={blueprint} token={token} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PageSettingsPanel = ({ blueprint }: { blueprint: BuilderBlueprint }) => {
  const sections = buildThemeTokenMetadata(getBlueprintThemeTokens(blueprint)).filter(
    (section) => section.id !== "colors"
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-5">
        <PanelIntro title="Theme settings" body="Global Builder tokens for fonts, spacing, radius, shadows, buttons, and section/container defaults." />
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/70">{section.title}</div>
              <div className="mt-1 text-[11px] leading-4 text-white/40">{section.description}</div>
            </div>
            <div className="space-y-2">
              {section.tokens.slice(0, 8).map((token) => (
                <ThemeTokenField key={token.path} blueprint={blueprint} token={token} compact />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-amber-100/80">Header / footer policy</div>
          <div className="mt-2 space-y-2">
            {HEADER_FOOTER_EDITABLE_POLICY.map((policy) => (
              <div key={policy.kind} className="text-[11px] leading-4 text-amber-50/65">
                <span className="font-medium capitalize text-amber-50">{policy.kind}</span>: native editable section required; opaque blobs and AI-generated global sections are blocked until native editability exists.
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function PanelIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs leading-5 text-white/45">{body}</div>
    </div>
  );
}

function ThemeTokenField({
  blueprint,
  token,
  compact = false,
}: {
  blueprint: BuilderBlueprint;
  token: ThemeTokenMetadata;
  compact?: boolean;
}) {
  const editablePath = token.path.replace(/^theme\./, "");
  const value = token.value;
  const isColor = typeof value === "string" && (/^#|transparent|rgb|hsl/i.test(value) || /color/i.test(token.key));

  const update = (next: unknown) => {
    commandBus.execute({
      id: crypto.randomUUID(),
      name: "Update Theme Token",
      execute(currentBlueprint) {
        return {
          ...currentBlueprint,
          metadata: {
            ...currentBlueprint.metadata,
            updatedAt: new Date().toISOString(),
          },
          theme: {
            id: currentBlueprint.theme?.id ?? "buildez-default",
            name: currentBlueprint.theme?.name ?? "BuildEZ Default",
            preset: currentBlueprint.theme?.preset ?? "buildez-default",
            tokens: setTokenPath(
              (currentBlueprint.theme?.tokens ?? defaultThemeTokens) as Record<string, unknown>,
              editablePath,
              next
            ),
          },
        };
      },
    });
  };

  return (
    <div className={compact ? "space-y-1" : "rounded-md border border-white/10 bg-black/20 p-2"}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-white/65">{token.label}</span>
        <span className="truncate text-[10px] text-white/30">{token.path}</span>
      </div>
      {isColor ? (
        <ColorPicker value={String(value ?? "")} onChange={update} allowClear={false} themeTokenReady />
      ) : (
        <input
          value={String(value ?? "")}
          onChange={(event) => update(coerceTokenValue(event.target.value, value))}
          className="w-full rounded-md border border-white/10 bg-white/[0.06] px-2 py-1.5 text-xs text-white outline-none focus:border-blue-400/60"
        />
      )}
    </div>
  );
}

function getBlueprintThemeTokens(blueprint: BuilderBlueprint): BuilderThemeTokens {
  return mergeThemeTokens(defaultThemeTokens, blueprint.theme?.tokens as any);
}

function setTokenPath(
  source: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const [head, ...rest] = path.split(".");
  if (!head) return source;

  if (rest.length === 0) {
    return {
      ...source,
      [head]: value,
    };
  }

  const current = source[head];
  return {
    ...source,
    [head]: setTokenPath(
      current && typeof current === "object" ? (current as Record<string, unknown>) : {},
      rest.join("."),
      value
    ),
  };
}

function coerceTokenValue(value: string, current: unknown): unknown {
  if (typeof current === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : current;
  }
  return value;
}

/* ============================================================
   PANEL CONFIGURATION
============================================================ */

const PANELS = [
  { id: "ai", icon: Wand2, label: "AI" },
  { id: "blocks", icon: Blocks, label: "Blocks" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "media", icon: ImageIcon, label: "Media" },
  { id: "colors", icon: Droplet, label: "Colors" },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

type PanelId = typeof PANELS[number]["id"];

/* ============================================================
   PROPS
============================================================ */

interface IntegratedLeftSidebarProps {
  blueprint: BuilderBlueprint;
  selectedId: string | null;
  onSelect(id: string | null): void;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;

  /* Builder mutation entry point */
  onAddBlock(type: string): void;

  onRunAI(
    prompt: string,
    context?: Record<string, unknown> | null
  ): Promise<void> | void;
  onAbortAI(): void;
  pageId: string;
  siteId: string;

  aiChatRuntime: {
    status: "idle" | "running" | "success" | "error";
    message?: string;
  };

  onRequestLogoUpload(): void;
  onCapturePrompt?(prompt: string): void;
  onRefine?(request: string, targetSection?: string): void;
  hasGeneratedCode?: boolean;
  onChromeWidthChange?(width: number): void;
}

/* ============================================================
   INTEGRATED LEFT SIDEBAR (LOVABLE-STYLE)
============================================================ */

export default function IntegratedLeftSidebar({
  blueprint,
  selectedId,
  onSelect,
  onUpdateNode,
  onAddBlock,
  onRunAI,
  onAbortAI,
  pageId,
  siteId,
  aiChatRuntime,
  onRequestLogoUpload,
  onCapturePrompt,
  onRefine,
  hasGeneratedCode,
  onChromeWidthChange,
}: IntegratedLeftSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelId | null>("ai");
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  useEffect(() => {
    onChromeWidthChange?.(activePanel ? 420 : 60);
  }, [activePanel, onChromeWidthChange]);

  const handlePanelClick = (panelId: PanelId) => {
    setActivePanel((current) => (current === panelId ? null : panelId));
  };

  const closePanel = () => setActivePanel(null);

  /* ----------------------------------------------------------
     ESC KEY → CLOSE PANEL
  ---------------------------------------------------------- */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePanel) {
        closePanel();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [activePanel]);

  useEffect(() => {
    const openPanelFromEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ panel?: PanelId }>).detail;
      const panel = detail?.panel;
      if (!panel) return;

      const exists = PANELS.some((entry) => entry.id === panel);
      if (!exists) return;

      setActivePanel(panel);
    };

    window.addEventListener("builder:open-panel", openPanelFromEvent);
    return () => window.removeEventListener("builder:open-panel", openPanelFromEvent);
  }, []);

  return (
    <div className="relative z-[9999] flex h-full min-h-0">
      {/* ============================================================
           ICON BAR (ALWAYS VISIBLE)
      ============================================================ */}
      <div
        className="
          h-full w-[60px] pt-5
          bg-black/75
          backdrop-blur-2xl
          border-r border-white/10
          shadow-2xl shadow-black/50
          flex flex-col gap-[2px] py-1
        "
      >
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;

          return (
            <button
              key={panel.id}
              onClick={() => handlePanelClick(panel.id)}
              title={panel.label}
              aria-label={panel.label}
              className={`
                w-full h-[42px]
                flex items-center justify-center
                rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-neutral-300 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.55)]"
                    : "text-neutral-300"
                }
              />
            </button>
          );
        })}
      </div>

      {/* ============================================================
           PANEL CONTENT (SLIDE-OUT)
      ============================================================ */}
      <div
        className={`
          builder-chrome
          flex h-full min-h-0 flex-col
          bg-black/75
          backdrop-blur-2xl
          border-r border-white/10
          shadow-xl shadow-black/50
          transition-all duration-300 ease-out
          overflow-hidden
          ${activePanel ? "w-[360px] opacity-100" : "w-0 opacity-0"}
        `}
      >
        {activePanel && (
          <>
            {/* PANEL HEADER */}
            <div className="builder-chrome h-12 px-4 flex items-center justify-between border-b border-white/10 bg-black/45 backdrop-blur-xl">
              <span className="capitalize text-sm font-medium">
                {PANELS.find((p) => p.id === activePanel)?.label}
              </span>

              <button
                onClick={closePanel}
                className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10 transition"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* PANEL CONTENT (SCROLLABLE) */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {activePanel === "ai" && (
                <AiPanel
                  pageId={pageId}
                  siteId={siteId}
                  onRunAI={onRunAI}
                  onAbortAI={onAbortAI}
                  aiChatRuntime={aiChatRuntime}
                  onRequestLogoUpload={onRequestLogoUpload}
                  onRefine={onRefine}
                  hasGeneratedCode={hasGeneratedCode}
                />
              )}

              {activePanel === "blocks" && (
                <div className="h-full overflow-y-auto">
                  <BlockMenu
                    onAddBlock={onAddBlock}
                    onOpenColumnPicker={() => setShowColumnPicker(true)}
                  />
                </div>
              )}

              {activePanel === "layers" && (
                <LayersPanel
                  blueprint={blueprint}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}

              {activePanel === "media" && (
                <div className="h-full overflow-y-auto p-4">
                  <MediaLibrary
                    siteId={siteId}
                    title="Media"
                    description="Upload and manage this site's assets."
                    pickerMode
                  />
                </div>
              )}

              {activePanel === "colors" && <ColorsPanel blueprint={blueprint} />}

              {activePanel === "settings" && (
                <PageSettingsPanel
                  blueprint={blueprint}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
