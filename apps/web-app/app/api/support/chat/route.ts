import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { getUser } from "@/lib/auth/getUser";
import { searchSupportArticles } from "@/modules/support/knowledge";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) return NextResponse.json({ error: "Enter a support question" }, { status: 400 });
  const articles = searchSupportArticles(message, 4);
  let answer = articles.length
    ? `${articles[0].body}${articles[1] ? ` You may also find “${articles[1].title}” useful.` : ""}`
    : "I could not find a precise answer in the support documentation. I can help you raise a ticket with the relevant website and details.";
  if (process.env.OPENAI_API_KEY && articles.length) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const result = await client.chat.completions.create({
        model: process.env.OPENAI_SUPPORT_MODEL || "gpt-4.1-mini",
        temperature: 0.1,
        messages: [
          { role: "system", content: "You are the BuildEZ support agent. Answer only from the supplied support documentation. Be concise, give numbered steps when useful, never invent product behavior, and recommend a support ticket when the docs are insufficient." },
          { role: "user", content: `Question: ${message}\n\nDocumentation:\n${articles.map((article) => `${article.title}: ${article.body}`).join("\n")}` },
        ],
      });
      answer = result.choices[0]?.message?.content?.trim() || answer;
    } catch {
      // The documentation-grounded fallback remains available when the model is unavailable.
    }
  }
  const shouldOfferTicket = !articles.length || /bug|broken|error|issue|not working|failed|charged|billing/i.test(message);
  return NextResponse.json({
    answer,
    sources: articles.map(({ id, title, category, summary }) => ({ id, title, category, summary })),
    canRaiseTicket: shouldOfferTicket,
  });
}
