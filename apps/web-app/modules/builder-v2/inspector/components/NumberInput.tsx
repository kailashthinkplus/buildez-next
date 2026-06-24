"use client";

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange(value: number): void;
}

export default function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
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
      />
    </div>
  );
}