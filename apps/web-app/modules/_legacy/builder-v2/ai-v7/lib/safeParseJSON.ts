// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v7/lib/safeParseJSON.ts

/**
 * Safely parse JSON with detailed error reporting
 * 
 * @param jsonString - Raw JSON string from AI
 * @param label - Label for error messages (e.g., "SemanticPlan")
 * @returns Parsed object
 * @throws Error with helpful message if parsing fails
 */
export function safeParseJSON<T = any>(
  jsonString: string,
  label: string = "JSON"
): T {
  if (!jsonString || typeof jsonString !== "string") {
    throw new Error(`[safeParseJSON] ${label}: Empty or invalid input`);
  }

  // Remove markdown code blocks if present
  let cleaned = jsonString.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }

  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    console.log(`[safeParseJSON] ✅ ${label} parsed successfully`);
    return parsed as T;
  } catch (error: any) {
    console.error(`[safeParseJSON] ❌ ${label} parsing failed`);
    console.error(`[safeParseJSON] Error:`, error.message);
    console.error(`[safeParseJSON] First 500 chars of input:`, cleaned.substring(0, 500));
    
    // Try to extract JSON from text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log(`[safeParseJSON] ✅ ${label} extracted and parsed from text`);
        return extracted as T;
      } catch (e) {
        console.error(`[safeParseJSON] Failed to parse extracted JSON`);
      }
    }

    throw new Error(
      `Failed to parse ${label} JSON. Error: ${error.message}. ` +
      `Input starts with: ${cleaned.substring(0, 100)}...`
    );
  }
}

/**
 * Parse JSON with fallback value
 */
export function safeParseJSONWithFallback<T = any>(
  jsonString: string,
  fallback: T,
  label: string = "JSON"
): T {
  try {
    return safeParseJSON<T>(jsonString, label);
  } catch (error) {
    console.warn(`[safeParseJSON] Using fallback for ${label}`);
    return fallback;
  }
}

/**
 * Validate parsed JSON against expected structure
 */
export function validateParsedJSON<T = any>(
  parsed: T,
  requiredKeys: string[],
  label: string = "JSON"
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  requiredKeys.forEach((key) => {
    if (!(key in (parsed as any))) {
      missing.push(key);
    }
  });

  const valid = missing.length === 0;

  if (!valid) {
    console.warn(`[validateParsedJSON] ${label} missing keys:`, missing);
  } else {
    console.log(`[validateParsedJSON] ✅ ${label} has all required keys`);
  }

  return { valid, missing };
}