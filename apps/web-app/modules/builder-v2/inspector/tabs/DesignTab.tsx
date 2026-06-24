"use client";

import type { BuilderNode } from "../../types/blueprint";
import ColorPicker from "../components/ColorPicker";

interface DesignTabProps {
  node: BuilderNode;
  onUpdateNode(id: string, patch: Partial<BuilderNode>): void;
}

export default function DesignTab({ node, onUpdateNode }: DesignTabProps) {
  const style = node.style ?? {};

  const setStyle = (key: string, value: unknown) => {
    onUpdateNode(node.id, {
      style: {
        ...node.style,
        [key]: value,
      },
    });
  };

  const setProps = (key: string, value: unknown) => {
    onUpdateNode(node.id, {
      props: {
        ...node.props,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Column Layout Direction */}
      {node.type === "column" && (
        <div className="space-y-3 pb-4 border-b border-white/10">
          <h3 className="text-xs font-semibold text-white uppercase">Layout</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-white/70">Direction</label>
            <div className="flex gap-2">
              {[
                { value: "vertical", label: "Vertical", icon: "↕️" },
                { value: "horizontal", label: "Horizontal", icon: "↔️" },
              ].map((dir) => (
                <button
                  key={dir.value}
                  type="button"
                  onClick={() => setProps("layout", dir.value)}
                  className={`flex-1 py-2 px-3 rounded text-xs transition flex items-center gap-1 justify-center ${
                    node.props?.layout === dir.value || (dir.value === "vertical" && !node.props?.layout)
                      ? "bg-blue-500/30 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span>{dir.icon}</span>
                  <span>{dir.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Colors */}
      <div className="space-y-3 pb-4 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white uppercase">Colors</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-white/70">Text color</label>
          <ColorPicker
            value={String(style.color ?? "#0f172a")}
            onChange={(color) => setStyle("color", color)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Background</label>
          <ColorPicker
            value={String(style.backgroundColor ?? "transparent")}
            onChange={(color) => setStyle("backgroundColor", color)}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3 pb-4 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white uppercase">Typography</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-white/70">Font size</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="72"
                value={Number(style.fontSize ?? 16)}
                onChange={(e) => setStyle("fontSize", Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-white/50 w-8 text-right">
                {Number(style.fontSize ?? 16)}px
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/70">Weight</label>
            <select
              value={Number(style.fontWeight ?? 400)}
              onChange={(e) => setStyle("fontWeight", Number(e.target.value))}
              className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white"
            >
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Line height</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.1"
              value={Number(style.lineHeight ?? 1.5)}
              onChange={(e) => setStyle("lineHeight", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">
              {Number(style.lineHeight ?? 1.5).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Alignment</label>
          <div className="flex gap-2">
            {["left", "center", "right", "justify"].map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setStyle("textAlign", align)}
                className={`flex-1 py-2 rounded text-xs transition ${
                  style.textAlign === align
                    ? "bg-blue-500/30 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {align === "left" && "◀"}
                {align === "center" && "◼"}
                {align === "right" && "▶"}
                {align === "justify" && "≡"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3 pb-4 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white uppercase">Spacing</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-white/70">Padding</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="64"
              value={Number(style.padding ?? 0)}
              onChange={(e) => setStyle("padding", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">
              {Number(style.padding ?? 0)}px
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Margin</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="64"
              value={Number(style.margin ?? 0)}
              onChange={(e) => setStyle("margin", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">
              {Number(style.margin ?? 0)}px
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Gap (children spacing)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="64"
              value={Number(style.gap ?? 0)}
              onChange={(e) => setStyle("gap", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">
              {Number(style.gap ?? 0)}px
            </span>
          </div>
        </div>
      </div>

      {/* Border & Size */}
      <div className="space-y-3 pb-4 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white uppercase">Border & Size</h3>
        
        <div className="space-y-2">
          <label className="text-xs text-white/70">Border radius</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="64"
              value={Number(style.borderRadius ?? 0)}
              onChange={(e) => setStyle("borderRadius", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-8 text-right">
              {Number(style.borderRadius ?? 0)}px
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-white/70">Min height</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={Number(style.minHeight ?? 0)}
              onChange={(e) => setStyle("minHeight", Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white/50 w-12 text-right">
              {Number(style.minHeight ?? 0)}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
