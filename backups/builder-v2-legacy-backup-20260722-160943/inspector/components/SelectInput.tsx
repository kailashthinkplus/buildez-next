"use client";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps {
  label: string;
  value: string;
  options: Option[];
  onChange(value: string): void;
}

export default function SelectInput({
  label,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <select
        value={value}
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
          focus:border-blue-500
        "
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}