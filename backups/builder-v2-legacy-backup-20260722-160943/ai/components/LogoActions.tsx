"use client";

import { Upload } from "lucide-react";

interface Props {
  onUpload(): void;

  onSkip(): void;
}

export default function LogoActions({
  onUpload,
  onSkip,
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onUpload}
        className="
          px-4 py-2

          bg-blue-600

          hover:bg-blue-500

          rounded-full

          text-xs

          text-white

          flex items-center gap-2
        "
      >
        <Upload size={14} />

        Upload Logo
      </button>

      <button
        onClick={onSkip}
        className="
          px-4 py-2

          bg-gray-700/50

          hover:bg-gray-600

          rounded-full

          text-xs

          text-gray-200
        "
      >
        Skip
      </button>
    </div>
  );
}