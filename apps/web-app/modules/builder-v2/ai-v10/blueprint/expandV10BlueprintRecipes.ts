import type { BuilderBlueprint, BuilderNode } from "../../types/blueprint";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function expandV10BlueprintRecipes(blueprint: BuilderBlueprint): BuilderBlueprint {
  if (Object.values(blueprint.nodes).some((node) => node.type === "section" && node.props?.semanticRecipe === true)) {
    return blueprint;
  }
  const nodes: Record<string, BuilderNode> = { ...blueprint.nodes };
  const root = nodes[blueprint.root];
  for (const [index, sectionId] of (root?.children || []).entries()) {
    const section = nodes[sectionId];
    const purpose = `${section?.props?.role || ""} ${section?.props?.purpose || ""}`.toLowerCase();
    const containerId = section?.children?.[0];
    const container = containerId ? nodes[containerId] : undefined;
    if (!section || !container) continue;

    section.style = {
      ...section.style,
      position: "relative",
      overflow: "hidden",
      paddingTop: index === 0 ? 120 : 96,
      paddingBottom: index === 0 ? 120 : 96,
    };
    container.style = {
      ...container.style,
      gap: index % 3 === 0 ? 56 : 40,
      flexDirection: index % 2 ? "row-reverse" : "row",
      alignItems: "center",
    } as BuilderNode["style"];

    if (!/(showcase|portfolio|project|residence|gallery|offer)/.test(purpose)) continue;
    const base = slug(sectionId);
    const children = [...container.children];
    for (let item = 1; item <= 4; item += 1) {
      const cardId = `card.${base}.${item}`;
      const imageId = `image.${base}.${item}`;
      const headingId = `heading.${base}.${item}`;
      const textId = `text.${base}.${item}`;
      nodes[cardId] = {
        id: cardId, type: "column", name: `Showcase item ${item}`, parentId: containerId,
        children: [imageId, headingId, textId], props: {},
        style: { display: "flex", flexDirection: "column", gap: 14 },
      };
      nodes[imageId] = {
        id: imageId, type: "image", name: `Showcase image ${item}`, parentId: cardId,
        children: [], props: { src: "", alt: "Residential project architectural view" },
        style: { width: "100%", aspectRatio: item % 2 ? "4 / 5" : "4 / 3", objectFit: "cover" },
      };
      nodes[headingId] = {
        id: headingId, type: "heading", name: `Showcase heading ${item}`, parentId: cardId,
        children: [], props: { text: "Residential opportunity", level: "h3" }, style: { fontSize: 28 },
      };
      nodes[textId] = {
        id: textId, type: "text", name: `Showcase text ${item}`, parentId: cardId,
        children: [], props: { text: "Explore the architecture, setting, and living experience." }, style: { lineHeight: 1.6 },
      };
      children.push(cardId);
    }
    container.children = children;
    container.style = {
      ...container.style,
      display: "grid",
      gridTemplateColumns: { desktop: "repeat(2, minmax(0, 1fr))", tablet: "repeat(2, minmax(0, 1fr))", mobile: "1fr" },
      alignItems: "start",
    };
  }
  return { ...blueprint, nodes };
}
