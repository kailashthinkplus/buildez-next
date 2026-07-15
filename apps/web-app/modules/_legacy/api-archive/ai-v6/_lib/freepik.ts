/* ============================================================
   FREEPIK AI CLIENT
   - Shared across AI routes
   - Provider-agnostic wrapper
============================================================ */

const FREEPIK_API_BASE = "https://api.freepik.com/v1/ai";

if (!process.env.FREEPIK_API_KEY) {
  console.warn(
    "[AI] FREEPIK_API_KEY is not set. Freepik AI will fail."
  );
}

export async function callFreepikAI({
  endpoint,
  body,
  signal,
}: {
  endpoint: string;
  body: any;
  signal?: AbortSignal;
}) {
  const res = await fetch(`${FREEPIK_API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FREEPIK_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `[Freepik AI] ${res.status}: ${text}`
    );
  }

  return res.json();
}
