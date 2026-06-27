"use client";

import React from "react";
import { Sparkles, User } from "lucide-react";

import type { AiMessage } from "../types/conversation";

import RuntimeIndicator from "./RuntimeIndicator";
import ToneSelector from "./ToneSelector";
import LogoActions from "./LogoActions";

interface ChatMessagesProps {
  messages: AiMessage[];

  running: boolean;

  elapsed: number;

  tone: string | null;

  waitingForLogo: boolean;

  bottomRef: React.RefObject<HTMLDivElement>;

  onToneSelect(tone: string): void;

  onLogoUpload(): void;

  onSkipLogo(): void;
}

export default function ChatMessages({
  messages,
  running,
  elapsed,
  tone,
  waitingForLogo,
  bottomRef,
  onToneSelect,
  onLogoUpload,
  onSkipLogo,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const isSystem = msg.role === "system";

        /* =====================================================
           SYSTEM MESSAGE
        ===================================================== */

        if (isSystem) {
          return (
            <div
              key={msg.ts}
              className="flex justify-center"
            >
              <div
                className={`px-4 py-2 rounded-full text-xs font-medium ${
                  msg.kind === "success"
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        }

        /* =====================================================
           TONE SELECTION
        ===================================================== */

        if (
          msg.kind === "tone-pills" &&
          !tone
        ) {
          return (
            <div
              key={msg.ts}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles size={15} aria-hidden />
              </div>

              <div className="flex-1 space-y-3">

                <div className="px-5 py-3.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-xl">
                  {msg.text}
                </div>

                <ToneSelector
                  onSelect={onToneSelect}
                />

              </div>
            </div>
          );
        }

        /* =====================================================
           LOGO ACTIONS
        ===================================================== */

        if (
          msg.kind === "logo-actions" &&
          waitingForLogo
        ) {
          return (
            <div
              key={msg.ts}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles size={15} aria-hidden />
              </div>

              <div className="flex-1 space-y-3">

                <div className="px-5 py-3.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none text-sm text-gray-200 shadow-xl">
                  {msg.text}
                </div>

                <LogoActions
                  onUpload={onLogoUpload}
                  onSkip={onSkipLogo}
                />

              </div>
            </div>
          );
        }

        /* =====================================================
           NORMAL MESSAGE
        ===================================================== */

        return (
          <div
            key={msg.ts}
            className={`flex gap-3 ${
              isUser
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {!isUser && (
              <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles size={15} aria-hidden />
              </div>
            )}

            <div
              className={`max-w-[80%] px-5 py-3.5 text-sm shadow-xl ${
                isUser
                  ? "bg-[rgb(38,99,235)] text-white rounded-2xl rounded-tr-none"
                  : "bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-200 rounded-2xl rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>

            {isUser && (
              <div className="h-8 w-8 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={15} aria-hidden />
              </div>
            )}
          </div>
        );
      })}

      <RuntimeIndicator
        running={running}
        elapsed={elapsed}
      />

      <div ref={bottomRef} />
    </div>
  );
}
