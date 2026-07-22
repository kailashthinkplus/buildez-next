"use client";

import { useEffect } from "react";

import {
  useAiStore,
  type AiMessage,
} from "../store/useAiStore";

/* ==========================================================
   STORAGE
========================================================== */

const storageKey = (pageId: string) =>
  `buildez-ai-chat:${pageId}`;

/* ==========================================================
   DEFAULT MESSAGE
========================================================== */

const defaultMessages: AiMessage[] = [
  {
    role: "assistant",
    text:
      "Describe the website you want. I'll design the layout and generate the content for you.",
    ts: Date.now(),
    kind: "text",
  },
];

/* ==========================================================
   AI HISTORY
========================================================== */

export function useAiHistory(pageId: string) {
  const messages = useAiStore((s) => s.messages);
  const setMessages = useAiStore((s) => s.setMessages);

  /* --------------------------------------------------------
     RESTORE CHAT
  -------------------------------------------------------- */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(pageId));

      if (!raw) {
        setMessages(defaultMessages);
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      } else {
        setMessages(defaultMessages);
      }
    } catch (err) {
      console.error("[AI History] Restore failed", err);
      setMessages(defaultMessages);
    }
  }, [pageId, setMessages]);

  /* --------------------------------------------------------
     SAVE CHAT
  -------------------------------------------------------- */

  useEffect(() => {
    try {
      if (!messages.length) return;

      localStorage.setItem(
        storageKey(pageId),
        JSON.stringify(messages)
      );
    } catch (err) {
      console.error("[AI History] Save failed", err);
    }
  }, [messages, pageId]);

  /* --------------------------------------------------------
     RESET CHAT
  -------------------------------------------------------- */

  function resetHistory() {
    localStorage.removeItem(storageKey(pageId));

    setMessages([
      {
        role: "assistant",
        text:
          "Describe the website you want. I'll design the layout and generate the content for you.",
        ts: Date.now(),
        kind: "text",
      },
    ]);
  }

  return {
    resetHistory,
  };
}