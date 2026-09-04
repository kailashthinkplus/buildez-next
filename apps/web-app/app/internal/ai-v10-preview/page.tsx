import { notFound } from "next/navigation";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import {
  buildInternalPreview,
  INTERNAL_PREVIEW_FIXTURE_PROMPT,
  isInternalPreviewAvailable,
} from "@/modules/builder-v2/website-engine/internal-preview";

export const dynamic = "force-dynamic";

type InternalAiV10PreviewPageProps = {
  searchParams: Promise<{ prompt?: string | string[] }>;
};

export default async function InternalAiV10PreviewPage({ searchParams }: InternalAiV10PreviewPageProps) {
  if (!isInternalPreviewAvailable()) notFound();

  const params = await searchParams;
  const requestedPrompt = Array.isArray(params.prompt) ? params.prompt[0] : params.prompt;
  const prompt = requestedPrompt?.trim() || INTERNAL_PREVIEW_FIXTURE_PROMPT;
  const preview = buildInternalPreview({ prompt });

  return (
    <main style={{ background: "#e2e8f0", minHeight: "100vh", padding: 24 }}>
      <header data-testid="internal-preview-status" style={{ background: "#0f172a", color: "white", borderRadius: 12, marginBottom: 20, padding: 20 }}>
        <p style={{ color: "#93c5fd", fontSize: 12, fontWeight: 700, letterSpacing: 1.4, margin: 0 }}>INTERNAL · DEVELOPMENT ONLY</p>
        <h1 style={{ fontSize: 24, margin: "8px 0" }}>AI v10 disposable preview</h1>
        <p style={{ margin: 0 }}>{preview.requestId} · {preview.validation.nodeCount} nodes · {preview.validation.valid ? "valid" : "invalid"}</p>
        <p style={{ color: "#cbd5e1", fontSize: 13, margin: "8px 0 0" }}>{prompt}</p>
      </header>

      <section data-testid="internal-preview-render" style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
        {preview.canonicalBlueprint ? <PublishedPageRenderer blueprint={preview.canonicalBlueprint} /> : <p>Canonical Blueprint unavailable.</p>}
      </section>

      <details data-testid="internal-preview-artifact" style={{ background: "white", borderRadius: 12, marginTop: 20, padding: 20 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>Inspect generation artifact</summary>
        <pre style={{ fontSize: 12, maxHeight: 720, overflow: "auto", whiteSpace: "pre-wrap" }}>{JSON.stringify(preview, null, 2)}</pre>
      </details>
    </main>
  );
}
