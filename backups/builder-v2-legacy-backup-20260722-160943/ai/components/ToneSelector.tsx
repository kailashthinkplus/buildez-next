"use client";

import { AI_TONES } from "../constants";

interface Props {
  onSelect(
    tone: string
  ): void;
}

export default function ToneSelector({
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {AI_TONES.map((tone) => (
        <button
          key={tone}
          onClick={() => onSelect(tone)}
          className="
            px-4 py-2

            bg-gray-700/50

            hover:bg-blue-600/80

            border border-gray-600/50

            hover:border-blue-500/50

            rounded-full

            text-xs font-medium

            text-gray-200

            hover:text-white

            transition-all
          "
        >
          {tone}
        </button>
      ))}
    </div>
  );
}