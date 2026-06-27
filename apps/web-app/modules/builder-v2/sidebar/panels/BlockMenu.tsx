"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Heading,
  Text as TextIcon,
  Square,
  Image as ImageIcon,
  Box,
  Columns,
  SeparatorHorizontal,
  LayoutTemplate,
  Star,
  Video as VideoIcon,
  Store,
} from "lucide-react";
import type { NodeType } from "../../types/blueprint";
import WidgetMarketplaceModal from "../../marketplace/components/WidgetMarketplaceModal";

/* ============================================================
   V4 BLOCK TYPES (LOCKED)
============================================================ */

export type V4BlockType = NodeType;

interface BlockDef {
  type: V4BlockType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface BuilderDragWindow extends Window {
  __builderDragId?: string | null;
  __builderDragType?: string | null;
  __builderDragSource?: string | null;
}

/* ============================================================
   BLOCK DEFINITIONS
============================================================ */

const CONTENT_BLOCKS: BlockDef[] = [
  {
    type: "heading",
    title: "Heading",
    description: "Title or headline",
    icon: Heading,
  },
  {
    type: "text",
    title: "Text",
    description: "Paragraph text",
    icon: TextIcon,
  },
  {
    type: "button",
    title: "Button",
    description: "Call to action",
    icon: Square,
  },
  {
    type: "image",
    title: "Image",
    description: "Single image",
    icon: ImageIcon,
  },
  {
    type: "icon",
    title: "Icon",
    description: "Single icon or symbol",
    icon: Star,
  },
  {
    type: "video",
    title: "Video",
    description: "Video embed or upload",
    icon: VideoIcon,
  },
];

const LAYOUT_BLOCKS: BlockDef[] = [
  {
    type: "section",
    title: "Section",
    description: "Page section",
    icon: LayoutTemplate,
  },
  {
    type: "container",
    title: "Container",
    description: "Content wrapper",
    icon: Box,
  },
  {
    type: "column",
    title: "Columns",
    description: "Multi-column layout",
    icon: Columns,
  },
  {
    type: "spacer",
    title: "Spacer",
    description: "Vertical spacing",
    icon: SeparatorHorizontal,
  },
];

/* ============================================================
   BLOCK MENU
============================================================ */

export default function BlockMenu({
  onAddBlock,
  onOpenColumnPicker,
}: {
  onAddBlock(type: V4BlockType): void;
  onOpenColumnPicker(): void;
}) {
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);

  function handleAddBlock(type: V4BlockType) {
    console.log("[BlockMenu] add block:", type);

    if (type === "column") {
      onOpenColumnPicker();
      return;
    }

    onAddBlock(type);
  }

  return (
    <div className="px-5 pt-6 pb-10 space-y-10">
      <button
        type="button"
        onClick={() => setMarketplaceOpen(true)}
        className="group flex w-full items-center gap-4 rounded-2xl border border-blue-400/25 bg-blue-500/10 px-4 py-4 text-left transition hover:border-blue-300/45 hover:bg-blue-500/15"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-300/25 bg-blue-500/15 text-blue-200">
          <Store size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">
            Widget Marketplace
          </div>
          <div className="mt-1 text-xs leading-5 text-neutral-400">
            Browse premium and default widgets
          </div>
        </div>
      </button>

      <BlockCategory
        title="Content"
        description="Basic building blocks"
        blocks={CONTENT_BLOCKS}
        onAdd={handleAddBlock}
      />

      <BlockCategory
        title="Layout"
        description="Structure & spacing"
        blocks={LAYOUT_BLOCKS}
        onAdd={handleAddBlock}
      />

      <WidgetMarketplaceModal
        open={marketplaceOpen}
        onClose={() => setMarketplaceOpen(false)}
        onInsert={(type) => handleAddBlock(type)}
      />
    </div>
  );
}

/* ============================================================
   CATEGORY UI
   (Functionality unchanged - UI redesigned)
============================================================ */

function BlockCategory({
  title,
  description,
  blocks,
  onAdd,
}: {
  title: string;
  description: string;
  blocks: BlockDef[];
  onAdd(type: V4BlockType): void;
}) {
  const transparentDragImageRef = useRef<HTMLImageElement | null>(null);

  function getTransparentDragImage(): HTMLImageElement {
    if (transparentDragImageRef.current) {
      return transparentDragImageRef.current;
    }

    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    transparentDragImageRef.current = img;
    return img;
  }

  function handleDragStart(e: React.DragEvent<HTMLButtonElement>, block: BlockDef) {
    const dragId = `new:${block.type}:${crypto.randomUUID()}`;
    const payload = {
      id: dragId,
      nodeId: dragId,
      type: block.type,
      source: "block-menu",
    };

    const builderWindow = window as BuilderDragWindow;
    // eslint-disable-next-line react-hooks/immutability
    builderWindow.__builderDragId = dragId;
    // eslint-disable-next-line react-hooks/immutability
    builderWindow.__builderDragType = block.type;
    // eslint-disable-next-line react-hooks/immutability
    builderWindow.__builderDragSource = "block-menu";

    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setDragImage(getTransparentDragImage(), 0, 0);
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.setData("text/plain", block.type);

    window.dispatchEvent(
      new CustomEvent("builder:start-drag", {
        detail: {
          id: dragId,
          type: block.type,
          source: "block-menu",
          x: e.clientX,
          y: e.clientY,
        },
      })
    );
  }

  function handleDragEnd() {
    const builderWindow = window as BuilderDragWindow;
    builderWindow.__builderDragId = null;
    builderWindow.__builderDragType = null;
    builderWindow.__builderDragSource = null;
    window.dispatchEvent(new CustomEvent("builder:drop-clear"));
    window.dispatchEvent(new CustomEvent("builder:end-drag"));
  }

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="px-1">
        <h3 className="text-sm font-semibold tracking-wide text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-neutral-400">
          {description}
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {blocks.map((block) => {
          const Icon = block.icon;

          return (
            <button
              key={block.type}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              onDragEnd={handleDragEnd}
              onClick={() => onAdd(block.type)}
              className="
                group
                relative
                flex
                w-full
                items-center
                gap-4
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#121418]
                px-4
                py-4
                text-left
                transition-all
                duration-200
                hover:border-blue-500/40
                hover:bg-[#171A20]
                hover:shadow-[0_12px_30px_rgba(0,0,0,.35)]
                active:scale-[0.985]
              "
            >
              {/* subtle glow */}
              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                  bg-gradient-to-r
                  from-blue-500/5
                  via-transparent
                  to-cyan-400/5
                "
              />

              {/* Icon */}
              <div
                className="
                  relative
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.05]
                  transition-all
                  duration-200
                  group-hover:border-blue-500/30
                  group-hover:bg-blue-500/10
                "
              >
                <Icon
                  size={20}
                  className="
                    text-neutral-200
                    transition-colors
                    duration-200
                    group-hover:text-white
                  "
                />
              </div>

              {/* Content */}
              <div className="relative flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-white">
                  {block.title}
                </div>

                <div className="mt-1 text-sm text-neutral-400">
                  {block.description}
                </div>
              </div>

              {/* Add Button */}
              <div
                className="
                  relative
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.05]
                  transition-all
                  duration-200
                  group-hover:border-blue-500
                  group-hover:bg-blue-500
                "
              >
                <Plus
                  size={16}
                  className="
                    text-neutral-300
                    transition-colors
                    duration-200
                    group-hover:text-white
                  "
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
