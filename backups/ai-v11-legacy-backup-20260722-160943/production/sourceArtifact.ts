import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type V11SourceDiagnostic = Readonly<{
  code: string;
  file?: string;
  line?: number;
  column?: number;
  message?: string;
}>;

export type V11SourceArtifactStatus =
  | "created"
  | "raw_persisted"
  | "normalized"
  | "compiled"
  | "source_rejected"
  | "parse_rejected"
  | "direct_compilation_failed"
  | "stream_failed";

export type V11SourceArtifact = Readonly<{
  generationId: string;
  createdAt: string;
  updatedAt: string;
  promptHash: string;
  model: string;
  status: V11SourceArtifactStatus;
  contentHash?: string;
  normalizedContentHash?: string;
  rawSource?: string;
  normalizedSource?: string;
  diagnostics: readonly V11SourceDiagnostic[];
  error?: string;
}>;

export function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function structuredDiagnostics(error: unknown): readonly V11SourceDiagnostic[] {
  const message = error instanceof Error ? error.message : String(error);
  const diagnostics = [...message.matchAll(/^([A-Z][A-Z0-9_]+) at (.+?):(\d+):(\d+)$/gm)].map(
    (match) => ({
      code: match[1],
      file: match[2],
      line: Number(match[3]),
      column: Number(match[4]),
    }),
  );
  if (diagnostics.length) return Object.freeze(diagnostics);
  const code = message.match(/\b(V11_[A-Z0-9_]+)\b/)?.[1];
  return Object.freeze(code ? [{ code, message }] : []);
}

export class V11SourceArtifactTrace {
  readonly generationId: string;
  readonly directory: string;
  private artifact: V11SourceArtifact;

  constructor(input: {
    generationId?: string;
    prompt: string;
    model: string;
    root?: string;
    now?: string;
  }) {
    const now = input.now ?? new Date().toISOString();
    this.generationId = input.generationId?.trim() || randomUUID();
    const root = input.root ?? join(process.cwd(), "test-results", "ai-v11-replay");
    this.directory = join(root, this.generationId.replace(/[^a-zA-Z0-9._-]/g, "_"));
    this.artifact = Object.freeze({
      generationId: this.generationId,
      createdAt: now,
      updatedAt: now,
      promptHash: sha256(input.prompt),
      model: input.model,
      status: "created",
      diagnostics: Object.freeze([]),
    });
    this.persist();
  }

  snapshot() {
    return this.artifact;
  }

  recordRaw(rawSource: string) {
    this.update({ status: "raw_persisted", rawSource, contentHash: sha256(rawSource) });
    writeFileSync(join(this.directory, "raw.tsx"), rawSource, "utf8");
  }

  recordNormalized(normalizedSource: string) {
    this.update({
      status: "normalized",
      normalizedSource,
      normalizedContentHash: sha256(normalizedSource),
    });
    writeFileSync(join(this.directory, "normalized.tsx"), normalizedSource, "utf8");
  }

  recordCompiled() {
    this.update({ status: "compiled", diagnostics: Object.freeze([]), error: undefined });
  }

  recordFailure(status: Exclude<V11SourceArtifactStatus, "created" | "raw_persisted" | "normalized" | "compiled">, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.update({ status, diagnostics: structuredDiagnostics(error), error: message });
  }

  private update(patch: Partial<V11SourceArtifact>) {
    this.artifact = Object.freeze({
      ...this.artifact,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
    this.persist();
  }

  private persist() {
    mkdirSync(this.directory, { recursive: true });
    writeFileSync(
      join(this.directory, "artifact.json"),
      `${JSON.stringify(this.artifact, null, 2)}\n`,
      "utf8",
    );
  }
}
