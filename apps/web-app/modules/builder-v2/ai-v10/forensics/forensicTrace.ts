import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import type { CSSProperties } from "react";
import { resolveRenderStyle } from "../../core/rendering/renderStyleResolver";
import { resolveNativeLayoutDisplay } from "../../core/rendering/renderContract";
import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";

export const FORENSIC_ARTIFACT_NAMES = [
  "00-input.json", "01-business-profile.json", "02-brand-profile.json", "03-content-strategy.json",
  "04-experience-strategy.json", "05-pattern-intelligence.json", "06-design-result.json",
  "07-art-direction-brief.json", "08-component-candidates.json", "09-component-selection.json",
  "10-composition-result.json", "11-website-spec.json", "12-semantic-compilation.json",
  "13-widget-seeds.json", "14-blueprint-before-enrichment.json", "15-blueprint-after-enrichment.json",
  "16-blueprint-after-images.json", "17-blueprint-after-repair.json", "18-final-blueprint.json",
  "19-rendered-style-contract.json", "trace-summary.md",
] as const;

export type BlueprintStageDiff = Readonly<{
  from: string; to: string; addedNodes: string[]; removedNodes: string[];
  reparentedNodes: Array<{ id: string; before: string | null; after: string | null }>;
  reorderedChildren: Array<{ id: string; before: string[]; after: string[] }>;
  changedNodeTypes: Array<{ id: string; before: string; after: string }>;
  changedProps: Array<{ id: string; path: string; before: unknown; after: unknown }>;
  changedStyles: Array<{ id: string; path: string; before: unknown; after: unknown }>;
  changedResponsiveValues: Array<{ id: string; path: string; before: unknown; after: unknown }>;
  invalidValuesIntroduced: Array<{ id: string; path: string; value: unknown; reason: string }>;
}>;

const stable = (value: unknown) => JSON.stringify(value, (_key, item) => {
  if (item instanceof Uint8Array) return { byteLength: item.byteLength, omitted: "binary-pixels" };
  if (item && typeof item === "object" && !Array.isArray(item)) {
    return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
  }
  return item;
}, 2);

function leafDiff(id: string, prefix: string, before: unknown, after: unknown) {
  const result: Array<{ id: string; path: string; before: unknown; after: unknown }> = [];
  const keys = new Set([...Object.keys((before as object) ?? {}), ...Object.keys((after as object) ?? {})]);
  for (const key of keys) {
    const a = (before as Record<string, unknown> | undefined)?.[key];
    const b = (after as Record<string, unknown> | undefined)?.[key];
    if (stable(a) !== stable(b)) result.push({ id, path: `${prefix}.${key}`, before: a, after: b });
  }
  return result;
}

function invalidReason(value: unknown): string | undefined {
  if (typeof value === "number" && (!Number.isFinite(value) || Math.abs(value) < 0.01)) return !Number.isFinite(value) ? "non-finite-number" : "zero-or-near-zero";
  if (typeof value === "string" && /\b(?:NaN|undefined|null)\b/i.test(value)) return "invalid-css-string";
  return undefined;
}

export function diffBlueprintStages(from: string, before: BuilderBlueprint, to: string, after: BuilderBlueprint): BlueprintStageDiff {
  const beforeIds = new Set(Object.keys(before.nodes));
  const afterIds = new Set(Object.keys(after.nodes));
  const shared = [...beforeIds].filter((id) => afterIds.has(id));
  const props = shared.flatMap((id) => leafDiff(id, "props", before.nodes[id].props, after.nodes[id].props));
  const styles = shared.flatMap((id) => leafDiff(id, "style", before.nodes[id].style, after.nodes[id].style));
  const responsive = styles.filter((change) => [change.before, change.after].some((value) => value && typeof value === "object" && ["desktop", "laptop", "tablet", "mobile"].some((key) => key in (value as object))));
  const invalidValuesIntroduced = styles.flatMap((change) => {
    const values = change.after && typeof change.after === "object"
      ? Object.entries(change.after as Record<string, unknown>).map(([key, value]) => ({ path: `${change.path}.${key}`, value }))
      : [{ path: change.path, value: change.after }];
    return values.flatMap((entry) => {
      const reason = invalidReason(entry.value);
      return reason ? [{ id: change.id, path: entry.path, value: entry.value, reason }] : [];
    });
  });
  return Object.freeze({
    from, to,
    addedNodes: [...afterIds].filter((id) => !beforeIds.has(id)),
    removedNodes: [...beforeIds].filter((id) => !afterIds.has(id)),
    reparentedNodes: shared.filter((id) => before.nodes[id].parentId !== after.nodes[id].parentId).map((id) => ({ id, before: before.nodes[id].parentId, after: after.nodes[id].parentId })),
    reorderedChildren: shared.filter((id) => stable(before.nodes[id].children) !== stable(after.nodes[id].children)).map((id) => ({ id, before: before.nodes[id].children, after: after.nodes[id].children })),
    changedNodeTypes: shared.filter((id) => before.nodes[id].type !== after.nodes[id].type).map((id) => ({ id, before: before.nodes[id].type, after: after.nodes[id].type })),
    changedProps: props, changedStyles: styles, changedResponsiveValues: responsive, invalidValuesIntroduced,
  });
}

