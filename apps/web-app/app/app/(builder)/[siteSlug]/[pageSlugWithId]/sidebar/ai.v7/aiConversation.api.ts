export async function fetchConversation(pageId: string) {
  const res = await fetch(
    `/api/ai/conversation?pageId=${pageId}`,
    { credentials: "include" }
  );

  if (!res.ok) throw new Error("Failed to load AI conversation");

  const data = await res.json();
  return data.conversation;
}

export async function postMessage(
  pageId: string,
  role: "user" | "assistant",
  content: string
) {
  const res = await fetch("/api/ai/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ pageId, role, content }),
  });

  if (!res.ok) throw new Error("Failed to save AI message");

  const data = await res.json();
  return data.message;
}
