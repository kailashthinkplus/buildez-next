import type { BusinessContext, JsonValue } from "../sdk";

export type InternalPreviewInput = Readonly<{
  requestId?: string;
  prompt: string;
  businessContext?: BusinessContext;
  aiV9Evidence?: unknown;
  metadata?: Record<string, JsonValue>;
}>;

