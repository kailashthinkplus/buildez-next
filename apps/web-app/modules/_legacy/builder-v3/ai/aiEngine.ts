// ============================================================================
// aiEngine.ts — V3 BLUEPRINT PATCH ENGINE (CLIENT-SIDE)
// Bible-Compliant → Client NEVER calls OpenAI directly.
// Only calls internal Next.js API routes.
// ============================================================================

"use client";

import { AIResponse, RunBlueprintAIPayload, GenerateImagePayload } from "./AiTypes";
import { PageNode } from "@/modules/builder/blueprint/types";

// ---------------------------------------------------------------------------
// UNIVERSAL POST WRAPPER — STABLE, PRODUCTION SAFE
// ---------------------------------------------------------------------------
async function postJSON<T>(url: string, payload: any): Promise<AIResponse<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        ok: false,
        error: `API Error (${res.status}): ${errorText}`,
      };
    }

    const json = await res.json();
    return { ok: true, data: json as T };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message || "Network error",
    };
  }
}

// ============================================================================
// 1) PRIMARY UNIFIED AI ENDPOINT — PATCH GENERATOR
// /api/ai/blueprint → returns: { patches[], text }
// ============================================================================
export const aiEngine = {
  async generatePatches(prompt: string, page: PageNode) {
    return postJSON<{ patches: any[]; text?: string }>("/api/ai/blueprint", {
      prompt,
      page,
    });
  },

  // ========================================================================
  // 2) IMAGE GENERATION — INTERNAL FREEPIK / CUSTOM IMAGE API
  // ========================================================================
  async generateImage(payload: GenerateImagePayload) {
    return postJSON<any>("/api/ai/generate-image", payload);
  },

  // ========================================================================
  // Reserved future expansions
  // ========================================================================
  async generateVideo() {
    return { ok: false, error: "Video AI not implemented yet" };
  },

  async generateCSS() {
    return { ok: false, error: "AI CSS engine not implemented yet" };
  },
};

// ============================================================================
// PUBLIC WRAPPER — Used by AiPanel.tsx
// ============================================================================
export async function runBlueprintAI(
  prompt: string,
  page: PageNode | null
): Promise<AIResponse<{ patches: any[]; text?: string }>> {
  if (!page) {
    return {
      ok: false,
      error: "No active page to apply patches",
    };
  }

  return aiEngine.generatePatches(prompt, page);
}

// Default export for UI safety
export default aiEngine;
