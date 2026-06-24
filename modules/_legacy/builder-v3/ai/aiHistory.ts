// ============================================================================
// aiHistory.ts — BuildEZ V3 AI History Engine
// Stores chat + patch history per-session in localStorage.
// Pure client-side. Zero server dependencies.
// ============================================================================

"use client";

import { AIHistoryEntry } from "./AiTypes";

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------

const STORAGE_KEY = "buildez.ai.history.v3";

// ----------------------------------------------------------------------------
// INTERNAL: Load history from localStorage
// ----------------------------------------------------------------------------
function loadHistory(): Record<string, AIHistoryEntry[]> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    console.warn("⚠️ Failed to read AI history from localStorage");
    return {};
  }
}

// ----------------------------------------------------------------------------
// INTERNAL: Save history to localStorage
// ----------------------------------------------------------------------------
function saveHistory(data: Record<string, AIHistoryEntry[]>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("❌ Failed to write AI history:", e);
  }
}

// ----------------------------------------------------------------------------
// PUBLIC: Push new history entry
// ----------------------------------------------------------------------------
export function pushAIHistory(entry: AIHistoryEntry) {
  const all = loadHistory();

  if (!all[entry.sessionId]) {
    all[entry.sessionId] = [];
  }

  all[entry.sessionId].push(entry);
  saveHistory(all);
}

// ----------------------------------------------------------------------------
// PUBLIC: Get history for a session
// ----------------------------------------------------------------------------
export function getAIHistory(sessionId: string): AIHistoryEntry[] {
  const all = loadHistory();
  return all[sessionId] || [];
}

// ----------------------------------------------------------------------------
// PUBLIC: Clear history for a session
// ----------------------------------------------------------------------------
export function clearAIHistory(sessionId: string) {
  const all = loadHistory();
  delete all[sessionId];
  saveHistory(all);
}

// ----------------------------------------------------------------------------
// PUBLIC: Clear all history (reset all sessions)
// ----------------------------------------------------------------------------
export function clearAllAIHistory() {
  saveHistory({});
}

// ----------------------------------------------------------------------------
// DEBUG UTIL (optional)
// ----------------------------------------------------------------------------
export function debugAIHistory() {
  const all = loadHistory();
  console.log("📘 AI History Dump:", all);
}
