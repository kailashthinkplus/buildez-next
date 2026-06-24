// ============================================================================
// aiSessions.ts — BuildEZ V3 AI Session Manager
// Manages AI sessions, assigning unique sessionIds and handling AI requests.
// ============================================================================

"use client";

// ----------------------------------------------------------------------------
// IMPORTS
// ----------------------------------------------------------------------------
import { nanoid } from "nanoid";  // Used for generating unique session IDs

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------
const SESSION_KEY = "buildez.ai.sessions.v3";

// ----------------------------------------------------------------------------
// INTERNAL: Load sessions from localStorage
// ----------------------------------------------------------------------------
function loadSessions(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    console.warn("⚠️ Failed to read AI sessions from localStorage");
    return {};
  }
}

// ----------------------------------------------------------------------------
// INTERNAL: Save sessions to localStorage
// ----------------------------------------------------------------------------
function saveSessions(data: Record<string, string>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("❌ Failed to write AI sessions:", e);
  }
}

// ----------------------------------------------------------------------------
// PUBLIC: Create a new AI session and return the sessionId
// ----------------------------------------------------------------------------
export function createAISession(pageId: string): string {
  const sessions = loadSessions();

  // Check if we already have a session for this page
  if (sessions[pageId]) return sessions[pageId];

  // Create a new session and store it
  const newSessionId = nanoid();
  sessions[pageId] = newSessionId;
  saveSessions(sessions);

  return newSessionId;
}

// ----------------------------------------------------------------------------
// PUBLIC: Get the session ID for a specific pageId
// ----------------------------------------------------------------------------
export function getAISession(pageId: string): string | null {
  const sessions = loadSessions();
  return sessions[pageId] ?? null;
}

// ----------------------------------------------------------------------------
// PUBLIC: Clear the session data for a given pageId
// ----------------------------------------------------------------------------
export function clearAISession(pageId: string) {
  const sessions = loadSessions();
  delete sessions[pageId];
  saveSessions(sessions);
}

// ----------------------------------------------------------------------------
// PUBLIC: Clear all AI session data (used for resets)
// ----------------------------------------------------------------------------
export function clearAllAISessions() {
  saveSessions({});
}

// ----------------------------------------------------------------------------
// DEBUG UTIL (optional)
// ----------------------------------------------------------------------------
export function debugAISessions() {
  const sessions = loadSessions();
  console.log("📚 AI Sessions Dump:", sessions);
}
