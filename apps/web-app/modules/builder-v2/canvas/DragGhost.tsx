"use client";

import {
  Heading,
  Text as TextIcon,
  Square,
  Image as ImageIcon,
  LayoutTemplate,
  Box,
  SeparatorHorizontal,
} from "lucide-react";

const ICONS: Record<string, any> = {
  heading: Heading,
  text: TextIcon,
  button: Square,
  image: ImageIcon,
  section: LayoutTemplate,
  container: Box,
  spacer: SeparatorHorizontal,
};

interface DragGhostState {
  type: string;
  x: number;
  y: number;
}

export default function DragGhost({
  drag,
}: {
  drag: DragGhostState | null;
}) {
  if (!drag) return null;

  const Icon = ICONS[drag.type] ?? LayoutTemplate;

  return (
    <div
      className="fixed z-[13000] pointer-events-none"
      style={{
        left: drag.x,
        top: drag.y,
        transform: "translate3d(14px, 14px, 0)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0F1118]/95 border border-blue-400/40 shadow-[0_8px_30px_rgba(37,99,235,0.28)] backdrop-blur-xl">
        <Icon size={16} className="text-white" />
        <span className="text-sm text-white capitalize">
          Moving {drag.type}
        </span>
      </div>
    </div>
  );
}
