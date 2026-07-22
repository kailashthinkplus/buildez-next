import { applyCreativeEnrichment, type Enrichment } from "../../../ai-v10/creative/runV10CreativeEnrichment";
import { compileSemanticBlueprint } from "../../builder-blueprint/SemanticBlueprintCompiler";
import { evaluateVisualQuality } from "../../visual-quality";
import { runVisualCritic } from "../../visual-critic";
import { GOLDEN_WEBSITE_CASES } from "../fixtures";
import { getGoldenReferenceMetadata } from "../references";
import { goldenWebsiteInput, runGoldenWebsite } from "../framework/GoldenWebsiteRunner";

function fixtureImage(caseId: string, index: number): string {
  const palettes = [["#d9cbb8", "#715b47"], ["#c9d8d4", "#315b52"], ["#ddd3cc", "#8b5c45"], ["#ccd3dc", "#35445d"]];
  const [background, foreground] = palettes[index % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="${background}"/><path d="M0 760 360 330l250 270 210-180 420 360 180-160 180 170v210H0Z" fill="${foreground}" opacity=".72"/><circle cx="1260" cy="220" r="120" fill="#fff" opacity=".32"/><text x="80" y="110" font-family="Arial" font-size="34" fill="${foreground}" opacity=".7">${caseId.replaceAll("-", " ")}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function previewText(node: { type: string; name?: string; props: Record<string, unknown> }, businessName: string): Record<string, unknown> {
  const role = String(node.name ?? "").toLowerCase();
  if (node.type === "button") return { text: /book|appointment|reservation/.test(role) ? "Book a consultation" : "Explore the next step", url: "#golden-conversion" };
  if (node.type === "heading") {
    if (node.props.level === "h1") return { text: `${businessName}, thoughtfully presented` };
    if (node.props.level === "h2") return { text: role.includes("faq") ? "Questions, answered clearly" : "Designed around what matters most" };
    return { text: role.includes("title") ? "A considered choice" : "Clarity at every step" };
  }
  return { text: role.includes("eyebrow") ? "Trusted expertise" : "Clear, useful information shaped around real needs, with an easy path to the next step." };
}

export function buildGoldenWebsitePreview(caseId: string) {
  const fixture = GOLDEN_WEBSITE_CASES.find((candidate) => candidate.id === caseId);
  if (!fixture) return undefined;
  const run = runGoldenWebsite(fixture);
  const semanticInput = goldenWebsiteInput(fixture);
  const semantic = compileSemanticBlueprint(semanticInput);
  const blueprint = run.blueprint.nativeBlueprint;
  const enrichment: Enrichment = { nodes: {} };
  let imageIndex = 0;
  for (const node of Object.values(blueprint.nodes)) {
    if (!JSON.stringify(node.props).includes("{{")) continue;
    enrichment.nodes![node.id] = node.type === "image"
      ? { props: { src: "", alt: `${fixture.businessProfile.businessName} visual story`, aiImagePrompt: `Editorial visual for ${fixture.industry}` } }
      : { props: previewText(node, fixture.businessProfile.businessName) };
  }
  const hydrated = applyCreativeEnrichment(blueprint, enrichment);
  const nativeBlueprint = Object.freeze({ ...hydrated, nodes: Object.freeze(Object.fromEntries(Object.entries(hydrated.nodes).map(([id, node]) => {
    if (node.type !== "image") return [id, node];
    const src = fixtureImage(caseId, imageIndex++);
    return [id, Object.freeze({ ...node, props: Object.freeze({ ...node.props, src }) })];
  }))) });
  const visualQuality = evaluateVisualQuality({ blueprint: nativeBlueprint, selectedComponents: run.report.selectedComponents, compositionWarnings: run.report.compositionTrace.warnings });
  const visualCritic = runVisualCritic({ blueprint: nativeBlueprint, compositionPlan: semanticInput.compositionResult, designExecutionPlan: semantic.designExecutionPlan, visualQualityScore: visualQuality, businessFamily: fixture.businessProfile.family, archetype: fixture.archetype });
  return Object.freeze({
    fixture,
    blueprint: nativeBlueprint,
    metadata: nativeBlueprint.metadata,
    selectedComponents: run.report.selectedComponents,
    compositionScore: semantic.compositionQuality.score,
    designExecutionPlan: semantic.designExecutionPlan,
    creativeScore: semantic.creativeDirectionPlan.creativeScore,
    creativeWarnings: semantic.creativeDirectionPlan.creativeWarnings,
    creativeDirectionPlan: semantic.creativeDirectionPlan,
    visualQuality,
    visualCritic,
    visualScore: visualQuality.overall,
    criticScore: visualCritic.score,
    repairPlan: visualCritic.repairPlan,
    reference: getGoldenReferenceMetadata(caseId),
    renderStatus: run.passed ? "ready" as const : "benchmark-failed" as const,
    sourceInputId: semanticInput.websiteSpec?.id,
  });
}
