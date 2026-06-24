"use client";

import { InspectorField } from "../schema/fieldRegistry";

interface Props {
  field: InspectorField;
  value: any;
  onChange: (value: any) => void;
}

export default function FieldRenderer({
  field,
  value,
  onChange,
}: Props) {
  switch (field.type) {
    case "text":
      return (
        <Field label={field.label}>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
          />
        </Field>
      );

    case "textarea":
      return (
        <Field label={field.label}>
          <textarea
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
          />
        </Field>
      );

    case "number":
      return (
        <Field label={field.label}>
          <input
            type="number"
            value={value ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
          />
        </Field>
      );

    case "color":
      return (
        <Field label={field.label}>
          <input
            type="color"
            value={value ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 p-0 border border-white/10 rounded"
          />
        </Field>
      );

    case "select":
      return (
        <Field label={field.label}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-sm"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      );

    case "toggle":
      return (
        <Field label={field.label}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        </Field>
      );

    default:
      return null;
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/60">{label}</label>
      {children}
    </div>
  );
}
