import { notFound } from "next/navigation";

import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { buildGoldenWebsitePreview } from "@/modules/builder-v2/website-engine/golden-websites";
import { isInternalPreviewAvailable } from "@/modules/builder-v2/website-engine/internal-preview";

export const dynamic = "force-dynamic";

export default async function GoldenPreviewPage({ params }: { params: Promise<{ caseId: string }> }) {
  if (!isInternalPreviewAvailable()) notFound();
  const { caseId } = await params;
  const preview = buildGoldenWebsitePreview(caseId);
  if (!preview) notFound();
  const stableMetadata = { version: preview.metadata.version, title: preview.metadata.title, aiGenerated: preview.metadata.aiGenerated, industry: preview.metadata.industry, template: preview.metadata.template };
  return <main data-testid="golden-preview" style={{ background: "#eceae6", minHeight: "100vh", width: "100%" }}>
    <header data-testid="golden-preview-status" style={{ background: "#101312", color: "white", display: "grid", gap: 12, padding: "20px 28px" }}>
      <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
        <strong>RC-12 · {preview.fixture.id}</strong>
        <span data-testid="golden-render-status">{preview.renderStatus}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", fontSize: 13, gap: 16, opacity: .82 }}>
        <span data-testid="golden-composition-score">Composition {preview.compositionScore}</span>
        <span data-testid="golden-design-score">Design {preview.designExecutionPlan.qualityScore.overall}</span>
        <span data-testid="golden-visual-score">Visual {preview.visualQuality.overall}</span>
        <span>{preview.selectedComponents.length} components</span>
      </div>
    </header>
    <section
      aria-label="Golden website runtime preview"
      data-blueprint-metadata={JSON.stringify(stableMetadata)}
      data-design-execution-plan={JSON.stringify(preview.designExecutionPlan)}
      data-node-count={Object.keys(preview.blueprint.nodes).length}
      data-selected-components={JSON.stringify(preview.selectedComponents)}
      data-testid="golden-preview-render"
      style={{ background: "white", margin: "0 auto", maxWidth: 1600, width: "100%" }}
    >
      <PublishedPageRenderer blueprint={preview.blueprint} />
    </section>
  </main>;
}
