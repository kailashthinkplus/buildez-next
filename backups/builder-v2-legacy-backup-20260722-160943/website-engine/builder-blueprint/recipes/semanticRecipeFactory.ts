import type { BuilderStyle } from "../../../types/blueprint";
import type { WidgetBlueprintSeed } from "../widgetBlueprint";
import type { RecipeContext, SemanticRecipeName } from "./types";

function token(context: RecipeContext, group: "color" | "typography" | "spacing" | "radius", keys: string[], fallback: string | number) {
  const values = context.input.designResult?.designTokens[group] ?? {};
  for (const key of keys) if (values[key] !== undefined) return values[key];
  return fallback;
}

function metadata(context: RecipeContext) {
  return {
    sourceSectionId: context.section.id,
    sourceComponentVariantId: context.section.componentVariantId,
    sourcePatternId: context.section.patternIds[0],
    sectionRole: context.section.type,
  };
}

function seed(context: RecipeContext, value: Omit<WidgetBlueprintSeed, "sourceSectionId" | "sourceComponentVariantId" | "sourcePatternId" | "sectionRole">): WidgetBlueprintSeed {
  return Object.freeze({ ...value, ...metadata(context) });
}

function id(context: RecipeContext, role: string) {
  return `${role}.${context.key}`;
}

function placeholder(context: RecipeContext, field: string) {
  const namespace = context.section.type.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "section";
  return `{{${namespace}.${field}}}`;
}

function sectionShell(context: RecipeContext, children: string[], layout: BuilderStyle = {}) {
  const sectionY = token(context, "spacing", ["sectionY", "section_y", "xl"], context.input.designResult?.spacingProfile.sectionY ?? 72);
  const gutter = token(context, "spacing", ["containerX", "gutter", "md"], context.input.designResult?.spacingProfile.gutter ?? 24);
  const art = context.input.artDirectionBrief?.blueprintStrategy;
  const maxWidth = art?.containerMode === "wide" ? "1440px" : context.input.designResult?.layoutProfile.maxWidth ?? "1180px";
  const containerId = id(context, "container");
  return [
    seed(context, { id: context.sectionNodeId, type: "section", name: `${context.section.type} section`, parentId: "page.root", children: [containerId], props: { role: context.section.type, purpose: context.section.purpose, semanticRecipe: true, motion: context.input.designResult?.motionProfile.level ?? "low" }, style: { paddingTop: { desktop: sectionY, tablet: typeof sectionY === "number" ? Math.round(sectionY * .78) : sectionY, mobile: typeof sectionY === "number" ? Math.round(sectionY * .58) : sectionY }, paddingBottom: { desktop: sectionY, tablet: typeof sectionY === "number" ? Math.round(sectionY * .78) : sectionY, mobile: typeof sectionY === "number" ? Math.round(sectionY * .58) : sectionY }, backgroundColor: String(art?.sectionContrast === "subtle" ? token(context, "color", ["background", "surface"], "#ffffff") : context.section.order % 2 ? token(context, "color", ["surfaceAlt", "surface_alt", "muted"], "#f5f2ec") : token(context, "color", ["background", "surface"], "#ffffff")) } }),
    seed(context, { id: containerId, type: "container", name: `${context.section.type} layout`, parentId: context.sectionNodeId, children, props: { layout: layout.display ?? "grid" }, style: { width: "100%", maxWidth, margin: "0 auto", paddingLeft: { desktop: gutter, tablet: 20, mobile: 16 }, paddingRight: { desktop: gutter, tablet: 20, mobile: 16 }, ...(art?.containerMode === "framed" ? { borderRadius: 24, overflow: "hidden" } : {}), ...layout } }),
  ];
}

function heading(context: RecipeContext, parentId: string, role = "headline", level?: string) {
  const headingId = id(context, `heading.${role}`);
  const scale = context.input.artDirectionBrief?.blueprintStrategy.headingScale;
  const desktop = context.section.order === 0 ? scale === "dramatic" ? 80 : scale === "restrained" ? 56 : 68 : scale === "dramatic" ? 52 : scale === "restrained" ? 40 : 46;
  return seed(context, { id: headingId, type: "heading", name: role, parentId, children: [], props: { text: placeholder(context, role), level: level ?? (context.section.order === 0 ? "h1" : "h2") }, style: { color: String(token(context, "color", ["foreground", "textPrimary", "text"], "#111827")), fontFamily: String(token(context, "typography", ["headingFamily", "headingFont", "fontHeading"], context.input.designResult?.typographyProfile.headingFamily ?? "Inter")), fontSize: { desktop, tablet: Math.round(desktop * .76), mobile: Math.max(30, Math.round(desktop * .52)) }, lineHeight: scale === "dramatic" ? 1 : 1.08 } });
}