const GEOMETRY_KEYS = ["display", "position", "width", "minWidth", "maxWidth", "height", "gridTemplateColumns", "gridColumn", "flexDirection", "flexBasis", "flexGrow", "flexShrink", "gap", "padding", "margin", "fontSize", "lineHeight", "overflow"] as const;
const pickGeometry = (style: Record<string, unknown> | CSSProperties) => Object.fromEntries(GEOMETRY_KEYS.map((key) => [key, style[key]]));
const numericPx = (value: unknown) => typeof value === "number" ? value : typeof value === "string" && /^\d+(?:\.\d+)?px$/.test(value) ? Number.parseFloat(value) : undefined;

export function buildRenderedStyleContract(blueprint: BuilderBlueprint) {
  const nodes = Object.values(blueprint.nodes).map((node) => {
    const resolved = Object.fromEntries((["desktop", "tablet", "mobile"] as const).map((device) => [device, pickGeometry(resolveRenderStyle(node, blueprint, { device }))]));
    const rendererResolved = Object.fromEntries((["desktop", "tablet", "mobile"] as const).map((device) => {
      const style = resolved[device];
      if (node.type !== "container") return [device, style];
      const display = resolveNativeLayoutDisplay({ resolvedDisplay: style.display, layoutProp: node.props.layout });
      return [device, { ...style, display, source: "shared native layout display contract" }];
    }));
    return { id: node.id, type: node.type, parentId: node.parentId, children: [...node.children], raw: pickGeometry(node.style), resolved, rendererResolved };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const anomalies: Array<{ code: string; nodeId: string; path: string; value?: unknown; evidence: string }> = [];
  for (const item of nodes) {
    const node = blueprint.nodes[item.id];
    const desktop = item.resolved.desktop;
    if (desktop.display !== item.rendererResolved.desktop.display) anomalies.push({ code: "RENDERER_DISPLAY_OVERRIDE", nodeId: node.id, path: "rendererResolved.desktop.display", value: item.rendererResolved.desktop.display, evidence: `renderStyleResolver produced ${String(desktop.display)}, but Canvas and runtime derive layout from props.layout=${String(node.props.layout)} and override it.` });
    const width = numericPx(desktop.width);
    if ((node.type === "text" || node.type === "heading") && width !== undefined && width < (node.type === "heading" ? 220 : 160)) anomalies.push({ code: node.type === "heading" ? "NARROW_DESKTOP_HEADING" : "NARROW_DESKTOP_TEXT", nodeId: node.id, path: "resolved.desktop.width", value: desktop.width, evidence: `Desktop width ${width}px is below threshold.` });
    const min = numericPx(desktop.minWidth); const max = numericPx(desktop.maxWidth);
    if (min !== undefined && max !== undefined && max < min) anomalies.push({ code: "MAX_WIDTH_BELOW_MIN_WIDTH", nodeId: node.id, path: "resolved.desktop.maxWidth", value: desktop.maxWidth, evidence: `maxWidth ${max}px < minWidth ${min}px.` });
    for (const key of ["width", "minWidth", "maxWidth", "height"] as const) {
      const reason = invalidReason(desktop[key]);
      if (reason) anomalies.push({ code: "INVALID_GEOMETRY_VALUE", nodeId: node.id, path: `resolved.desktop.${key}`, value: desktop[key], evidence: reason });
    }
    if (node.type === "grid" && node.children.length && (!desktop.gridTemplateColumns || desktop.gridTemplateColumns === "none")) anomalies.push({ code: "GRID_WITHOUT_TRACKS", nodeId: node.id, path: "resolved.desktop.gridTemplateColumns", value: desktop.gridTemplateColumns, evidence: "Grid has children but no valid desktop tracks." });
    if (desktop.position === "absolute") {
      const parent = item.parentId ? byId.get(item.parentId) : undefined;
      if (!parent || !["relative", "absolute", "fixed", "sticky"].includes(String(parent.resolved.desktop.position))) anomalies.push({ code: "ABSOLUTE_WITHOUT_POSITIONED_PARENT", nodeId: node.id, path: "resolved.desktop.position", value: desktop.position, evidence: `Parent ${item.parentId ?? "none"} is not positioned.` });
    }
    const rawWidth = node.style.width;
    if (rawWidth && typeof rawWidth === "object" && "mobile" in rawWidth && !("desktop" in rawWidth) && desktop.width === (rawWidth as Record<string, unknown>).mobile) anomalies.push({ code: "MOBILE_OVERRIDE_AT_DESKTOP", nodeId: node.id, path: "style.width", value: rawWidth, evidence: "Mobile value resolved for desktop." });
    if (item.parentId && width !== undefined) {
      const parentWidth = numericPx(byId.get(item.parentId)?.resolved.desktop.width);
      if (parentWidth !== undefined && width > parentWidth) anomalies.push({ code: "PARENT_CHILD_WIDTH_CONTRADICTION", nodeId: node.id, path: "resolved.desktop.width", value: desktop.width, evidence: `Child ${width}px exceeds parent ${parentWidth}px.` });
    }
  }
  const sections = Object.values(blueprint.nodes).filter((node) => node.type === "section");
  const roles = new Map<string, string>();
  for (const section of sections) {
    const role = String(section.props.role ?? section.props.semanticRole ?? section.name ?? "").trim().toLowerCase();
    if (role && roles.has(role)) anomalies.push({ code: "DUPLICATE_SECTION_ROLE", nodeId: section.id, path: "props.role", value: role, evidence: `Duplicates ${roles.get(role)}.` });
    else if (role) roles.set(role, section.id);
  }
  return Object.freeze({ blueprintRoot: blueprint.root, nodeCount: nodes.length, nodes, anomalies });
}

export class AiV10ForensicTrace {
  readonly enabled: boolean;
  readonly directory?: string;
  private blueprints: Array<{ stage: string; blueprint: BuilderBlueprint }> = [];
  private screenshotsCaptured = false;
  constructor(runId: string, root = join(process.cwd(), "test-results", "ai-v10-forensic")) {
    this.enabled = process.env.AI_V10_FORENSIC_TRACE === "1";
    if (!this.enabled) return;
    this.directory = join(root, runId.replace(/[^a-zA-Z0-9._-]/g, "_"));
    mkdirSync(this.directory, { recursive: true });
  }
  snapshot(name: string, value: unknown) {
    if (!this.directory) return;
    const copy = JSON.parse(stable(value));
    writeFileSync(join(this.directory, name), `${stable(copy)}\n`, { flag: "wx" });
    if (name.includes("blueprint") && value && typeof value === "object" && "nodes" in value) this.blueprints.push({ stage: name, blueprint: structuredClone(value as BuilderBlueprint) });
  }
  captureScreenshots(screenshots: readonly { viewport: string; width: number; height: number; pixels: Uint8Array; pixelFormat: "rgba" }[]) {
    if (!this.directory || this.screenshotsCaptured) return;
    for (const shot of screenshots) {
      if (!["desktop", "tablet", "mobile"].includes(shot.viewport)) continue;
      writeFileSync(join(this.directory, `${shot.viewport}.png`), encodeRgbaPng(shot.width, shot.height, shot.pixels), { flag: "wx" });
    }
    this.screenshotsCaptured = true;
  }
  finalize(finalBlueprint: BuilderBlueprint) {
    if (!this.directory) return;
    const contract = buildRenderedStyleContract(finalBlueprint);
    this.snapshot("19-rendered-style-contract.json", contract);
    const diffs = this.blueprints.slice(1).map((entry, index) => diffBlueprintStages(this.blueprints[index].stage, this.blueprints[index].blueprint, entry.stage, entry.blueprint));
    const first = contract.anomalies[0];
    const summary = [`# AI v10 forensic trace`, ``, `- Run directory: \`${this.directory}\``, `- Blueprint stages: ${this.blueprints.length}`, `- Geometry anomalies: ${contract.anomalies.length}`, `- First detected anomaly: ${first ? `\`${first.code}\` at \`${first.nodeId}\` / \`${first.path}\`` : "none"}`, ``, `## Blueprint stage diffs`, "", "```json", stable(diffs), "```", ""].join("\n");
    writeFileSync(join(this.directory, "trace-summary.md"), summary, { flag: "wx" });
  }
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array) {
  const typeBytes = Buffer.from(type);
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0); typeBytes.copy(output, 4); Buffer.from(data).copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([typeBytes, Buffer.from(data)])), 8 + data.length);
  return output;
}

function encodeRgbaPng(width: number, height: number, pixels: Uint8Array) {
  if (pixels.byteLength !== width * height * 4) throw new Error("FORENSIC_SCREENSHOT_RGBA_LENGTH_MISMATCH");
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let row = 0; row < height; row += 1) Buffer.from(pixels.subarray(row * width * 4, (row + 1) * width * 4)).copy(scanlines, row * (width * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk("IHDR", header), pngChunk("IDAT", deflateSync(scanlines)), pngChunk("IEND", new Uint8Array())]);
}
