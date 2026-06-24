"use client";

import { Loader2 } from "lucide-react";

interface Props {
  running: boolean;

  elapsed: number;
}

export default function RuntimeIndicator({
  running,
  elapsed,
}: Props) {
  if (!running) return null;

  return (
    <div className="flex justify-center">
      <div
        className="
          px-5 py-3

          bg-gray-800/60

          backdrop-blur-sm

          border border-gray-700/50

          rounded-full

          flex items-center gap-3

          shadow-xl
        "
      >
        <Loader2
          size={16}
          className="animate-spin text-blue-400"
        />

        <span className="text-sm text-gray-300">
          AI working… {elapsed}s
        </span>
      </div>
    </div>
  );
}