function text(context: RecipeContext, parentId: string, role = "description") {
  return seed(context, { id: id(context, `text.${role}`), type: "text", name: role, parentId, children: [], props: { text: placeholder(context, role) }, style: { color: String(token(context, "color", ["muted", "textSecondary"], "#4b5563")), fontFamily: String(token(context, "typography", ["bodyFamily", "bodyFont"], context.input.designResult?.typographyProfile.bodyFamily ?? "Inter")), fontSize: { desktop: 18, tablet: 17, mobile: 16 }, lineHeight: 1.65 } });
}

function button(context: RecipeContext, parentId: string, role = "primary_cta") {
  return seed(context, { id: id(context, `button.${role}`), type: "button", name: role, parentId, children: [], props: { text: `{{${role}}}`, url: `{{${role}.url}}` }, style: { backgroundColor: String(token(context, "color", ["primary", "accent"], "#1d4ed8")), color: String(token(context, "color", ["primaryContrast", "onPrimary"], "#ffffff")), borderRadius: token(context, "radius", ["button", "md"], context.input.designResult?.themeProfile.radius ?? 10), padding: "14px 22px" } });
}

function image(context: RecipeContext, parentId: string, role = "image", ratio = "16 / 10") {
  const corners = context.input.artDirectionBrief?.blueprintStrategy.cornerTreatment;
  const borderRadius = corners === "square" ? 0 : corners === "rounded" ? 28 : token(context, "radius", ["media", "card"], 18);
  return seed(context, { id: id(context, `image.${role}`), type: "image", name: role, parentId, children: [], props: { src: `{{${context.section.type}.${role}}}`, alt: `{{${context.section.type}.${role}.alt}}` }, style: { width: "100%", aspectRatio: ratio, objectFit: "cover", borderRadius } });
}

function editorialSplit(context: RecipeContext, kind: "hero" | "about" | "contact") {
  const contentId = id(context, "column.content");
  const mediaId = id(context, "column.media");
  const contentChildren = [id(context, "text.eyebrow"), id(context, "heading.headline"), id(context, "text.description"), id(context, "container.actions")];
  const actionsId = id(context, "container.actions");
  const actions = [id(context, "button.primary_cta"), ...(kind === "hero" ? [id(context, "button.secondary_cta")] : [])];
  return [
    ...sectionShell(context, [contentId, mediaId], { display: "grid", gridTemplateColumns: { desktop: kind === "hero" ? "1.15fr .85fr" : ".9fr 1.1fr", tablet: "1fr 1fr", mobile: "1fr" }, gap: { desktop: 64, tablet: 36, mobile: 28 }, alignItems: "center" }),
    seed(context, { id: contentId, type: "column", name: "Editorial content", parentId: id(context, "container"), children: contentChildren, props: {}, style: { display: "flex", flexDirection: "column", gap: { desktop: 22, tablet: 18, mobile: 16 } } }),
    text(context, contentId, "eyebrow"), heading(context, contentId), text(context, contentId),
    seed(context, { id: actionsId, type: "container", name: "Actions", parentId: contentId, children: actions, props: {}, style: { display: "flex", flexDirection: { desktop: "row", tablet: "row", mobile: "column" } as never, gap: 12 } }),
    button(context, actionsId), ...(kind === "hero" ? [button(context, actionsId, "secondary_cta")] : []),
    seed(context, { id: mediaId, type: "column", name: kind === "contact" ? "Contact details" : "Editorial media", parentId: id(context, "container"), children: kind === "contact" ? [id(context, "text.contact_details"), id(context, "button.submit_cta")] : [id(context, "image.image")], props: {}, style: { display: "flex", flexDirection: "column", gap: 18 } }),
    ...(kind === "contact" ? [text(context, mediaId, "contact_details"), button(context, mediaId, "submit_cta")] : [image(context, mediaId, "image", kind === "hero" ? "4 / 5" : "3 / 4")]),
  ];
}

