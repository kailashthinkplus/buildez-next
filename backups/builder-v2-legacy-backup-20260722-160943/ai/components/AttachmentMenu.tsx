"use client";

import {
  RefreshCw,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

interface AttachmentMenuProps {
  open: boolean;
  onClose(): void;
  onReset(): void;
}

export default function AttachmentMenu({
  open,
  onClose,
  onReset,
}: AttachmentMenuProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000]"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className="
          absolute
          bottom-full
          left-0
          mb-2
          w-56

          bg-gray-800/95
          backdrop-blur-xl

          border
          border-gray-700/50

          rounded-xl

          shadow-2xl

          overflow-hidden

          z-[10001]
        "
      >
        {/* Reset */}

        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="
            w-full
            px-4
            py-3
            text-left
            text-sm

            text-gray-200

            hover:bg-gray-700/50

            transition-colors

            flex
            items-center
            gap-3

            border-b
            border-gray-700/30
          "
        >
          <RefreshCw
            size={16}
            className="text-blue-400"
          />

          <span>Reset Chat</span>
        </button>

        {/* Upload document */}

        <button
          onClick={onClose}
          className="
            w-full
            px-4
            py-3
            text-left
            text-sm

            text-gray-400

            hover:bg-gray-700/50

            transition-colors

            flex
            items-center
            gap-3
          "
        >
          <FileText size={16} />

          <span>Upload Document</span>

          <span className="ml-auto text-xs text-gray-500">
            Coming soon
          </span>
        </button>

        {/* Upload image */}

        <button
          onClick={onClose}
          className="
            w-full
            px-4
            py-3
            text-left
            text-sm

            text-gray-400

            hover:bg-gray-700/50

            transition-colors

            flex
            items-center
            gap-3
          "
        >
          <ImageIcon size={16} />

          <span>Upload Image</span>

          <span className="ml-auto text-xs text-gray-500">
            Coming soon
          </span>
        </button>
      </div>
    </>
  );
}