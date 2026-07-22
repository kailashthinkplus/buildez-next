import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

async function main() {
const runId = process.argv[2] ?? "sanjeevini-group-seed-104729";
const baseUrl = process.env.FORENSIC_BASE_URL ?? "http://127.0.0.1:3000";
const directory = join(process.cwd(), "test-results", "ai-v10-forensic", runId);
const browser = await chromium.launch();
const diagnostics: unknown[] = [];
for (const [viewport, width, height] of [["desktop", 1440, 1000], ["tablet", 834, 1112], ["mobile", 390, 844]] as const) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${baseUrl}/internal/ai-v10-forensic/${runId}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(directory, `${viewport}.png`), fullPage: true });
  const geometry = await page.locator("[data-node-id], [data-buildez-node-id]").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect(); const style = getComputedStyle(element);
    return { id: element.getAttribute("data-node-id") ?? element.getAttribute("data-buildez-node-id"), tag: element.tagName.toLowerCase(), text: (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 500), x: rect.x, y: rect.y, width: rect.width, height: rect.height, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight, overflowX: style.overflowX, overflowY: style.overflowY, display: style.display, position: style.position };
  }));
  for (const node of geometry) {
    if ((node.tag === "h1" || node.tag === "h2" || node.tag === "h3") && node.width < 220) diagnostics.push({ renderer: "runtime", viewport, code: "NARROW_HEADING", nodeId: node.id, width: node.width });
    else if ((node.tag === "p" || node.id?.startsWith("text.")) && node.width < 160) diagnostics.push({ renderer: "runtime", viewport, code: "NARROW_TEXT", nodeId: node.id, width: node.width });
    if (node.scrollWidth > node.width + 1 || node.scrollHeight > node.height + 2) diagnostics.push({ renderer: "runtime", viewport, code: "CONTENT_OVERFLOW", nodeId: node.id, bounds: { width: node.width, height: node.height }, scroll: { width: node.scrollWidth, height: node.scrollHeight } });
    if (node.id?.startsWith("section.") && node.height > height * 2.5) diagnostics.push({ renderer: "runtime", viewport, code: "EXTREME_SECTION_HEIGHT", nodeId: node.id, height: node.height, viewportHeight: height });
  }
  await writeFile(join(directory, `${viewport}-runtime-geometry.json`), `${JSON.stringify(geometry, null, 2)}\n`, { flag: "wx" });
  await page.close();
  const canvas = await browser.newPage({ viewport: { width, height } });
  await canvas.goto(`${baseUrl}/internal/ai-v10-forensic/${runId}/canvas?device=${viewport}`, { waitUntil: "networkidle" });
  await canvas.screenshot({ path: join(directory, `${viewport}-canvas.png`), fullPage: true });
  const canvasGeometry = await canvas.locator("[data-node-id]").evaluateAll((elements) => elements.map((element) => { const rect = element.getBoundingClientRect(); return { id: element.getAttribute("data-node-id"), x: rect.x, y: rect.y, width: rect.width, height: rect.height, scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight }; }));
  await writeFile(join(directory, `${viewport}-canvas-geometry.json`), `${JSON.stringify(canvasGeometry, null, 2)}\n`, { flag: "wx" });
  await canvas.close();
}
await browser.close();
await writeFile(join(directory, "20-rendered-dom-diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`, { flag: "wx" });
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