function gridRecipe(context: RecipeContext, kind: SemanticRecipeName, count: number, withImages: boolean) {
  const introId = id(context, "column.intro");
  const gridId = id(context, "container.items");
  const itemIds = Array.from({ length: count }, (_, index) => id(context, `column.item_${index + 1}`));
  const nodes: WidgetBlueprintSeed[] = [
    ...sectionShell(context, [introId, gridId], { display: "flex", flexDirection: "column", gap: { desktop: 48, tablet: 36, mobile: 28 } }),
    seed(context, { id: introId, type: "column", name: `${kind} introduction`, parentId: id(context, "container"), children: [id(context, "heading.headline"), id(context, "text.description")], props: {}, style: { display: "flex", flexDirection: "column", gap: 16, maxWidth: kind === "stats" ? 760 : 680 } }),
    heading(context, introId), text(context, introId),
    seed(context, { id: gridId, type: "container", name: `${kind} grid`, parentId: id(context, "container"), children: itemIds, props: { repeatable: true }, style: { display: "grid", gridTemplateColumns: { desktop: `repeat(${Math.min(count, kind === "pricing" ? 3 : 4)}, minmax(0, 1fr))`, tablet: "repeat(2, minmax(0, 1fr))", mobile: "1fr" }, gap: { desktop: 24, tablet: 20, mobile: 16 } } }),
  ];
  itemIds.forEach((itemId, index) => {
    const role = `item_${index + 1}`;
    const children = [...(withImages ? [id(context, `image.${role}`)] : []), id(context, `heading.${role}_title`), id(context, `text.${role}_description`), ...(kind === "pricing" || kind === "services" || kind === "portfolio" ? [id(context, `button.${role}_cta`)] : [])];
    nodes.push(seed(context, { id: itemId, type: "column", name: `${kind} item ${index + 1}`, parentId: gridId, children, props: { repeatableItem: true }, style: { display: "flex", flexDirection: "column", gap: 14, padding: kind === "gallery" ? 0 : { desktop: 24, tablet: 20, mobile: 18 }, borderRadius: token(context, "radius", ["card", "lg"], 16), border: `1px solid ${String(token(context, "color", ["border"], "#e5e7eb"))}` } }));
    if (withImages) nodes.push(image(context, itemId, role, index % 3 === 0 ? "4 / 5" : "16 / 10"));
    nodes.push(heading(context, itemId, `${role}_title`, "h3"), text(context, itemId, `${role}_description`));
    if (children.some((child) => child.includes("button."))) nodes.push(button(context, itemId, `${role}_cta`));
  });
  return nodes;
}

function timelineOrFaq(context: RecipeContext, kind: "timeline" | "faq") {
  return gridRecipe(context, kind, kind === "faq" ? 5 : 4, false);
}

function ctaRecipe(context: RecipeContext) {
  const contentId = id(context, "column.content");
  return [
    ...sectionShell(context, [contentId], { display: "flex", justifyContent: "center", textAlign: "center", backgroundColor: String(token(context, "color", ["primary", "accent"], "#172554")), borderRadius: token(context, "radius", ["card", "lg"], 20), padding: { desktop: 72, tablet: 52, mobile: 32 } }),
    seed(context, { id: contentId, type: "column", name: "CTA content", parentId: id(context, "container"), children: [id(context, "heading.headline"), id(context, "text.description"), id(context, "button.primary_cta")], props: {}, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 18, maxWidth: 760 } }),
    heading(context, contentId), text(context, contentId), button(context, contentId),
  ];
}

function footerRecipe(context: RecipeContext) {
  const columns = Array.from({ length: 4 }, (_, index) => id(context, `column.footer_${index + 1}`));
  const nodes: WidgetBlueprintSeed[] = [...sectionShell(context, columns, { display: "grid", gridTemplateColumns: { desktop: "1.4fr repeat(3, 1fr)", tablet: "repeat(2, 1fr)", mobile: "1fr" }, gap: 28 })];
  columns.forEach((columnId, index) => {
    nodes.push(seed(context, { id: columnId, type: "column", name: `Footer group ${index + 1}`, parentId: id(context, "container"), children: [id(context, `heading.footer_${index + 1}`), id(context, `text.footer_${index + 1}`)], props: {}, style: { display: "flex", flexDirection: "column", gap: 12 } }), heading(context, columnId, `footer_${index + 1}`, "h3"), text(context, columnId, `footer_${index + 1}`));
  });
  return nodes;
}

export function createSemanticRecipe(name: SemanticRecipeName) {
  return (context: RecipeContext): WidgetBlueprintSeed[] => {
    if (name === "hero" || name === "about" || name === "contact") return editorialSplit(context, name);
    if (name === "cta") return ctaRecipe(context);
    if (name === "footer") return footerRecipe(context);
    if (name === "timeline" || name === "faq") return timelineOrFaq(context, name);
    const count = name === "gallery" ? 6 : name === "stats" ? 4 : name === "pricing" ? 3 : name === "comparison" ? 3 : 4;
    return gridRecipe(context, name, count, ["gallery", "portfolio", "services", "testimonials"].includes(name));
  };
}
