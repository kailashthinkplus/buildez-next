import type { AIAction } from "@/modules/builder/ai/aiTypes";

/* ============================================================
   ACTION PARSER — SAFE, FLEXIBLE
============================================================ */

export function parseActions(raw: unknown): AIAction[] {
  /* ----------------------------------------------------------
     CASE 1: Already parsed JSON object
  ---------------------------------------------------------- */
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as any).actions)
  ) {
    return (raw as any).actions as AIAction[];
  }

  /* ----------------------------------------------------------
     CASE 2: Raw string (legacy / fallback)
  ---------------------------------------------------------- */
  if (typeof raw === "string") {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object returned");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error("Invalid JSON returned by AI");
    }

    if (!Array.isArray(parsed.actions)) {
      throw new Error("Parsed JSON missing actions array");
    }

    return parsed.actions as AIAction[];
  }

  /* ----------------------------------------------------------
     INVALID INPUT
  ---------------------------------------------------------- */
  throw new Error("parseActions received unsupported input");
}
