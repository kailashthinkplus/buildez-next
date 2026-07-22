import type { BuilderStyle } from "../../../../types/blueprint";
import type { WidgetBlueprintSeed } from "../../widgetBlueprint";
import type { RecipeContext } from "../../recipes";

type TokenGroup = "color" | "typography" | "spacing" | "radius";

export function token(context: RecipeContext, group: TokenGroup, keys: string[], fallback: string | number) {
  const values = context.input.designResult?.designTokens[group] ?? {};
  for (const key of keys) if (values[key] !== undefined) return values[key];
  return fallback;
}

export function nodeId(context: RecipeContext, role: string) {
  return `${role}.${context.key}`;
}

export function semantic(field: string) {
  return `{{hero.${field}}}`;
}

export function seed(context: RecipeContext, value: Omit<WidgetBlueprintSeed, "sourceSectionId" | "sourceComponentVariantId" | "sourcePatternId" | "sectionRole">): WidgetBlueprintSeed {
  return Object.freeze({
    ...value,
    sourceSectionId: context.section.id,
    sourceComponentVariantId: context.section.componentVariantId,
    sourcePatternId: context.section.patternIds[0],
    sectionRole: context.section.type,
  });
}

export function sectionSpacing(context: RecipeContext) {
  const base = Number(token(context, "spacing", ["sectionY", "section_y", "xl"], context.input.designResult?.spacingProfile.sectionY ?? 72));
  const breathing = context.input.compositionResult?.visualBreathing.level;
  const weight = context.input.compositionResult?.sectionWeights.find((item) => item.sectionId === context.section.id)?.weight;
  const factor = (breathing === "airy" ? 1.12 : breathing === "compact" ? .82 : 1) * (weight === "heavy" ? 1.08 : weight === "light" ? .9 : 1);
  return Math.round(base * factor);
}

export function gutter(context: RecipeContext) {
  return token(context, "spacing", ["containerX", "gutter", "md"], context.input.designResult?.spacingProfile.gutter ?? 24);
}

export function engineIntent(context: RecipeContext) {
  const composition = context.input.compositionResult;
  return {
    pageRhythm: composition?.pageRhythm.rhythm ?? "direct",
    visualBreathing: composition?.visualBreathing.level ?? "balanced",
    sectionWeight: composition?.sectionWeights.find((item) => item.sectionId === context.section.id)?.weight ?? "medium",
    mediaContentAlternation: composition?.compositionPlan?.mediaContentAlternation.pattern ?? "content-led",
    mobileStackingNotes: composition?.mobileStacking.notes ?? [],
  };
}

export function column(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return seed(context, { id: nodeId(context, role), type: "column", name: role, parentId, children, props: { semanticRole: role }, style: { display: "flex", flexDirection: "column", ...style } });
}

export function container(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return seed(context, { id: nodeId(context, role), type: "container", name: role, parentId, children, props: { semanticRole: role }, style });
}

export function heading(context: RecipeContext, parentId: string, role = "headline", level: "h1" | "h2" | "h3" = "h1", size = 60) {
  const scale = context.input.artDirectionBrief?.blueprintStrategy.headingScale;
  const directedSize = scale === "dramatic" ? Math.max(size, 80) : scale === "expressive" ? Math.max(size, 68) : scale === "restrained" ? Math.min(size, 56) : size;
  return seed(context, { id: nodeId(context, `heading.${role}`), type: "heading", name: role, parentId, children: [], props: { text: semantic(role), level }, style: { color: context.input.designResult?.colorProfile.foreground ?? "#111827", fontFamily: context.input.designResult?.typographyProfile.headingFamily ?? "Inter", fontSize: { desktop: directedSize, tablet: Math.round(directedSize * .76), mobile: Math.round(directedSize * .6) }, lineHeight: scale === "dramatic" ? 1 : 1.08 } });
}

export function text(context: RecipeContext, parentId: string, role: string, size = 17) {
  return seed(context, { id: nodeId(context, `text.${role}`), type: "text", name: role, parentId, children: [], props: { text: semantic(role) }, style: { color: context.input.designResult?.colorProfile.foreground ?? "#374151", fontFamily: context.input.designResult?.typographyProfile.bodyFamily ?? "Inter", fontSize: { desktop: size, tablet: size, mobile: Math.min(size, 16) }, lineHeight: 1.6 } });
}

export function button(context: RecipeContext, parentId: string, role: string, secondary = false) {
  const accent = context.input.designResult?.colorProfile.accent ?? "#1d4ed8";
  return seed(context, { id: nodeId(context, `button.${role}`), type: "button", name: role, parentId, children: [], props: { text: semantic(role), url: semantic(`${role}.url`) }, style: { backgroundColor: secondary ? "transparent" : accent, color: secondary ? accent : "#ffffff", border: secondary ? `1px solid ${accent}` : "none", borderRadius: token(context, "radius", ["button", "md"], context.input.designResult?.themeProfile.radius ?? 10), padding: "14px 22px" } });
}

export function image(context: RecipeContext, parentId: string, role: string, ratio: string, fit: "cover" | "contain" = "cover") {
  const corners = context.input.artDirectionBrief?.blueprintStrategy.cornerTreatment;
  const radius = corners === "square" ? 0 : corners === "rounded" ? 28 : token(context, "radius", ["media", "card"], context.input.designResult?.themeProfile.radius ?? 18);
  return seed(context, { id: nodeId(context, `image.${role}`), type: "image", name: role, parentId, children: [], props: { src: semantic(role), alt: semantic(`${role}.alt`) }, style: { width: "100%", aspectRatio: ratio, objectFit: fit, borderRadius: radius } });
}
