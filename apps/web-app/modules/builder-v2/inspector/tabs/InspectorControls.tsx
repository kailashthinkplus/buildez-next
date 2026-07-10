"use client";

import type { BuilderNode, BuilderStyle } from "../../types/blueprint";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, ChevronDown, RotateCcw } from "lucide-react";
import {
  getResponsiveValue as resolveResponsiveValueForDevice,
  resetResponsiveOverride,
  resolveResponsiveValue,
  setResponsiveOverride,
  type BuilderResponsiveDevice,
} from "../../core/responsive";
import {
  INSPECTOR_UNITS,
  clampUnitValue,
  formatUnitValue,
  normalizeInspectorUnit,
  parseUnitValue,
  type InspectorUnit,
} from "../utils/unitValue";
import { getAlignmentOptions, type AlignmentKind } from "../utils/alignmentOptions";

export type InspectorDevice = BuilderResponsiveDevice;

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

export function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedDeep) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, removeUndefinedDeep(entryValue)])
    ) as T;
  }

  return value;
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
  return resolveResponsiveValueForDevice(value, device, fallback);
}

export function getResponsiveResolution(
  value: unknown,
  device: InspectorDevice,
  fallback: unknown = ""
) {
  return resolveResponsiveValue(value, device, fallback);
}

export function setResponsiveStyleValue(
  node: BuilderNode,
  key: keyof BuilderStyle | string,
  value: unknown,
  device: InspectorDevice,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  const current = node.style?.[key] as unknown;
  const next = setResponsiveOverride(current, device, value);

  onUpdateNode(node.id, {
    style: removeUndefinedDeep(
      normalizeBoxStyleUpdate(node.style, String(key), next)
    ),
  });
}

export function resetResponsiveStyleValue(
  node: BuilderNode,
  key: keyof BuilderStyle | string,
  device: InspectorDevice,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
  const current = node.style?.[key] as unknown;
  const next = resetResponsiveOverride(current, device);

    onUpdateNode(node.id, {
    style: removeUndefinedDeep(
      normalizeBoxStyleUpdate(node.style, String(key), next)
    ),
  });
}

export function setStyleValue(
  node: BuilderNode,
  key: keyof BuilderStyle | string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
    onUpdateNode(node.id, {
    style: removeUndefinedDeep(
      normalizeBoxStyleUpdate(node.style, String(key), value)
    ),
  });
}

export function setPropValue(
  node: BuilderNode,
  key: string,
  value: unknown,
  onUpdateNode: (id: string, patch: Partial<BuilderNode>) => void
) {
    onUpdateNode(node.id, {
    props: removeUndefinedDeep({
      ...node.props,
      [key]: value,
    }),
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
  inheritedLabel,
  onReset,
}: {
  value: InspectorDevice;
  onChange(value: InspectorDevice): void;
  inheritedLabel?: string;
  onReset?(): void;
}) {
  return (
    <div className="space-y-2">
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
      {(inheritedLabel || onReset) && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-white/40">
          <span>{inheritedLabel}</span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={12} aria-hidden />
              Reset override
            </button>
          )}
        </div>
      )}
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

