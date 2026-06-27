"use client";

import type { BuilderNode, BuilderStyle } from "../../types/blueprint";
import type React from "react";
import { ChevronDown } from "lucide-react";

export type InspectorDevice = "desktop" | "tablet" | "mobile";

export const DEVICES: { id: InspectorDevice; label: string }[] = [
  { id: "desktop", label: "Desktop" },
  { id: "tablet", label: "Tablet" },
  { id: "mobile", label: "Mobile" },
];

export const inputClass =
  "w-full min-w-0 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-2 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60 focus:bg-white/[0.09]";

export const selectClass = `${inputClass} appearance-none`;

const BOX_STYLE_SIDES = {
  padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
} as const;
const BOX_STYLE_ENTRIES = [
  { base: "padding", sides: BOX_STYLE_SIDES.padding },
  { base: "margin", sides: BOX_STYLE_SIDES.margin },
] as const;

function normalizeBoxStyleUpdate(
  style: BuilderStyle | undefined,
  key: string,
  value: unknown
) {
  const next = {
    ...(style ?? {}),
    [key]: value,
  } as Record<string, unknown>;

  for (const { base, sides } of BOX_STYLE_ENTRIES) {
    if (key === base) {
      sides.forEach((side) => {
        delete next[side];
      });
    }

    if ((sides as readonly string[]).includes(key)) {
      delete next[base];
    }
  }

  return next as BuilderStyle;
}

export function getAdvanced(node: BuilderNode): Record<string, unknown> {
  const value = node.props?.advanced;
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function getResponsiveValue(
  value: unknown,
  device: InspectorDevice,
  fallback: unknown = ""
) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const responsive = value as Record<string, unknown>;
    return responsive[device] ?? responsive.desktop ?? fallback;
  }

  return value ?? fallback;
}

export function setResponsiveStyleValue(
  node: BuilderNode,
  key: keyof BuilderStyle | string,
  value: unknown,
  device: InspectorDevice,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  const current = node.style?.[key] as unknown;
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : current !== undefined && device !== "desktop"
        ? { desktop: current }
        : {};
  const next = { ...base, [device]: value };

  onUpdateNode(node.id, {
    style: normalizeBoxStyleUpdate(node.style, String(key), next),
  });
}

export function setStyleValue(
  node: BuilderNode,
  key: keyof BuilderStyle | string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  onUpdateNode(node.id, {
    style: normalizeBoxStyleUpdate(node.style, String(key), value),
  });
}

export function setPropValue(
  node: BuilderNode,
  key: string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  onUpdateNode(node.id, {
    props: {
      ...node.props,
      [key]: value,
    },
  });
}

export function setAdvancedValue(
  node: BuilderNode,
  key: string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  onUpdateNode(node.id, {
    props: {
      ...node.props,
      advanced: {
        ...getAdvanced(node),
        [key]: value,
      },
    },
  });
}

export function setAdvancedGroupValue(
  node: BuilderNode,
  group: string,
  key: string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  const advanced = getAdvanced(node);
  const current = advanced[group];
  const groupValue =
    current && typeof current === "object" ? (current as Record<string, unknown>) : {};

  setAdvancedValue(node, group, { ...groupValue, [key]: value }, onUpdateNode);
}

export function DeviceSwitcher({
  value,
  onChange,
}: {
  value: InspectorDevice;
  onChange(value: InspectorDevice): void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-md border border-white/10 bg-black/20 p-1">
      {DEVICES.map((device) => (
        <button
          key={device.id}
          type="button"
          onClick={() => onChange(device.id)}
          className={`rounded px-2 py-1.5 text-[11px] font-medium transition ${
            value === device.id
              ? "bg-blue-500 text-white"
              : "text-white/55 hover:bg-white/10 hover:text-white"
          }`}
        >
          {device.label}
        </button>
      ))}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-white/10 bg-white/[0.035]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-white/75">
            {title}
          </span>
          {description && (
            <span className="mt-0.5 block text-[11px] leading-4 text-white/40">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className="text-white/35 transition group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="min-w-0 space-y-4 border-t border-white/10 px-3 py-3">
        {children}
      </div>
    </details>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-white/65">
        {label}
        {hint && <span className="text-[10px] font-normal text-white/35">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange(value: string): void;
  placeholder?: string;
}) {
  return (
    <input
      value={value === undefined || value === null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: unknown;
  onChange(value: string): void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value === undefined || value === null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputClass} resize-y`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: unknown;
  onChange(value: string): void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value === undefined || value === null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      className={selectClass}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ToggleInput({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange(value: boolean): void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/[0.08]"
    >
      <span>{label}</span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition ${
          checked ? "bg-blue-500" : "bg-white/15"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

export function SliderWithInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
}: {
  value: unknown;
  onChange(value: number): void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  const numeric = Number(value ?? 0);

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(numeric) ? numeric : min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-blue-500"
      />
      <div className="flex w-20 items-center rounded-md border border-white/10 bg-black/25">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(numeric) ? numeric : ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent px-2 py-1.5 text-right text-xs text-white outline-none"
        />
        <span className="pr-2 text-[10px] text-white/35">{unit}</span>
      </div>
    </div>
  );
}

export function SegmentedInput({
  value,
  onChange,
  options,
}: {
  value: unknown;
  onChange(value: string): void;
  options: { label: string; value: string }[];
}) {
  return (
    <div
      className="grid gap-1 rounded-md border border-white/10 bg-black/20 p-1"
      style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`min-w-0 rounded px-2 py-1.5 text-[11px] leading-tight transition ${
            String(value ?? "") === option.value
              ? "bg-white/15 text-white"
              : "text-white/50 hover:bg-white/10 hover:text-white"
          }`}
          title={option.label}
        >
          <span className="block truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
