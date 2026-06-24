// ============================================================================
// AiTypes.ts — FINAL V3 TYPE SYSTEM
// Unified patch-based AI model for the BuildEZ builder
// ============================================================================

// ---------------------------------------------------------------------------
// 1. AI Response Envelope
// Every client → server AI call returns this structure.
// ---------------------------------------------------------------------------
export interface AIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// 2. Blueprint Patch (MAIN STRUCTURE)
// OpenAI returns these patches.
// applyPatch.ts consumes them.
// useBlueprintStore.applyPatches() applies them to ShadowTree.
// ---------------------------------------------------------------------------
export interface BlueprintPatch {
  /** "update" | "insert" | "delete" */
  type: "update" | "insert" | "delete";

  /**
   * Dot-notation path inside the blueprint:
   *  "root.children.0.props.heading"
   *  "root.children.2.children.1.props.text"
   *  "root.children.3"
   */
  path: string;

  /**
   * For update patches:
   *   { type: "update", path: "props.title", value: "New Title" }
   */
  value?: any;

  /**
   * For insert patches:
   *   A FULL BlueprintNode must be provided.
   */
  node?: any;

  /**
   * UX helper:
   *   If returned, applyPatches() will auto-select this node after patching.
   */
  targetId?: string;
}

// ---------------------------------------------------------------------------
// 3. Unified AI Engine Payloads
// All client → API bodies should extend these types.
// ---------------------------------------------------------------------------

export interface RunBlueprintAIPayload {
  prompt: string;
  page: any;  // PageNode (serializable blueprint root)
}

// IMAGE GENERATION PAYLOAD
export interface GenerateImagePayload {
  prompt: string;
  size?: "square" | "portrait" | "landscape";
  style?: string;
  model?: string;
}

// ---------------------------------------------------------------------------
// 4. AI SESSION + HISTORY (Client-Side Only)
// No blueprint logic — just tracking.
// ---------------------------------------------------------------------------
export interface AISession {
  id: string;
  pageId: string;
  createdAt: number;
}

export interface AIHistoryEvent {
  sessionId: string;
  input: string;
  output: any;
  timestamp: number;
}
