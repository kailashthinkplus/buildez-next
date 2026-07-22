import type { BuilderStyle } from "../../types/blueprint";
import type { RecipeContext } from "../builder-blueprint/recipes";
import type { WidgetBlueprintSeed } from "../builder-blueprint/widgetBlueprint";

export function archetypeId(context: RecipeContext, role: string) { return `${role}.${context.key}`; }
function namespace(context: RecipeContext) { return context.section.type.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "section"; }
function semantic(context: RecipeContext, role: string) { return `{{${namespace(context)}.${role}}}`; }

export function archetypeSeed(context: RecipeContext, value: Omit<WidgetBlueprintSeed, "sourceSectionId" | "sourceComponentVariantId" | "sourcePatternId" | "sectionRole">): WidgetBlueprintSeed {
  return Object.freeze({ ...value, sourceSectionId: context.section.id, sourceComponentVariantId: context.section.componentVariantId, sourcePatternId: context.section.patternIds[0], sectionRole: context.section.type });
}

function color(context: RecipeContext, kind: "background" | "foreground" | "accent" | "muted") {
  const profile = context.input.designResult?.colorProfile;
  return kind === "background" ? profile?.background ?? "#ffffff" : kind === "foreground" ? profile?.foreground ?? "#111827" : kind === "accent" ? profile?.accent ?? "#315b52" : profile?.muted ?? "#f3f1ec";
}

function radius(context: RecipeContext) {
  const treatment = context.input.artDirectionBrief?.blueprintStrategy.cornerTreatment;
  return treatment === "square" ? 0 : treatment === "rounded" ? 28 : context.input.designResult?.themeProfile.radius ?? 16;
}

export function sectionFrame(context: RecipeContext, children: string[], options: { dark?: boolean; fullBleed?: boolean; framed?: boolean } = {}) {
  const container = archetypeId(context, "container.archetype");
  const base = context.input.designResult?.spacingProfile.sectionY ?? 88;
  const density = context.input.artDirectionBrief?.compositionStrategy.densityPattern[context.section.order % Math.max(1, context.input.artDirectionBrief.compositionStrategy.densityPattern.length)];
  const spacing = Math.round(base * (density === "open" ? 1.22 : density === "dense" ? .82 : 1));
  return [
    archetypeSeed(context, { id: context.sectionNodeId, type: "section", name: `${context.section.type} premium archetype`, parentId: "page.root", children: [container], props: { role: context.section.type, purpose: context.section.purpose, layoutArchetype: true }, style: { position: "relative", overflow: "hidden", paddingTop: { desktop: spacing, tablet: Math.round(spacing * .76), mobile: Math.round(spacing * .55) }, paddingBottom: { desktop: spacing, tablet: Math.round(spacing * .76), mobile: Math.round(spacing * .55) }, backgroundColor: options.dark ? color(context, "foreground") : color(context, "background"), color: options.dark ? color(context, "background") : color(context, "foreground") } }),
  ];
}

export function column(context: RecipeContext, role: string, parent: string, children: string[], style: BuilderStyle = {}) {
  return archetypeSeed(context, { id: archetypeId(context, role), type: "column", name: role, parentId: parent, children, props: { semanticRole: role }, style: { display: "flex", flexDirection: "column", ...style } });
}
export function container(context: RecipeContext, role: string, parent: string, children: string[], style: BuilderStyle = {}) {
  return archetypeSeed(context, { id: archetypeId(context, role), type: "container", name: role, parentId: parent, children, props: { semanticRole: role }, style });
}
export function heading(context: RecipeContext, parent: string, role = "headline", level: "h1" | "h2" | "h3" = "h2", size = 48) {
  const scale = context.input.artDirectionBrief?.blueprintStrategy.headingScale;
  const directed = scale === "dramatic" ? Math.round(size * 1.18) : scale === "restrained" ? Math.round(size * .9) : size;
  return archetypeSeed(context, { id: archetypeId(context, `heading.${role}`), type: "heading", name: role, parentId: parent, children: [], props: { text: semantic(context, role), level }, style: { fontFamily: context.input.designResult?.typographyProfile.headingFamily ?? "Inter", fontSize: { desktop: directed, tablet: Math.round(directed * .76), mobile: Math.max(28, Math.round(directed * .58)) }, lineHeight: scale === "dramatic" ? 1 : 1.08, color: "inherit", maxWidth: "18ch" } });
}
export function text(context: RecipeContext, parent: string, role: string, size = 17) {
  return archetypeSeed(context, { id: archetypeId(context, `text.${role}`), type: "text", name: role, parentId: parent, children: [], props: { text: semantic(context, role) }, style: { fontFamily: context.input.designResult?.typographyProfile.bodyFamily ?? "Inter", fontSize: { desktop: size, tablet: size, mobile: Math.min(16, size) }, lineHeight: 1.65, color: "inherit", maxWidth: "62ch" } });
}
export function button(context: RecipeContext, parent: string, role = "primary_cta", secondary = false) {
  return archetypeSeed(context, { id: archetypeId(context, `button.${role}`), type: "button", name: role, parentId: parent, children: [], props: { text: semantic(context, role), url: semantic(context, `${role}.url`) }, style: { backgroundColor: secondary ? "transparent" : color(context, "accent"), color: secondary ? color(context, "accent") : "#ffffff", border: secondary ? `1px solid ${color(context, "accent")}` : "none", borderRadius: radius(context), padding: "14px 22px" } });
}
export function image(context: RecipeContext, parent: string, role: string, aspectRatio = "4 / 5") {
  return archetypeSeed(context, { id: archetypeId(context, `image.${role}`), type: "image", name: role, parentId: parent, children: [], props: { src: semantic(context, role), alt: semantic(context, `${role}.alt`), aiImagePrompt: semantic(context, `${role}.prompt`) }, style: { width: "100%", aspectRatio, objectFit: "cover", borderRadius: radius(context) } });
}
export function divider(context: RecipeContext, parent: string, role = "divider") {
  return archetypeSeed(context, { id: archetypeId(context, role), type: "divider", name: role, parentId: parent, children: [], props: {}, style: { width: "100%", height: 1, backgroundColor: color(context, "accent"), opacity: .35 } });
}
