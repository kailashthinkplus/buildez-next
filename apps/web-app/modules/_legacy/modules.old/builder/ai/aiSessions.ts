import { AISession, AIMsg } from "./aiTypes";

export function createAISession(pageId: string): AISession {
  return {
    id: "",
    pageId,
    startedAt: Date.now(),
    messages: [],
  };
}

export function appendMessage(
  session: AISession,
  msg: AIMsg
): AISession {
  return {
    ...session,
    messages: [...session.messages, msg],
  };
}
