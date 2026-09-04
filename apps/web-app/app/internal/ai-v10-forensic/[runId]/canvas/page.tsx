import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { BuilderBlueprint } from "../../../../../modules/builder-v2/types/blueprint";
import { CanvasForensicClient } from "./CanvasForensicClient";

export default async function ForensicCanvasPage({ params, searchParams }: { params: Promise<{ runId: string }>; searchParams: Promise<{ device?: string }> }) {
  const { runId } = await params; const query = await searchParams;
  if (!/^[a-zA-Z0-9._-]+$/.test(runId)) notFound();
  let blueprint: BuilderBlueprint;
  try { blueprint = JSON.parse(await readFile(join(process.cwd(), "test-results", "ai-v10-forensic", runId, "18-final-blueprint.json"), "utf8")); } catch { notFound(); }
  const device = query.device === "mobile" || query.device === "tablet" ? query.device : "desktop";
  return <CanvasForensicClient blueprint={blueprint} device={device} />;
}
