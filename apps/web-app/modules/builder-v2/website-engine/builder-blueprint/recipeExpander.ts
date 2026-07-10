import type { BuilderBlueprintInput } from "./builderBlueprint";
import type { WidgetBlueprintSeed } from "./widgetBlueprint";

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Expands semantic component recipes into editable Builder primitive seeds.
 *
 * @example
 * const seeds = expandComponentRecipes(input);
 */
export function expandComponentRecipes(input: BuilderBlueprintInput): WidgetBlueprintSeed[] {
  const sections = input.compiledPlan?.sections.length ? input.compiledPlan.sections : input.websiteSpec?.sections ?? [];
  const seeds: WidgetBlueprintSeed[] = [Object.freeze({ id: "page.root", type: "page", name: "Page", parentId: null, children: sections.map((section) => `section.${safeId(String(section.id))}`), props: { title: input.websiteSpec?.business.businessName ?? "Website" }, style: {} })];

  sections.forEach((section, index) => {
    const sectionId = String(section.id);
    const id = safeId(sectionId || `section_${index}`);
    const sectionWidgetId = `section.${id}`;
    const containerId = `container.${id}`;
    const leftColumnId = `column.${id}.content`;
    const rightColumnId = `column.${id}.media`;
    const headingId = `heading.${id}`;
    const textId = `text.${id}`;
    const buttonId = `button.${id}`;
    const imageId = `image.${id}`;
    const sourceComponentVariantId = "componentVariantIds" in section ? section.componentVariantIds[0] : section.componentVariantRef;
    const sourcePatternId = "patternId" in section ? section.patternId : section.patternRefs?.[0];
    seeds.push(
      Object.freeze({ id: sectionWidgetId, type: "section", name: section.type, parentId: "page.root", children: [containerId], sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { role: section.type, purpose: section.purpose }, style: { paddingTop: 80, paddingBottom: 80 } }),
      Object.freeze({ id: containerId, type: "container", name: `${section.type} container`, parentId: sectionWidgetId, children: [leftColumnId, rightColumnId], sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { layout: "flex" }, style: { display: "flex", flexDirection: "row", gap: 32, maxWidth: 1180, margin: "0 auto" } }),
      Object.freeze({ id: leftColumnId, type: "column", name: "Content column", parentId: containerId, children: [headingId, textId, buttonId], sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, style: { width: "50%", display: "flex", flexDirection: "column", gap: 16 } }),
      Object.freeze({ id: rightColumnId, type: "column", name: "Media column", parentId: containerId, children: [imageId], sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, style: { width: "50%" } }),
      Object.freeze({ id: headingId, type: "heading", name: "Heading", parentId: leftColumnId, sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { text: section.purpose, level: index === 0 ? "h1" : "h2" }, style: { fontSize: index === 0 ? 56 : 40, fontWeight: 700 } }),
      Object.freeze({ id: textId, type: "text", name: "Text", parentId: leftColumnId, sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { text: "Editable verified content goes here. Missing facts remain explicit before final copy." }, style: { fontSize: 18, lineHeight: 1.6 } }),
      Object.freeze({ id: buttonId, type: "button", name: "Button", parentId: leftColumnId, sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { text: input.compiledPlan?.ctaPlan[0] ?? input.websiteSpec?.goals.primaryGoal ?? "Contact", url: "#" }, style: {} }),
      Object.freeze({ id: imageId, type: "image", name: "Image", parentId: rightColumnId, sourceSectionId: sectionId, sourceComponentVariantId, sourcePatternId, sectionRole: section.type, props: { src: "", alt: `${section.type} image asset required` }, style: { width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 16 } })
    );
  });
  return seeds;
}
