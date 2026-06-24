"use client";

import React from "react";
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
  Mail,
  Star,
  Video as VideoIcon,
} from "lucide-react";

/* ============================================================
   V4 BLOCK TYPES (LOCKED)
============================================================ */

export type V4BlockType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "icon"
  | "video"
  | "section"
  | "container"
  | "column"
  | "spacer"
  | "header"
  | "footer";

interface BlockDef {
  type: V4BlockType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}

/* ============================================================
   BLOCK DEFINITIONS — V4 ONLY
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

const SITE_BLOCKS: BlockDef[] = [
  {
    type: "header",
    title: "Header",
    description: "Site header",
    icon: LayoutTemplate,
  },
  {
    type: "footer",
    title: "Footer",
    description: "Site footer",
    icon: Mail,
  },
];

/* ============================================================
   BLOCK MENU — V4 CANONICAL (NO GLOBAL EVENTS)
============================================================ */

export default function BlockMenu({
  onAddBlock,
  onOpenColumnPicker,
}: {
  onAddBlock(type: V4BlockType): void;
  onOpenColumnPicker(): void;
}) {
  /* ----------------------------------------------------------
     CLICK → ADD BLOCK (DETERMINISTIC)
  ---------------------------------------------------------- */
  function handleAddBlock(type: V4BlockType) {
    console.log("[BlockMenu] add block:", type);

    // Columns always go via structure picker
    if (type === "column") {
      onOpenColumnPicker();
      return;
    }

    onAddBlock(type);
  }

  return (
    <div className="space-y-10 pb-12 px-4 pt-6">
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

      <BlockCategory
        title="Site"
        description="Global layout"
        blocks={SITE_BLOCKS}
        onAdd={handleAddBlock}
      />
    </div>
  );
}

/* ============================================================
   CATEGORY UI — CLICK ONLY (NO DRAG SIDE EFFECTS)
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
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-sm tracking-wide">
          {title}
        </h3>
        <p className="text-xs text-neutral-400">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {blocks.map((block) => {
          const Icon = block.icon;

          return (
            <button
              key={block.type}
              onClick={() => onAdd(block.type)}
              className="
                group w-full rounded-xl p-4 text-left
                bg-gradient-to-br from-white/[0.07] to-white/[0.03]
                backdrop-blur-xl
                border border-white/10
                hover:border-white/20
                hover:bg-white/[0.12]
                transition-all
              "
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.08] border border-white/10">
                  <Icon size={18} className="text-neutral-200" />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-neutral-100">
                    {block.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {block.description}
                  </p>
                </div>

                <Plus
                  size={16}
                  className="text-neutral-300 group-hover:text-white transition"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}