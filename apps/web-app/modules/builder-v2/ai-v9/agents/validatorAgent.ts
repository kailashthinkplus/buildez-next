import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";
import type { V9Workflow } from "./types";

const FORBIDDEN_IMAGE_URL =
  /(?:example|placeholder|placehold|dummy|invalid|test)/i;

const FORBIDDEN_TEXT =
  /(?:clear proof cues|generated from brand context|from real estate website generated|a satisfied client|over 500\+ satisfied clients|made our dream home a reality|john doe|jane smith|123 business rd|contact@business\.com|\(123\)\s*456-7890|feature 1|service 1|project 1|lorem ipsum)/i;

const BUILDEZ_COLOR_LEAKS = new Set([
  "#2563eb",
  "#f97316",
  "#0f172a",
  "#f8fafc",
]);

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasForbiddenProps(node: BuilderNode) {
  return Boolean(
    isRecord(node.props) &&
      ("className" in node.props ||
        "style" in node.props ||
        "dangerouslySetInnerHTML" in node.props)
  );
}

function hasForbiddenImage(value: unknown) {
  return typeof value === "string" && FORBIDDEN_IMAGE_URL.test(value);
}

function collectNodeText(node: BuilderNode) {
  const chunks: string[] = [];

  if (isRecord(node.props)) {
    ["text", "content", "label", "alt", "title", "placeholder"].forEach((key) => {
      const value = node.props?.[key];

      if (typeof value === "string") {
        chunks.push(value);
      }
    });
  }

  return chunks.join(" ");
}

function styleContainsBuildEzColor(value: unknown): boolean {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    return [...BUILDEZ_COLOR_LEAKS].some((color) => lower.includes(color));
  }

  if (isRecord(value)) {
    return Object.values(value).some(styleContainsBuildEzColor);
  }

  return false;
}

function nodeHasImagePrompt(node: BuilderNode) {
  return Boolean(
    isRecord(node.props) &&
      (typeof node.props.aiImagePrompt === "string" ||
        typeof node.props.imagePrompt === "string" ||
        typeof node.props.backgroundPrompt === "string")
  );
}

export function runV9ValidatorAgent(workflow: V9Workflow) {
  const warnings: string[] = [];
  const fatalWarnings: string[] = [];
  const blueprint = workflow.blueprint;

  if (!blueprint) {
    return {
      valid: false,
      warnings: ["Missing blueprint."],
      fatalWarnings: ["Missing blueprint."],
    };
  }

  if (!blueprint.root || !blueprint.nodes[blueprint.root]) {
    const warning = "Blueprint root is missing or does not point to a node.";
    warnings.push(warning);
    fatalWarnings.push(warning);
  }

  const sectionNodes = Object.values(blueprint.nodes).filter(
    (node) => node.type === "section"
  );

  if (sectionNodes.length < 6) {
    warnings.push(`Blueprint is too shallow; found only ${sectionNodes.length} sections.`);
  }

  const imagePromptCount = Object.values(blueprint.nodes).filter(nodeHasImagePrompt).length;

  if (imagePromptCount < 2) {
    warnings.push(`Blueprint needs more image direction; found ${imagePromptCount} image prompt(s).`);
  }

  Object.values(blueprint.nodes).forEach((node) => {
    if (!node.id || !node.type) {
      const warning = "A node is missing id or type.";
      warnings.push(warning);
      fatalWarnings.push(warning);
    }

    if (hasForbiddenProps(node)) {
      const warning = `${node.id} contains forbidden props.className, props.style, or raw HTML.`;
      warnings.push(warning);
      fatalWarnings.push(warning);
    }

    if (node.type === "image" && hasForbiddenImage(node.props?.src)) {
      const warning = `${node.id} contains a forbidden image URL.`;
      warnings.push(warning);
      fatalWarnings.push(warning);
    }

    if (hasForbiddenImage(node.style?.backgroundImage)) {
      const warning = `${node.id} contains a forbidden background image URL.`;
      warnings.push(warning);
      fatalWarnings.push(warning);
    }

    const text = collectNodeText(node);

    if (text && FORBIDDEN_TEXT.test(text)) {
      warnings.push(`${node.id} contains forbidden demo/filler copy.`);
    }

    if (styleContainsBuildEzColor(node.style)) {
      warnings.push(`${node.id} contains BuildEZ default color leakage.`);
    }

    node.children.forEach((childId) => {
      const child = blueprint.nodes[childId];

      if (!child) {
        const warning = `${node.id} references missing child ${childId}.`;
        warnings.push(warning);
        fatalWarnings.push(warning);
      } else if (child.parentId !== node.id) {
        const warning = `${child.id} has parentId ${child.parentId}, expected ${node.id}.`;
        warnings.push(warning);
        fatalWarnings.push(warning);
      }
    });
  });

  const pageNodes = Object.values(blueprint.nodes).filter(
    (node) => node.type === "page"
  );

  if (pageNodes.length !== 1) {
    const warning = `Blueprint must have exactly one page node; found ${pageNodes.length}.`;
    warnings.push(warning);
    fatalWarnings.push(warning);
  }

  return {
    valid: fatalWarnings.length === 0,
    warnings,
    fatalWarnings,
  };
}
