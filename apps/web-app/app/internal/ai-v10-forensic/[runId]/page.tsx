import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { PublishedPageRenderer } from "../../../../modules/builder-v2/runtime/PublishedPageRenderer";
import type { BuilderBlueprint } from "../../../../modules/builder-v2/types/blueprint";

export default async function ForensicRuntimePage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(runId)) notFound();
  let blueprint: BuilderBlueprint;
  try {
    blueprint = JSON.parse(await readFile(join(process.cwd(), "test-results", "ai-v10-forensic", runId, "18-final-blueprint.json"), "utf8"));
  } catch { notFound(); }
  return <main data-forensic-renderer="runtime"><PublishedPageRenderer blueprint={blueprint} /></main>;
}
