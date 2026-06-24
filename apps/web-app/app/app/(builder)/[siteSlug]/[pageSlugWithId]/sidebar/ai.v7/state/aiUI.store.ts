// aiUI.store.ts

import { create } from "zustand";

export type AIInterviewState = {
  step: number;
  questions: any[];
  answers: Record<string, any>;
  finalized: boolean;
  loading: boolean;
  error?: string;
};

type AIUIStore = AIInterviewState & {
  startInterview: () => Promise<void>;
  submitAnswer: (key: string, value: any) => Promise<void>;
  finalizeInterview: () => Promise<void>;
  reset: () => void;
};

export const useAIUIStore = create<AIUIStore>((set, get) => ({
  step: 0,
  questions: [],
  answers: {},
  finalized: false,
  loading: false,

  async startInterview() {
    set({ loading: true, error: undefined });

    const res = await fetch("/api/ai/interview/start", {
      method: "POST",
    });

    if (!res.ok) {
      set({ loading: false, error: "Failed to start interview" });
      return;
    }

    const data = await res.json();

    set({
      questions: data.questions,
      step: data.step ?? 0,
      loading: false,
    });
  },

  async submitAnswer(key, value) {
    const { step, answers } = get();

    set({ loading: true });

    await fetch("/api/ai/interview/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step,
        key,
        value,
      }),
    });

    set({
      answers: { ...answers, [key]: value },
      step: step + 1,
      loading: false,
    });
  },

  async finalizeInterview() {
    const { answers } = get();

    set({ loading: true });

    await fetch("/api/ai/interview/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    set({ finalized: true, loading: false });
  },

  reset() {
    set({
      step: 0,
      questions: [],
      answers: {},
      finalized: false,
      loading: false,
      error: undefined,
    });
  },
}));
