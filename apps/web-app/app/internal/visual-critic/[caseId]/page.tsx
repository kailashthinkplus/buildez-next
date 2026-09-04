import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

import { PublishedPageRenderer } from "@/modules/builder-v2/runtime/PublishedPageRenderer";
import { buildGoldenWebsitePreview } from "@/modules/builder-v2/website-engine/golden-websites";
import { goldenWebsiteInput } from "@/modules/builder-v2/website-engine/golden-websites/framework/GoldenWebsiteRunner";
import { isInternalPreviewAvailable } from "@/modules/builder-v2/website-engine/internal-preview";
import { createBlueprintRepairPlan, executeRepairPlan } from "@/modules/builder-v2/website-engine/repair";

export const dynamic = "force-dynamic";

async function screenshotData(industry: string, caseId: string) {
  const capture = path.join(process.cwd(), "golden-captures", industry.replaceAll("_", "-"), caseId, "desktop.png");
  try { return `data:image/png;base64,${(await readFile(capture)).toString("base64")}`; } catch { return undefined; }
}

export default async function VisualCriticPage({ params }: { params: Promise<{ caseId: string }> }) {
  if (!isInternalPreviewAvailable()) notFound();
  const { caseId } = await params;
  const preview = buildGoldenWebsitePreview(caseId);
  if (!preview) notFound();
  const screenshot = await screenshotData(preview.fixture.industry, caseId);
  const proposal = preview.repairPlan.recommendations.find((repair) => ["replace_component_variant", "change_layout_pattern", "increase_section_spacing", "increase_heading_scale", "adjust_spacing_tokens", "adjust_typography_tokens", "reduce_content_density"].includes(repair.action));
  const executionPlan = createBlueprintRepairPlan(preview.repairPlan, proposal ? [proposal.id] : []);
  const simulation = executeRepairPlan({ blueprint: preview.blueprint, plan: executionPlan, mode: "simulate", compileInput: goldenWebsiteInput(preview.fixture), businessFamily: preview.fixture.businessProfile.family, selectedComponents: preview.selectedComponents });
  return <main data-testid="visual-critic-debug" style={{ background: "#eef0ed", color: "#17201d", minHeight: "100vh", padding: 28 }}>
    <header style={{ background: "#10211b", borderRadius: 14, color: "white", marginBottom: 24, padding: 24 }}>
      <p style={{ margin: "0 0 6px", opacity: .72 }}>RC-14 Visual Critic &amp; Repair Planner</p>
      <h1 style={{ margin: 0 }}>{preview.fixture.id}</h1>
      <div data-testid="visual-critic-scores" style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 16 }}>
        <span>Composition {preview.compositionScore}</span><span>Design {preview.designExecutionPlan.qualityScore.overall}</span><span>Visual {preview.visualQuality.overall}</span><strong>Critic {preview.visualCritic.score}</strong><span>Priority {preview.visualCritic.repairPriority}</span>
      </div>
    </header>
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, .65fr)" }}>
      <section aria-label="Golden screenshot" style={{ alignSelf: "start", background: "white", borderRadius: 14, overflow: "hidden", padding: 12 }}>
        {screenshot ? <img data-testid="visual-critic-screenshot" src={screenshot} alt={`${preview.fixture.id} desktop golden capture`} style={{ display: "block", height: "auto", width: "100%" }} /> : <p>Golden desktop capture unavailable. Run the RC-12 capture suite.</p>}
      </section>
      <aside style={{ display: "grid", gap: 18 }}>
        <section data-testid="visual-critic-issues" style={{ background: "white", borderRadius: 14, padding: 20 }}><h2>Detected problems</h2>{preview.visualCritic.issues.length ? <ol>{preview.visualCritic.issues.map((finding) => <li key={finding.id} style={{ marginBottom: 16 }}><strong>{finding.message}</strong><div style={{ color: "#59645f", fontSize: 13 }}>{finding.category} · {finding.severity}</div>{finding.affectedSections.length ? <div style={{ fontSize: 13 }}>Sections: {finding.affectedSections.join(", ")}</div> : null}</li>)}</ol> : <p>No critic issues detected.</p>}</section>
        <section data-testid="visual-critic-recommendations" style={{ background: "white", borderRadius: 14, padding: 20 }}><h2>Safe recommendations</h2>{preview.visualCritic.recommendations.length ? <ol>{preview.visualCritic.recommendations.map((repair) => <li key={repair.id} style={{ marginBottom: 16 }}><strong>{repair.action.replaceAll("_", " ")}</strong><p>{repair.instruction}</p><small>Confidence {repair.confidence.toFixed(2)} · recommendation only</small></li>)}</ol> : <p>No repair recommendation required.</p>}</section>
        <section role="tabpanel" aria-labelledby="repair-plan-tab" data-testid="visual-repair-plan" style={{ background: "white", borderRadius: 14, padding: 20 }}>
          <div role="tablist" aria-label="Critic detail"><strong id="repair-plan-tab" role="tab" aria-selected="true">Repair Plan</strong></div>
          <p><small>Deterministic recommendations only · Blueprint mutation disabled</small></p>
          {preview.repairPlan.recommendations.length ? <ol>{preview.repairPlan.recommendations.map((repair) => {
            const diagnosis = preview.repairPlan.affectedSections.find((item) => item.sectionId === repair.sectionId && item.issue === preview.visualCritic.issues.find((item) => item.id === repair.issueId)?.message);
            return <li key={`plan.${repair.id}`} style={{ borderTop: "1px solid #d9dfdc", marginBottom: 18, paddingTop: 14 }}>
              <div><small>Current component</small><br/><strong>{repair.from ?? diagnosis?.componentVariantId ?? repair.sectionId ?? "Page-level"}</strong></div>
              <p><small>Problem</small><br/>{diagnosis?.issue ?? preview.visualCritic.issues.find((item) => item.id === repair.issueId)?.message}</p>
              <p><small>Suggested repair</small><br/><strong>{repair.to ?? repair.suggestedPattern ?? repair.action.replaceAll("_", " ")}</strong></p>
              {repair.reason?.length ? <ul>{repair.reason.map((reason) => <li key={reason}>{reason}</li>)}</ul> : null}
              <small>Confidence {Math.round(repair.confidence * 100)}%</small>
            </li>;
          })}</ol> : <p>No repair required.</p>}
        </section>
        <section role="tabpanel" aria-labelledby="simulate-repair-tab" data-testid="repair-simulation" style={{ background: "white", borderRadius: 14, padding: 20 }}>
          <div role="tablist" aria-label="Repair execution"><strong id="simulate-repair-tab" role="tab" aria-selected="true">Simulate Repair</strong></div>
          <p><strong>{proposal?.from ?? proposal?.sectionId ?? "Current page"}</strong> → <strong>{proposal?.to ?? proposal?.suggestedPattern ?? proposal?.action.replaceAll("_", " ") ?? "No safe proposal"}</strong></p>
          <p>Before score {simulation.effectiveness.before} · After score {simulation.effectiveness.after} · Improvement {simulation.effectiveness.improvement >= 0 ? "+" : ""}{simulation.effectiveness.improvement}</p>
          <small>Status {simulation.status} · no persistence · CommandBus history {simulation.history.length}</small>
          {simulation.status === "simulated" ? <div data-testid="repair-simulation-render" style={{ border: "1px solid #d9dfdc", marginTop: 16, maxHeight: 640, overflow: "auto" }}><PublishedPageRenderer blueprint={simulation.blueprint} /></div> : <p>{simulation.validation.issues.join(" ") || "No approved executable repair."}</p>}
        </section>
      </aside>
    </div>
  </main>;
}
