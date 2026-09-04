import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";

export function applyV10BlueprintRepair(blueprint: BuilderBlueprint): BuilderBlueprint {
  const root = blueprint.nodes[blueprint.root];
  const sectionIds = root?.children || [];
  let headingIndex = 0;
  const nodes = Object.fromEntries(Object.entries(blueprint.nodes).map(([id, node]) => {
    const props = { ...(node.props || {}) };
    const style = { ...(node.style || {}) } as BuilderNode["style"];
    if (typeof props.text === "string" && /(?:verified (?:context|content|facts|details)|supplied (?:context|information)|missing facts?|source material|goes here|not (?:supplied|provided|available)|\bunknown\b)/i.test(props.text)) {
      props.text = node.type === "heading"
        ? "Designed around the way you want to live."
        : node.type === "button"
          ? "Explore more"
          : "Discover considered spaces, thoughtful details, and a clearer path toward your next home.";
    }
    if (node.type === "heading") {
      props.level = headingIndex === 0 ? "h1" : props.level === "h1" ? "h2" : props.level || "h2";
      headingIndex += 1;
    }
    if (node.type === "image" && !props.src && !props.aiImagePrompt) {
      props.aiImagePrompt = `${String(props.alt || "Editorial business visual")}, professional photography, natural light, no text, no watermark`;
    }
    const sectionIndex = sectionIds.indexOf(id);
    if (sectionIndex >= 0) {
      style.paddingTop = style.paddingTop || (sectionIndex === 0 ? 112 : 88);
      style.paddingBottom = style.paddingBottom || (sectionIndex === 0 ? 112 : 88);
      if (!style.backgroundColor) style.backgroundColor = sectionIndex % 2 ? "#F4F1EA" : "#FCFBF8";
    }
    return [id, { ...node, props, style }];
  }));
  return {
    ...blueprint,
    nodes,
    metadata: { ...blueprint.metadata, updatedAt: new Date().toISOString() },
  };
}
