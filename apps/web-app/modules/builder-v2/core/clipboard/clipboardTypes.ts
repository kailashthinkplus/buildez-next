import type { BuilderNode, BuilderStyle, NodeType } from "../../types/blueprint";

export type BuilderNodeClipboardPayload = Readonly<{
  kind: "builder-node";
  rootId: string;
  rootType: NodeType;
  nodes: Record<string, BuilderNode>;
  copiedAt: string;
}>;

export type BuilderStyleClipboardPayload = Readonly<{
  kind: "builder-style";
  sourceType: NodeType;
  style: Partial<BuilderStyle>;
  copiedAt: string;
}>;

export type BuilderClipboardPayload =
  | BuilderNodeClipboardPayload
  | BuilderStyleClipboardPayload;

export type ClipboardOperationResult<T> = Readonly<
  | {
      ok: true;
      value: T;
      warnings: string[];
    }
  | {
      ok: false;
      errors: string[];
      warnings: string[];
    }
>;

export function clipboardSuccess<T>(
  value: T,
  warnings: string[] = []
): ClipboardOperationResult<T> {
  return Object.freeze({ ok: true, value, warnings });
}

export function clipboardFailure(
  errors: string[],
  warnings: string[] = []
): ClipboardOperationResult<never> {
  return Object.freeze({ ok: false, errors, warnings });
}
