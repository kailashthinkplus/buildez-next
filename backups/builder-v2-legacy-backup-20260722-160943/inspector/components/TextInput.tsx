"use client";

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange(value: string): void;
}

export default function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          h-10
          rounded-lg
          border
          border-white/10
          bg-[#111827]
          px-3
          text-sm
          text-white
          outline-none
          transition-colors
          focus:border-blue-500
        "
      />
    </div>
  );
}