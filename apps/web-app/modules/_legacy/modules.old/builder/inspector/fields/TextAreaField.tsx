"use client";

import React from "react";

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">
        {label}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="
          w-full px-3 py-2
          rounded-lg
          bg-white/[0.07]
          border border-white/10
          text-white text-sm
          placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          transition
        "
      />
    </div>
  );
}
