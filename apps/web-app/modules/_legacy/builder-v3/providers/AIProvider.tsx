"use client";

import React, { createContext, useContext, useState } from "react";
import { AiMessage } from "@/modules/builder/ai/types";
import { generateAiResponse } from "@/modules/builder/ai/aiEngine";

interface AIContextValue {
  messages: AiMessage[];
  send: (text: string) => Promise<void>;
  clear: () => void;
}

const AIContext = createContext<AIContextValue>({
  messages: [],
  send: async () => {},
  clear: () => {},
});

export function AIProvider({ children }) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      text: "Hi! Tell me what you want to create.",
    },
  ]);

  async function send(text: string) {
    const userMsg: AiMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    const responseText = await generateAiResponse(text);
    const assistantMsg: AiMessage = { role: "assistant", text: responseText };

    setMessages((prev) => [...prev, assistantMsg]);
  }

  function clear() {
    setMessages([
      {
        role: "assistant",
        text: "Hi! Tell me what you want to create.",
      },
    ]);
  }

  return (
    <AIContext.Provider value={{ messages, send, clear }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  return useContext(AIContext);
}
