import { runV10WebsiteGeneration } from "../modules/builder-v2/ai-v10/orchestrator/runV10WebsiteGeneration";
import { collectCreativeNodeIds } from "../modules/builder-v2/ai-v10/creative/semanticHydrationValidation";

const RUN_ID = "sanjeevini-group-seed-104729";
const prompt = "Create a premium luxury residential developer website for Sanjeevini Group. The experience should feel architectural, editorial, calm, nature-led, credible, and designed for property discovery and consultation.";

const replace = (value: unknown): unknown => typeof value === "string"
  ? value.replace(/\{\{[a-zA-Z0-9_.-]+\}\}/g, "Sanjeevini Group")
  : Array.isArray(value) ? value.map(replace)
  : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]))
  : value;

async function main() {
await runV10WebsiteGeneration({
  pageId: "forensic-sanjeevini-home",
  pageTitle: "Sanjeevini Group",
  pageSlug: "home",
  siteName: "Sanjeevini Group",
  prompt,
  context: {
    generationRunId: RUN_ID,
    deterministicSeed: 104729,
    companyName: "Sanjeevini Group",
    industry: "real_estate",
    audience: "luxury residential property buyers",
    offer: "premium residential developments and consultation",
    designIntent: "architectural editorial calm nature-led credible",
  },
}, {
  runCreativeEnrichment: async (input) => {
    const semantic = new Set(collectCreativeNodeIds(input.blueprint));
    return {
      ...input.blueprint,
      nodes: Object.fromEntries(Object.entries(input.blueprint.nodes).map(([id, node]) => {
        if (!semantic.has(id)) return [id, node];
        const props = replace(node.props) as Record<string, unknown>;
        if (node.type === "heading") props.text = String(props.text ?? "Sanjeevini Group").replace(/Sanjeevini Group/g, id.includes("hero") ? "Homes shaped by nature, built for belonging" : "Considered living, enduring value");
        if (node.type === "text") props.html = String(props.html ?? "Sanjeevini Group").replace(/Sanjeevini Group/g, "Thoughtful residential communities grounded in landscape, architecture, and lasting trust.");
        if (node.type === "button") Object.assign(props, { text: "Explore residences", url: "#projects" });
        if (node.type === "image") Object.assign(props, { src: "", alt: "Sanjeevini residential architecture", aiImagePrompt: "Editorial luxury residential architecture in a lush Indian landscape" });
        return [id, { ...node, props }];
      })),
    };
  },
  runImageGeneration: async (blueprint) => ({ blueprint, applied: 0, warnings: ["Forensic fixture preserves missing image output."] }),
});

process.stdout.write(`test-results/ai-v10-forensic/${RUN_ID}\n`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
