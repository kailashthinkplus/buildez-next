"use client";

import { create } from "zustand";

/* ==========================================================
   TYPES
========================================================== */

export type AiStatus =
  | "idle"
  | "running"
  | "success"
  | "error";

export type AiRole =
  | "user"
  | "assistant"
  | "system";

export type AiMessageKind =
  | "text"
  | "tone-pills"
  | "logo-actions"
  | "success"
  | "error";

export interface AiMessage {
  role: AiRole;
  text: string;
  ts: number;
  kind?: AiMessageKind;
}

/* ==========================================================
   STORE
========================================================== */

interface AiStore {
  /* ----------------------------------------
     Conversation
  ---------------------------------------- */

  messages: AiMessage[];

  input: string;

  lastPrompt: string | null;

  conversationId: string | null;

  /* ----------------------------------------
     Runtime
  ---------------------------------------- */

  status: AiStatus;

  elapsed: number;

  /* ----------------------------------------
     Branding
  ---------------------------------------- */

  selectedTone: string | null;

  waitingForLogo: boolean;

  hasGeneratedCode: boolean;

  /* ----------------------------------------
     Attachments
  ---------------------------------------- */

  attachmentMenuOpen: boolean;

  /* ----------------------------------------
     Actions
  ---------------------------------------- */

  setMessages(messages: AiMessage[]): void;

  addMessage(message: AiMessage): void;

  clearMessages(): void;

  setInput(input: string): void;

  setStatus(status: AiStatus): void;

  setElapsed(seconds: number): void;

  setTone(tone: string | null): void;

  setWaitingForLogo(value: boolean): void;

  setGeneratedCode(value: boolean): void;

  setAttachmentMenu(open: boolean): void;

  setLastPrompt(prompt: string | null): void;

  reset(): void;
}

export const useAiStore = create<AiStore>((set) => ({

  /* ----------------------------------------
     Defaults
  ---------------------------------------- */

  messages: [],

  input: "",

  lastPrompt: null,

  conversationId: null,

  status: "idle",

  elapsed: 0,

  selectedTone: null,

  waitingForLogo: false,

  hasGeneratedCode: false,

  attachmentMenuOpen: false,

  /* ----------------------------------------
     Conversation
  ---------------------------------------- */

  setMessages(messages) {
    set({ messages });
  },

  addMessage(message) {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages() {
    set({
      messages: [],
    });
  },

  setInput(input) {
    set({ input });
  },

  setLastPrompt(prompt) {
    set({
      lastPrompt: prompt,
    });
  },

  /* ----------------------------------------
     Runtime
  ---------------------------------------- */

  setStatus(status) {
    set({ status });
  },

  setElapsed(elapsed) {
    set({ elapsed });
  },

  /* ----------------------------------------
     Branding
  ---------------------------------------- */

  setTone(selectedTone) {
    set({ selectedTone });
  },

  setWaitingForLogo(waitingForLogo) {
    set({ waitingForLogo });
  },

  setGeneratedCode(hasGeneratedCode) {
    set({ hasGeneratedCode });
  },

  /* ----------------------------------------
     Attachments
  ---------------------------------------- */

  setAttachmentMenu(attachmentMenuOpen) {
    set({
      attachmentMenuOpen,
    });
  },

  /* ----------------------------------------
     Reset
  ---------------------------------------- */

  reset() {
    set({

      messages: [],

      input: "",

      lastPrompt: null,

      conversationId: null,

      status: "idle",

      elapsed: 0,

      selectedTone: null,

      waitingForLogo: false,

      hasGeneratedCode: false,

      attachmentMenuOpen: false,

    });
  },

}));