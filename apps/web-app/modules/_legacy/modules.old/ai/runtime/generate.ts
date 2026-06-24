import { buildPrompt, AISelection } from "../prompt/promptEngine";

export async function generateBlueprintFromAI(sel: AISelection) {
  const prompt = buildPrompt(sel);

  const aiRes = await fetch(process.env.AI_ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const json = await aiRes.json();
  return json.blueprint;
}