export function UnitInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  units = INSPECTOR_UNITS,
  fallbackUnit = "px",
}: {
  value: unknown;
  onChange(value: string): void;
  min?: number;
  max?: number;
  step?: number;
  units?: readonly InspectorUnit[];
  fallbackUnit?: InspectorUnit;
}) {
  const parsed = parseUnitValue(value, fallbackUnit);

  const resolvedUnit = units.includes(parsed.unit)
    ? parsed.unit
    : normalizeInspectorUnit(units[0], "px");

  const resolvedValue = clampUnitValue(parsed.value, min, max);

  const [draftValue, setDraftValue] = useState(
    Number.isFinite(resolvedValue) ? String(resolvedValue) : ""
  );

  const [draftUnit, setDraftUnit] = useState<InspectorUnit>(resolvedUnit);
  const editingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    if (editingRef.current) return;

    const next = parseUnitValue(value, fallbackUnit);

    const nextUnit = units.includes(next.unit)
      ? next.unit
      : normalizeInspectorUnit(units[0], "px");

    const nextValue = clampUnitValue(next.value, min, max);

    setDraftValue(
      Number.isFinite(nextValue) ? String(nextValue) : ""
    );

    setDraftUnit(nextUnit);
  }, [value, fallbackUnit, min, max, units]);

  const commit = (
    rawValue = draftValue,
    nextUnit = draftUnit
  ) => {
    const numeric = Number(rawValue);

    if (rawValue.trim() === "" || !Number.isFinite(numeric)) {
      setDraftValue(Number.isFinite(resolvedValue) ? String(resolvedValue) : "");
      setDraftUnit(resolvedUnit);
      return;
    }

    const clamped = clampUnitValue(numeric, min, max);

    setDraftValue(String(clamped));
    onChange(formatUnitValue(clamped, nextUnit));
  };

  return (
    <div className="flex min-w-0 items-center rounded-md border border-white/10 bg-black/25">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draftValue}
        onFocus={() => {
          editingRef.current = true;
        }}
        onChange={(event) => {
          setDraftValue(event.target.value);
        }}
        onBlur={() => {
          editingRef.current = false;
          if (skipBlurCommitRef.current) {
            skipBlurCommitRef.current = false;
            return;
          }
          commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            skipBlurCommitRef.current = true;
            setDraftValue(
              Number.isFinite(resolvedValue)
                ? String(resolvedValue)
                : ""
            );
            setDraftUnit(resolvedUnit);
            event.currentTarget.blur();
          }
        }}
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none"
      />

      <select
        value={draftUnit}
        onChange={(event) => {
          const nextUnit = normalizeInspectorUnit(
            event.target.value
          );

          setDraftUnit(nextUnit);
          commit(draftValue, nextUnit);
        }}
        className="h-full rounded-r-md border-l border-white/10 bg-white/[0.06] px-2 py-2 text-xs text-white outline-none"
      >
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
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
      style={{
        gridTemplateColumns: `repeat(${Math.min(
          options.length,
          3
        )}, minmax(0, 1fr))`,
      }}
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

export function AlignmentInput({
  value,
  onChange,
  kind = "text",
}: {
  value: unknown;
  onChange(value: string): void;
  kind?: AlignmentKind;
}) {
  const options = getAlignmentOptions(kind);

  return (
    <div
      className="grid gap-1 rounded-md border border-white/10 bg-black/20 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex h-8 min-w-0 items-center justify-center rounded transition ${
            String(value ?? "") === option.value
              ? "bg-white/15 text-white"
              : "text-white/50 hover:bg-white/10 hover:text-white"
          }`}
          title={option.label}
          aria-label={option.label}
        >
          <AlignmentIcon value={option.value} kind={kind} />
        </button>
      ))}
    </div>
  );
}

function AlignmentIcon({ value, kind }: { value: string; kind: AlignmentKind }) {
  if (kind === "text") {
    if (value === "center") return <AlignCenter size={16} aria-hidden />;
    if (value === "right") return <AlignRight size={16} aria-hidden />;
    if (value === "justify") return <AlignJustify size={16} aria-hidden />;
    return <AlignLeft size={16} aria-hidden />;
  }

  if (kind === "vertical") {
    const y = value === "flex-start" ? 4 : value === "flex-end" ? 12 : 8;
    if (value === "stretch") {
      return (
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    }
    return (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
        <path d={`M4 ${y}h8`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d={`M6 ${y - 2}v4M10 ${y - 2}v4`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "horizontal") {
    const x = value === "flex-start" ? 4 : value === "flex-end" ? 12 : 8;
    if (value === "stretch") {
      return (
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 5h10M3 11h10" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    }
    return (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
        <path d={`M${x} 4v8`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d={`M${x - 2} 6h4M${x - 2} 10h4`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  if (value === "left" || value === "flex-start") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M3 2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 4h7M6 8h5M6 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (value === "center") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 4h8M5 8h6M4 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (value === "right" || value === "flex-end") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M13 2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3 4h7M5 8h5M3 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (value === "justify" || value === "stretch") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M3 3v10M13 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 5h6M5 8h6M5 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}
