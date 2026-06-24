import { create } from "zustand";

export type AIQuestion = {
  id: string;
  question: string;
  type: "text" | "select";
  options?: string[];
};

type AIConversationState = {
  mode: "idle" | "questions" | "running";
  questions: AIQuestion[];
  answers: Record<string, string>;
  conversationId: string | null;

  startQuestions: (qs: AIQuestion[], conversationId?: string) => void;
  answerQuestion: (id: string, value: string) => void;
  resetConversation: () => void;
};

export const useAIConversationStore = create<AIConversationState>((set) => ({
  mode: "idle",
  questions: [],
  answers: {},
  conversationId: null,

  startQuestions: (qs, conversationId) =>
    set({
      mode: "questions",
      questions: qs,
      answers: {},
      conversationId: conversationId ?? null,
    }),

  answerQuestion: (id, value) =>
    set((state) => ({
      answers: { ...state.answers, [id]: value },
    })),

  resetConversation: () =>
    set({
      mode: "idle",
      questions: [],
      answers: {},
      conversationId: null,
    }),
}));
