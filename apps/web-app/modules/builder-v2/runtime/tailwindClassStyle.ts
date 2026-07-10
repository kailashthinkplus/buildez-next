import type { CSSProperties } from "react";

const SPACING_SCALE: Record<string, number> = {
  "0": 0,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
};

const FONT_SIZES: Record<string, CSSProperties> = {
  "text-sm": { fontSize: 14, lineHeight: 1.45 },
  "text-base": { fontSize: 16, lineHeight: 1.6 },
  "text-lg": { fontSize: 18, lineHeight: 1.6 },
  "text-xl": { fontSize: 20, lineHeight: 1.4 },
  "text-2xl": { fontSize: 24, lineHeight: 1.25 },
  "text-3xl": { fontSize: 30, lineHeight: 1.2 },
  "text-4xl": { fontSize: 40, lineHeight: 1.1 },
  "text-5xl": { fontSize: 52, lineHeight: 1.05 },
  "text-6xl": { fontSize: 64, lineHeight: 1.02 },
};

const MAX_WIDTHS: Record<string, string> = {
  "max-w-md": "448px",
  "max-w-xl": "576px",
  "max-w-2xl": "672px",
  "max-w-3xl": "768px",
  "max-w-4xl": "896px",
  "max-w-5xl": "1024px",
  "max-w-6xl": "1152px",
  "max-w-7xl": "1280px",
};

const SHADOWS: Record<string, string> = {
  "shadow-sm": "0 1px 2px rgba(15, 23, 42, 0.08)",
  shadow: "0 8px 20px rgba(15, 23, 42, 0.10)",
  "shadow-md": "0 14px 34px rgba(15, 23, 42, 0.12)",
  "shadow-lg": "0 24px 60px rgba(15, 23, 42, 0.16)",
  "shadow-xl": "0 32px 80px rgba(15, 23, 42, 0.18)",
  "shadow-2xl": "0 42px 100px rgba(15, 23, 42, 0.22)",
};

function applySpacing(
  style: CSSProperties,
  key: string,
  value: number
) {
  if (key === "p") style.padding = value;
  if (key === "px") {
    style.paddingLeft = value;
    style.paddingRight = value;
  }
  if (key === "py") {
    style.paddingTop = value;
    style.paddingBottom = value;
  }
  if (key === "pt") style.paddingTop = value;
  if (key === "pr") style.paddingRight = value;
  if (key === "pb") style.paddingBottom = value;
  if (key === "pl") style.paddingLeft = value;
  if (key === "m") style.margin = value;
  if (key === "mx") {
    style.marginLeft = "auto";
    style.marginRight = "auto";
  }
  if (key === "my") {
    style.marginTop = value;
    style.marginBottom = value;
  }
  if (key === "mt") style.marginTop = value;
  if (key === "mr") style.marginRight = value;
  if (key === "mb") style.marginBottom = value;
  if (key === "ml") style.marginLeft = value;
  if (key === "gap") style.gap = value;
}

function colorFromClass(token: string) {
  const arbitrary = token.match(/^\[(#[0-9a-fA-F]{3,8})\]$/);
  if (arbitrary) return arbitrary[1];

  const colors: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    "slate-50": "#f8fafc",
    "slate-100": "#f1f5f9",
    "slate-200": "#e2e8f0",
    "slate-500": "#64748b",
    "slate-600": "#475569",
    "slate-700": "#334155",
    "slate-800": "#1e293b",
    "slate-900": "#0f172a",
    "gray-50": "#f9fafb",
    "gray-100": "#f3f4f6",
    "gray-600": "#4b5563",
    "gray-700": "#374151",
    "gray-900": "#111827",
    "blue-600": "#2563eb",
    "orange-500": "#f97316",
    "emerald-600": "#059669",
    "red-600": "#dc2626",
  };

  return colors[token];
}

export function styleFromTailwindClassName(
  className: unknown
): CSSProperties {
  if (typeof className !== "string" || !className.trim()) return {};

  const style: CSSProperties = {};
  const classes = className.split(/\s+/).filter(Boolean);

  for (const raw of classes) {
    const cls = raw.replace(/^(sm|md|lg|xl|2xl):/, "");
    const spacing = cls.match(/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap)-(\d+)$/);
    if (spacing) {
      const value = SPACING_SCALE[spacing[2]];
      if (value !== undefined) applySpacing(style, spacing[1], value);
      continue;
    }

    if (FONT_SIZES[cls]) Object.assign(style, FONT_SIZES[cls]);
    if (MAX_WIDTHS[cls]) style.maxWidth = MAX_WIDTHS[cls];
    if (SHADOWS[cls]) style.boxShadow = SHADOWS[cls];

    if (cls === "relative") style.position = "relative";
    if (cls === "absolute") style.position = "absolute";
    if (cls === "flex") style.display = "flex";
    if (cls === "grid") style.display = "grid";
    if (cls === "flex-col") style.flexDirection = "column";
    if (cls === "flex-row") style.flexDirection = "row";
    if (cls === "flex-wrap") style.flexWrap = "wrap";
    if (cls === "items-center") style.alignItems = "center";
    if (cls === "items-start") style.alignItems = "flex-start";
    if (cls === "items-end") style.alignItems = "flex-end";
    if (cls === "justify-center") style.justifyContent = "center";
    if (cls === "justify-between") style.justifyContent = "space-between";
    if (cls === "text-center") style.textAlign = "center";
    if (cls === "font-medium") style.fontWeight = 500;
    if (cls === "font-semibold") style.fontWeight = 600;
    if (cls === "font-bold") style.fontWeight = 700;
    if (cls === "font-black") style.fontWeight = 900;
    if (cls === "leading-tight") style.lineHeight = 1.1;
    if (cls === "leading-relaxed") style.lineHeight = 1.65;
    if (cls === "w-full") style.width = "100%";
    if (cls === "w-32") style.width = 128;
    if (cls === "h-32") style.height = 128;
    if (cls === "min-h-screen") style.minHeight = "100vh";
    if (cls === "object-cover") style.objectFit = "cover";
    if (cls === "overflow-hidden") style.overflow = "hidden";
    if (cls === "rounded-md") style.borderRadius = 6;
    if (cls === "rounded-lg") style.borderRadius = 10;
    if (cls === "rounded-xl") style.borderRadius = 14;
    if (cls === "rounded-2xl") style.borderRadius = 18;
    if (cls === "rounded-full") style.borderRadius = 9999;
    if (cls === "bottom-4") style.bottom = 16;
    if (cls === "right-4") style.right = 16;

    const gridCols = cls.match(/^grid-cols-(\d+)$/);
    if (gridCols) {
      style.gridTemplateColumns = `repeat(${Number(gridCols[1])}, minmax(0, 1fr))`;
    }

    const bgMatch = cls.match(/^bg-(.+)$/);
    if (bgMatch) {
      const color = colorFromClass(bgMatch[1]);
      if (color) style.backgroundColor = color;
    }

    const textMatch = cls.match(/^text-(.+)$/);
    if (textMatch && !FONT_SIZES[cls]) {
      const color = colorFromClass(textMatch[1]);
      if (color) style.color = color;
    }
  }

  return style;
}
