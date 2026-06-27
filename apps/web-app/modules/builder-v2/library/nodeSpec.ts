import type {
  BuilderBlueprint,
  BuilderNode,
  BuilderTheme,
} from "../types/blueprint";
import type { NodeSpec, TemplateDefinition } from "./types";

function createNodeId(type: string) {
  return `${type}_${crypto.randomUUID()}`;
}

export function nodeSpecToNodeTree(
  spec: NodeSpec,
  parentId: string | null,
  nodes: Record<string, BuilderNode>
): string {
  const id = createNodeId(spec.type);
  const childIds: string[] = [];

  nodes[id] = {
    id,
    type: spec.type,
    name: spec.name,
    parentId,
    children: childIds,
    props: spec.props ?? {},
    style: spec.style ?? {},
  };

  for (const child of spec.children ?? []) {
    childIds.push(nodeSpecToNodeTree(child, id, nodes));
  }

  return id;
}

export function createBlueprintFromSectionSpecs({
  title,
  template,
  theme,
  sections,
}: {
  title: string;
  template: TemplateDefinition;
  theme: BuilderTheme;
  sections: NodeSpec[];
}): BuilderBlueprint {
  const now = new Date().toISOString();
  const nodes: Record<string, BuilderNode> = {};
  const rootId = createNodeId("page");

  nodes[rootId] = {
    id: rootId,
    type: "page",
    name: title,
    parentId: null,
    children: [],
    props: {
      title,
      templateId: template.id,
    },
    style: {
      backgroundColor: "theme.colors.background",
      color: "theme.colors.textPrimary",
      fontFamily: "theme.typography.bodyFont",
    },
  };

  for (const section of sections) {
    nodes[rootId].children.push(nodeSpecToNodeTree(section, rootId, nodes));
  }

  return {
    metadata: {
      version: 2,
      title,
      createdAt: now,
      updatedAt: now,
      template: template.id,
    },
    theme,
    root: rootId,
    nodes,
  };
}
