"use client";

import { Send, Square, Paperclip } from "lucide-react";
import AttachmentMenu from "./AttachmentMenu";
import { CHAT_PLACEHOLDER } from "../constants";

interface Props {
  value: string;
  running: boolean;
  showAttachButton: boolean;

  inputRef: React.RefObject<HTMLTextAreaElement>;

  attachmentMenuOpen: boolean;

  onChange(value: string): void;

  onSend(): void;

  onAbort(): void;

  onToggleAttachment(): void;

  onCloseAttachment(): void;

  onResetChat(): void;
}

export default function ChatInput({
  value,
  running,
  showAttachButton,

  inputRef,

  attachmentMenuOpen,

  onChange,

  onSend,

  onAbort,

  onToggleAttachment,

  onCloseAttachment,

  onResetChat,
}: Props) {
  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-700/50">

      <div className="relative">

        {showAttachButton && (
          <>
            <button
              onClick={onToggleAttachment}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gray-700/50 hover:bg-gray-600/80 flex items-center justify-center transition-all z-10"
            >
              <Paperclip
                size={18}
                className="text-gray-400"
              />
            </button>

            <AttachmentMenu
              open={attachmentMenuOpen}
              onClose={onCloseAttachment}
              onReset={onResetChat}
            />
          </>
        )}

        <textarea
          ref={inputRef}
          value={value}
          disabled={running}
          rows={1}
          placeholder={CHAT_PLACEHOLDER}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();

              if (!running)
                onSend();
            }
          }}
          className={`
              marquee-input

              w-full

              ${
                showAttachButton
                  ? "pl-14"
                  : "pl-4"
              }

              pr-14

              py-3.5

              bg-gray-800/60

              backdrop-blur-sm

              border border-gray-700/50

              rounded-2xl

              text-sm

              text-white

              placeholder-gray-500

              focus:outline-none

              focus:ring-2

              focus:ring-blue-500/50

              resize-none

              transition-all
          `}
          style={{
            minHeight: "48px",
            maxHeight: "120px",
          }}
        />

        <button
          onClick={
            running
              ? onAbort
              : onSend
          }
          disabled={
            !value.trim() &&
            !running
          }
          className={`
            absolute

            right-3

            top-1/2

            -translate-y-1/2

            h-10

            w-10

            flex

            items-center

            justify-center

            shadow-lg

            ${
              running
                ? "rounded-full bg-red-600 hover:bg-red-500"
                : "rounded-xl bg-blue-600 hover:bg-blue-500"
            }
          `}
        >
          {running ? (
            <Square
              size={16}
              fill="white"
              className="text-white"
            />
          ) : (
            <Send
              size={16}
              className="text-white"
            />
          )}
        </button>

      </div>

      <p className="mt-2 text-xs text-gray-500 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>

    </div>
  );
}