import { notFound } from "next/navigation";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { buildContentCompilerVisualFixture, CONTENT_VISUAL_VARIANTS, type ContentVisualVariant } from "@/modules/builder-v2/website-engine/builder-blueprint/component-recipes/content/contentVisualFixtures";
import { isInternalPreviewAvailable } from "@/modules/builder-v2/website-engine/internal-preview";

export const dynamic = "force-dynamic";

export default async function ContentCompilerPreviewPage({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (!isInternalPreviewAvailable()) notFound();
  const requested = (await searchParams).variant;
  if (!CONTENT_VISUAL_VARIANTS.includes(requested as ContentVisualVariant)) notFound();
  const variant = requested as ContentVisualVariant;
  return <main style={{ background: "#e5e7eb", minHeight: "100vh", padding: 24 }}>
    <header data-testid="content-compiler-preview-status" style={{ background: "#111827", color: "white", padding: 16 }}><strong>RC-9D.1 · {variant}</strong></header>
    <section data-testid="content-compiler-preview-render" style={{ background: "white", overflow: "hidden" }}><PublishedPageRenderer blueprint={buildContentCompilerVisualFixture(variant)} /></section>
  </main>;
}
