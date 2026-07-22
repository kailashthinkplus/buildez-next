import type { BuilderBlueprint, BuilderNode } from "../../../types/blueprint";

export function sectionNode(blueprint: BuilderBlueprint, sectionId?: string): BuilderNode | undefined {
  if (!sectionId) return undefined;
  return blueprint.nodes[`section.${sectionId.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`]
    ?? Object.values(blueprint.nodes).find((node) => node.type === "section" && (node.id.endsWith(`.${sectionId}`) || node.props.sourceSectionId === sectionId));
}

export function descendants(blueprint: BuilderBlueprint, rootId: string): string[] {
  const result: string[] = [];
  const visit = (id: string) => { const node = blueprint.nodes[id]; if (!node) return; result.push(id); node.children.forEach(visit); };
  visit(rootId);
  return result;
}

export function updated(blueprint: BuilderBlueprint, nodes: Record<string, BuilderNode>, theme = blueprint.theme): BuilderBlueprint {
  return { ...blueprint, nodes, theme, metadata: { ...blueprint.metadata, updatedAt: new Date(0).toISOString() } };
}
