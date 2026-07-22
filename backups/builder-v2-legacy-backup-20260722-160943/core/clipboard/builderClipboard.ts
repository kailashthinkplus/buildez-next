import type { BuilderClipboardPayload } from "./clipboardTypes";

const NODE_KEY = "__builder_copied_node";
const STYLE_KEY = "__builder_copied_style";

const memoryClipboard: Partial<Record<typeof NODE_KEY | typeof STYLE_KEY, string>> = {};

export function writeBuilderClipboard(payload: BuilderClipboardPayload): void {
  const key = payload.kind === "builder-node" ? NODE_KEY : STYLE_KEY;
  writeRawClipboard(key, JSON.stringify(payload));
}

export function readBuilderNodeClipboard() {
  const payload = readPayload(NODE_KEY);
  return payload?.kind === "builder-node" ? payload : null;
}

export function readBuilderStyleClipboard() {
  const payload = readPayload(STYLE_KEY);
  return payload?.kind === "builder-style" ? payload : null;
}

export function hasBuilderNodeClipboard(): boolean {
  return Boolean(readBuilderNodeClipboard());
}

export function hasBuilderStyleClipboard(): boolean {
  return Boolean(readBuilderStyleClipboard());
}

function readPayload(key: typeof NODE_KEY | typeof STYLE_KEY): BuilderClipboardPayload | null {
  try {
    const raw = readRawClipboard(key);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderClipboardPayload;
  } catch {
    return null;
  }
}

function readRawClipboard(key: typeof NODE_KEY | typeof STYLE_KEY): string | null {
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem(key);
  }

  return memoryClipboard[key] ?? null;
}

function writeRawClipboard(key: typeof NODE_KEY | typeof STYLE_KEY, value: string): void {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(key, value);
    return;
  }

  memoryClipboard[key] = value;
}
