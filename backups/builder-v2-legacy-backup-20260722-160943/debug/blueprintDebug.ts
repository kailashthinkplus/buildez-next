import fs from "node:fs";
import path from "node:path";

import type { BuilderBlueprint, BuilderNode } from "../types/blueprint";
import type { SiteThemeLayout } from "../theme/siteLayout";

const FORBIDDEN_PATTERNS = [
  /company_website/i,
  /my first site/i,
  /buildez default/i,
  /polished website built/i,
  /placeholder/i,
  /lorem ipsum/i,
  /feature\s+\d/i,
  /service\s+\d/i,
  /project\s+\d/i,
  /123 business/i,
  /contact@business/i,
  /\(123\)\s*456-7890/i,
];

type JsonRecord = Record<string, unknown>;

function debugDir() {
  return (
    process.env.BUILDEZ_AI_DEBUG_DIR ||
    path.join(process.cwd(), "logs", "ai-debug")
  );
}

function safeLabel(label: string) {
  return label
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function writeDebugJson(label: string, payload: unknown) {
  if (process.env.BUILDEZ_AI_DEBUG_FILE === "0") {
    return;
  }

  try {
    const dir = debugDir();
    fs.mkdirSync(dir, { recursive: true });
    const event = {
      timestamp: new Date().toISOString(),
      label,
      payload,
    };
    const day = new Date().toISOString().slice(0, 10);
    fs.appendFileSync(
      path.join(dir, `events-${day}.jsonl`),
      `${JSON.stringify(event)}\n`,
      "utf8"
    );
    fs.writeFileSync(
      path.join(dir, "latest.json"),
      JSON.stringify(event, null, 2),
      "utf8"
    );
  } catch (error) {
    console.warn(
      "[BuildEZDebug] failed to write json log",
      error instanceof Error ? error.message : error
    );
  }
}

function writeBlueprintJson(label: string, blueprint: BuilderBlueprint) {
  if (process.env.BUILDEZ_AI_DEBUG_FILE === "0") {
    return;
  }
  if (process.env.AI_DEBUG_FULL_BLUEPRINT !== "true") {
    return;
  }

  try {
    const dir = debugDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${timestampSlug()}-${safeLabel(label)}.json`),
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          label,
          summary: summarizeBlueprint(blueprint),
          blueprint,
        },
        null,
        2
      ),
      "utf8"
    );
  } catch (error) {
    console.warn(
      "[BuildEZDebug] failed to write blueprint json",
      error instanceof Error ? error.message : error
    );
  }
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function textFromNode(node: BuilderNode) {
  const props = asRecord(node.props);
  const value =
    props.text ??
    props.html ??
    props.content ??
    props.label ??
    props.alt ??
    props.eyebrow ??
    props.title ??
    props.body;
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function truncate(value: string, max = 180) {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function collectColors(blueprint: BuilderBlueprint) {
  const colors = new Set<string>();
  Object.values(blueprint.nodes).forEach((node) => {
    const style = asRecord(node.style);
    ["color", "backgroundColor", "borderColor", "borderTopColor"].forEach((key) => {
      const value = style[key];
      if (typeof value === "string" && value.trim()) {
        colors.add(value.trim());
      }
    });
  });
  return Array.from(colors).slice(0, 24);
}

function collectImages(blueprint: BuilderBlueprint) {
  return Object.values(blueprint.nodes)
    .filter((node) => node.type === "image" || typeof node.props?.backgroundPrompt === "string" || typeof node.style?.backgroundImage === "string")
    .map((node) => ({
      id: node.id,
      type: node.type,
      hidden: Boolean(node.hidden),
      src: typeof node.props?.src === "string" ? truncate(node.props.src, 140) : "",
      backgroundImage:
        typeof node.style?.backgroundImage === "string"
          ? truncate(node.style.backgroundImage, 180)
          : "",
      aiImagePrompt:
        typeof node.props?.aiImagePrompt === "string"
          ? truncate(node.props.aiImagePrompt)
          : "",
      backgroundPrompt:
        typeof node.props?.backgroundPrompt === "string"
          ? truncate(node.props.backgroundPrompt)
          : "",
    }))
    .slice(0, 16);
}

function collectForbiddenHits(blueprint: BuilderBlueprint) {
  const hits: Array<{ nodeId: string; text: string }> = [];
  Object.values(blueprint.nodes).forEach((node) => {
    const values = [
      textFromNode(node),
      typeof node.style?.backgroundImage === "string" ? node.style.backgroundImage : "",
      JSON.stringify(node.props ?? {}),
    ].filter(Boolean);
    const joined = values.join(" ");
    if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(joined))) {
      hits.push({ nodeId: node.id, text: truncate(joined, 220) });
    }
  });
  return hits.slice(0, 20);
}

function collectLayoutFingerprint(blueprint: BuilderBlueprint) {
  const root = blueprint.nodes[blueprint.root];
  return (root?.children ?? [])
    .map((id) => blueprint.nodes[id])
    .filter(Boolean)
    .map((node) => ({
      id: node.id,
      type: node.type,
      children: node.children?.length ?? 0,
      display: node.style?.display,
      gridTemplateColumns: node.style?.gridTemplateColumns,
      backgroundColor: node.style?.backgroundColor,
      backgroundImage:
        typeof node.style?.backgroundImage === "string"
          ? truncate(node.style.backgroundImage, 120)
          : undefined,
    }));
}

export function summarizeBlueprint(blueprint: BuilderBlueprint | null | undefined) {
  if (!blueprint) {
    return { present: false };
  }

  const nodes = Object.values(blueprint.nodes);
  const headings = nodes
    .filter((node) => node.type === "heading")
    .map((node) => textFromNode(node))
    .filter(Boolean)
    .slice(0, 10);
  const textSamples = nodes
    .filter((node) => node.type === "text" || node.type === "button")
    .map((node) => textFromNode(node))
    .filter(Boolean)
    .slice(0, 14);

  return {
    present: true,
    root: blueprint.root,
    metadata: blueprint.metadata,
    theme: {
      id: blueprint.theme?.id,
      name: blueprint.theme?.name,
      preset: blueprint.theme?.preset,
      tokenKeys: Object.keys(asRecord(blueprint.theme?.tokens)).slice(0, 24),
    },
    nodeCount: nodes.length,
    sectionCount: nodes.filter((node) => node.type === "section").length,
    imageCount: nodes.filter((node) => node.type === "image").length,
    backgroundPromptCount: nodes.filter((node) => typeof node.props?.backgroundPrompt === "string").length,
    headings,
    textSamples,
    colors: collectColors(blueprint),
    images: collectImages(blueprint),
    forbiddenHits: collectForbiddenHits(blueprint),
    layoutFingerprint: collectLayoutFingerprint(blueprint),
  };
}

export function summarizeSiteLayout(layout: SiteThemeLayout | null | undefined) {
  if (!layout) {
    return { present: false };
  }

  return {
    present: true,
    header: {
      enabled: layout.header.enabled,
      variant: layout.header.variant,
      brandLabel: layout.header.brandLabel,
      ctaLabel: layout.header.ctaLabel,
      navLabels: layout.header.navItems.map((item) => item.label),
    },
    footer: {
      enabled: layout.footer.enabled,
      variant: layout.footer.variant,
      brandLabel: layout.footer.brandLabel,
      body: layout.footer.body,
      navLabels: layout.footer.navItems.map((item) => item.label),
    },
  };
}

export function logBuilderDebug(label: string, payload: JsonRecord) {
  try {
    console.log(`[BuildEZDebug] ${label}`, JSON.stringify(payload, null, 2));
  } catch {
    console.log(`[BuildEZDebug] ${label}`, payload);
  }
  writeDebugJson(label, payload);
}

export function logBlueprintDebug(label: string, blueprint: BuilderBlueprint) {
  const summary = summarizeBlueprint(blueprint);
  logBuilderDebug(`${label}:summary`, summary);
  writeBlueprintJson(label, blueprint);

  if (process.env.AI_DEBUG_FULL_BLUEPRINT !== "true") {
    return;
  }

  const serialized = JSON.stringify(blueprint, null, 2);
  const max = Number(process.env.BUILDEZ_AI_DEBUG_BLUEPRINT_MAX_CHARS || 60000);
  console.log(
    `[BuildEZDebug] ${label}:blueprint-json\n${serialized.slice(0, max)}${
      serialized.length > max ? "\n...[truncated]" : ""
    }`
  );
}
