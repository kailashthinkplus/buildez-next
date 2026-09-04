import type { BuilderStyle } from "../../../../types/blueprint";
import type { WidgetBlueprintSeed } from "../../widgetBlueprint";
import type { RecipeContext } from "../../recipes";

export function galleryId(context: RecipeContext, role: string) {
  return `${role}.${context.key}`;
}

export function gallerySemantic(field: string) {
  return `{{gallery.${field}}}`;
}

export function gallerySeed(context: RecipeContext, value: Omit<WidgetBlueprintSeed, "sourceSectionId" | "sourceComponentVariantId" | "sourcePatternId" | "sectionRole">): WidgetBlueprintSeed {
  return Object.freeze({ ...value, sourceSectionId: context.section.id, sourceComponentVariantId: context.section.componentVariantId, sourcePatternId: context.section.patternIds[0], sectionRole: context.section.type });
}

export function gallerySpacing(context: RecipeContext) {
  const base = context.input.designResult?.spacingProfile.sectionY ?? 72;
  const breathing = context.input.compositionResult?.visualBreathing.level;
  const weight = context.input.compositionResult?.sectionWeights.find((item) => item.sectionId === context.section.id)?.weight;
  return Math.round(base * (breathing === "airy" ? 1.12 : breathing === "compact" ? .84 : 1) * (weight === "heavy" ? 1.06 : weight === "light" ? .9 : 1));
}

export function galleryGutter(context: RecipeContext) {
  return context.input.designResult?.spacingProfile.gutter ?? 24;
}

export function galleryIntent(context: RecipeContext) {
  return {
    pageRhythm: context.input.compositionResult?.pageRhythm.rhythm ?? "direct",
    visualBreathing: context.input.compositionResult?.visualBreathing.level ?? "balanced",
    mediaContentAlternation: context.input.compositionResult?.compositionPlan?.mediaContentAlternation.pattern ?? "media-led",
    responsiveProfile: context.input.designResult?.responsiveProfile ?? {},
    mediaReadiness: context.input.mediaStrategy?.assetReadiness.score ?? 0,
    mediaSubstitution: context.input.mediaStrategy?.substitutionPolicy.defaultAction ?? "neutral_placeholder",
  };
}

export function galleryColumn(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return gallerySeed(context, { id: galleryId(context, role), type: "column", name: role, parentId, children, props: { semanticRole: role }, style: { display: "flex", flexDirection: "column", ...style } });
}

export function galleryContainer(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return gallerySeed(context, { id: galleryId(context, role), type: "container", name: role, parentId, children, props: { semanticRole: role }, style });
}

export function galleryHeading(context: RecipeContext, parentId: string) {
  return gallerySeed(context, { id: galleryId(context, "heading.headline"), type: "heading", name: "gallery headline", parentId, children: [], props: { text: gallerySemantic("headline"), level: "h2" }, style: { color: context.input.designResult?.colorProfile.foreground ?? "#111827", fontFamily: context.input.designResult?.typographyProfile.headingFamily ?? "Inter", fontSize: { desktop: 44, tablet: 36, mobile: 30 }, lineHeight: 1.1 } });
}

export function galleryText(context: RecipeContext, parentId: string, role: string, size = 16) {
  return gallerySeed(context, { id: galleryId(context, `text.${role}`), type: "text", name: role, parentId, children: [], props: { text: gallerySemantic(role) }, style: { color: context.input.designResult?.colorProfile.foreground ?? "#374151", fontFamily: context.input.designResult?.typographyProfile.bodyFamily ?? "Inter", fontSize: { desktop: size, tablet: size, mobile: Math.min(size, 15) }, lineHeight: 1.55 } });
}

export function galleryImage(context: RecipeContext, parentId: string, role: string, aspectRatio: string) {
  return gallerySeed(context, { id: galleryId(context, `image.${role}`), type: "image", name: role, parentId, children: [], props: { src: gallerySemantic(role), alt: gallerySemantic(`${role}.alt`), aiImagePrompt: gallerySemantic(`${role}.prompt`) }, style: { width: "100%", aspectRatio, objectFit: "cover", borderRadius: context.input.designResult?.themeProfile.radius ?? 16 } });
}
