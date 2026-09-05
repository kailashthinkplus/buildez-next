import { normalizeProjectPath } from "../project-workspace/path";

export const PREVIEW_BRIDGE_VERSION = 1 as const;
export const PREVIEW_MESSAGE_TYPES = ["preview.ready", "preview.error", "element.hovered", "element.selected"] as const;
export type PreviewMessageType = (typeof PREVIEW_MESSAGE_TYPES)[number];

export type PreviewBridgeMessage = Readonly<{
  version: typeof PREVIEW_BRIDGE_VERSION;
  sessionId: string;
  type: PreviewMessageType;
  payload: unknown;
}>;

export function validatePreviewMessage(value: unknown, sessionId: string): value is PreviewBridgeMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return message.version === PREVIEW_BRIDGE_VERSION &&
    message.sessionId === sessionId &&
    typeof message.type === "string" &&
    PREVIEW_MESSAGE_TYPES.includes(message.type as PreviewMessageType);
}

export function validatePreviewFilePaths(paths: readonly string[]) {
  const normalized = paths.map(normalizeProjectPath);
  for (const path of normalized) {
    if (path === ".env" || path.startsWith(".env.") || path.startsWith("node_modules/") || path.startsWith(".git/")) {
      throw new Error(`Preview project contains a forbidden path: ${path}`);
    }
  }
  return normalized;
}

export function validatePreviewProjectPaths(paths: readonly string[]) {
  const normalized = validatePreviewFilePaths(paths);
  for (const required of ["package.json", "index.html", "src/main.tsx"]) {
    if (!normalized.includes(required)) throw new Error(`Preview project is missing ${required}`);
  }
  return normalized;
}
