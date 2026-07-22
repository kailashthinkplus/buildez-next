import { notFound } from "next/navigation";

import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { TrustedV11Reference } from "@/modules/builder-v2/ai-v11/benchmarks/reference/TrustedReferences";
import {
  buildV11VisualFixture,
  isV11PremiumFixtureId,
  isV11VisualFixtureId,
  isV11VisualPreviewAvailable,
} from "@/modules/builder-v2/ai-v11/benchmarks/visual/visualFixture";

export const dynamic = "force-dynamic";

export default async function V11VisualPreview({
  params,
  searchParams,
}: {
  params: Promise<{ fixtureId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  if (!isV11VisualPreviewAvailable()) notFound();
  const { fixtureId } = await params;
  const { mode = "compiled" } = await searchParams;
  if (
    !isV11VisualFixtureId(fixtureId) ||
    !["compiled", "reference"].includes(mode) ||
    (mode === "reference" && isV11PremiumFixtureId(fixtureId))
  )
    notFound();
  const fixture = buildV11VisualFixture(fixtureId);
  return (
    <main
      data-testid="v11-visual-preview"
      data-fixture-id={fixtureId}
      data-mode={mode}
      style={{ margin: 0, minHeight: "100vh", width: "100%" }}
    >
      <div
        data-testid="v11-visual-status"
        data-database-write="false"
        data-production-renderer={
          mode === "compiled" ? "PublishedPageRenderer" : "trusted-reference"
        }
        data-node-map={JSON.stringify(fixture.nodeMap)}
        data-node-count={Object.keys(fixture.blueprint.nodes).length}
        data-diagnostic-count={fixture.diagnostics.length}
        data-completeness={fixture.completeness?.valid}
      />
      <div data-testid="v11-visual-surface">
        {mode === "compiled" ? (
          <PublishedPageRenderer blueprint={fixture.blueprint} />
        ) : (
          <TrustedV11Reference id={fixtureId} />
        )}
      </div>
    </main>
  );
}
