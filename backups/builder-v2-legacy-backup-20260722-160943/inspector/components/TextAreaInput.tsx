"use client";

interface TextAreaInputProps {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange(value: string): void;
}

export default function TextAreaInput({
  label,
  value,
  placeholder,
  rows = 6,
  onChange,
}: TextAreaInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-white/10
          bg-[#111827]
          px-3
          py-3
          text-sm
          text-white
          resize-none
          outline-none
          transition-colors
          focus:border-blue-500
        "
      />
    </div>
  );
}