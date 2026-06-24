// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/lib/runTextAI.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Run text-based AI generation with OpenAI
 * 
 * @param prompt - System + user prompt combined
 * @param maxTokens - Maximum tokens to generate
 * @param jsonMode - Enable JSON response format
 * @returns Generated text or JSON string
 */
export async function runTextAI(
  prompt: string,
  maxTokens: number = 2000,
  jsonMode: boolean = false
): Promise<string> {
  console.log(`[runTextAI] Starting generation (tokens: ${maxTokens}, JSON: ${jsonMode})`);
  console.log(`[runTextAI] Prompt length: ${prompt.length} characters`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert web designer and developer. Always follow the exact structure and format specified in prompts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content || "";
    
    console.log(`[runTextAI] ✅ Generation completed (${content.length} characters)`);
    
    if (jsonMode && content) {
      // Validate JSON
      try {
        JSON.parse(content);
        console.log(`[runTextAI] ✅ Valid JSON returned`);
      } catch (e) {
        console.warn(`[runTextAI] ⚠️ JSON mode enabled but invalid JSON returned`);
      }
    }

    return content;
  } catch (error: any) {
    console.error(`[runTextAI] ❌ Generation failed:`, error.message);
    
    if (error.code === "insufficient_quota") {
      throw new Error("OpenAI API quota exceeded. Please check your billing.");
    }
    
    if (error.code === "invalid_api_key") {
      throw new Error("Invalid OpenAI API key. Please check OPENAI_API_KEY env variable.");
    }
    
    throw error;
  }
}

/**
 * Run text generation with separate system and user prompts
 */
export async function runTextAIWithMessages(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
  jsonMode: boolean = false
): Promise<string> {
  console.log(`[runTextAIWithMessages] Starting generation`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log(`[runTextAIWithMessages] ✅ Generation completed`);
    
    return content;
  } catch (error: any) {
    console.error(`[runTextAIWithMessages] ❌ Generation failed:`, error.message);
    throw error;
  }
}