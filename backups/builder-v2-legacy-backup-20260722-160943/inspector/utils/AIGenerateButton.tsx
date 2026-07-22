"use client";

import { Sparkles } from "lucide-react";

interface Props {
  loading?: boolean;
  label?: string;
  onClick(): void;
}

export default function AIGenerateButton({
  loading = false,
  label = "Generate with AI",
  onClick,
}: Props) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="
        inline-flex
        items-center
        justify-center
        gap-2

        h-9
        w-full

        rounded-lg

        bg-blue-600
        hover:bg-blue-500

        disabled:opacity-50
        disabled:cursor-not-allowed

        text-sm
        font-medium
        text-white

        transition-colors
      "
    >
      <Sparkles size={16} />

      {loading ? "Generating..." : label}
    </button>
  );
}