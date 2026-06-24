"use client";

interface SwitchInputProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange(checked: boolean): void;
}

export default function SwitchInput({
  label,
  checked,
  disabled = false,
  onChange,
}: SwitchInputProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-xs font-medium text-white/70">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative
          h-6
          w-11
          rounded-full
          transition-all
          duration-200
          ${
            checked
              ? "bg-blue-600"
              : "bg-white/10"
          }
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }
        `}
      >
        <span
          className={`
            absolute
            top-0.5
            left-0.5
            h-5
            w-5
            rounded-full
            bg-white
            transition-transform
            duration-200
            ${
              checked
                ? "translate-x-5"
                : "translate-x-0"
            }
          `}
        />
      </button>
    </div>
  );
}