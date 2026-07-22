import Link from "next/link";
import { notFound } from "next/navigation";
import SanjeeviniPremiumParity from "@/modules/builder-v2/ai-v11/fixtures/sanjeevini-premium-parity";
import { buildV11VisualFixture, isV11VisualPreviewAvailable } from "@/modules/builder-v2/ai-v11/benchmarks/visual/visualFixture";
import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";

export const dynamic = "force-dynamic";

export default async function SanjeeviniParityPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (!isV11VisualPreviewAvailable()) notFound();
  const { mode = "code" } = await searchParams;
  if (mode !== "code" && mode !== "nodes") notFound();
  const fixture = buildV11VisualFixture("sanjeevini-premium-parity");
  return <main className="min-h-screen bg-[#f4f0e8]">
    <div className="sticky top-0 z-[9999] flex items-center justify-center gap-2 border-b border-black/10 bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur">
      <span className="mr-3 hidden text-neutral-500 md:inline">Same TSX · {Object.keys(fixture.blueprint.nodes).length} Builder nodes</span>
      <Link href="/internal/v11-parity/sanjeevini?mode=code" className={`rounded-full px-5 py-2 font-semibold ${mode === "code" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"}`}>Direct TSX</Link>
      <Link href="/internal/v11-parity/sanjeevini?mode=nodes" className={`rounded-full px-5 py-2 font-semibold ${mode === "nodes" ? "bg-black text-white" : "bg-neutral-100 text-neutral-700"}`}>V11 Builder nodes</Link>
    </div>
    <div data-testid="v11-parity-surface" data-mode={mode} data-node-count={Object.keys(fixture.blueprint.nodes).length}>
      {mode === "code" ? <SanjeeviniPremiumParity /> : <PublishedPageRenderer blueprint={fixture.blueprint} />}
    </div>
  </main>;
}
