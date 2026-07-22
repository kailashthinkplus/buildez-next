/* ==========================================================
   AI TYPES
========================================================== */

export type AiStatus =
  | "idle"
  | "running"
  | "success"
  | "error";

export type AiRole =
  | "user"
  | "assistant"
  | "system";

export type AiMessageKind =
  | "text"
  | "tone-pills"
  | "logo-actions"
  | "success"
  | "error";

export interface AiMessage {
  role: AiRole;

  text: string;

  ts: number;

  kind?: AiMessageKind;
}

export type AiTone =
  | "Professional"
  | "Friendly"
  | "Premium"
  | "Bold";