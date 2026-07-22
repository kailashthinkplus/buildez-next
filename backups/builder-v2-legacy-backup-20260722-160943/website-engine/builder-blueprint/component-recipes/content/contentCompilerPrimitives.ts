import type { BuilderStyle } from "../../../../types/blueprint";
import type { RecipeContext } from "../../recipes";
import type { WidgetBlueprintSeed } from "../../widgetBlueprint";

export type ContentDensity = Readonly<{ itemCount: number; densityLevel: "sparse" | "balanced" | "dense"; recommendedLayout: "editorial-feature" | "balanced-matrix" | "grouped-catalogue" }>;
export type ContentMediaMode = "none" | "single" | "multiple";
export type ContentCtaPlacement = "intro" | "after-content";

function normalized(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ""); }

export function resolveContentDensity(context: RecipeContext, semanticFields: readonly string[], fallbackCount: number): ContentDensity {
  const facts = context.input.websiteSpec?.business.knownFacts ?? {};
  const fieldKeys = new Set(semanticFields.map(normalized));
  const factCounts = Object.entries(facts).filter(([key]) => fieldKeys.has(normalized(key))).map(([, value]) => Array.isArray(value) ? value.length : 0);
  const offerings = context.input.websiteSpec?.business.offerings?.length ?? 0;
  const evidencedCount = Math.max(offerings, ...factCounts);
  const itemCount = evidencedCount > 0 ? evidencedCount : fallbackCount;
  return Object.freeze(itemCount <= 3
    ? { itemCount, densityLevel: "sparse", recommendedLayout: "editorial-feature" }
    : itemCount <= 8
      ? { itemCount, densityLevel: "balanced", recommendedLayout: "balanced-matrix" }
      : { itemCount, densityLevel: "dense", recommendedLayout: "grouped-catalogue" });
}

export function resolveContentMediaMode(context: RecipeContext): ContentMediaMode {
  const known = context.input.knownAssets?.length ?? 0;
  const availableRequirements = context.input.mediaStrategy?.assetRequirements.filter((item) => item.kind === "image" && !item.missing).length ?? 0;
  const count = Math.max(known, availableRequirements);
  return count === 0 ? "none" : count === 1 ? "single" : "multiple";
}

export function resolveContentCtaPlacement(context: RecipeContext): ContentCtaPlacement {
  if (context.input.compositionResult?.ctaCadence?.earlyCta) return "intro";
  const goals = [context.input.websiteSpec?.goals.primaryGoal, ...(context.input.websiteSpec?.goals.conversionGoals ?? []), context.section.purpose].filter(Boolean).join(" ");
  return goals.trim() && context.section.order === 0 && !context.input.websiteSpec?.goals.conversionGoals?.length ? "intro" : "after-content";
}

export function contentId(context: RecipeContext, role: string) { return `${role}.${context.key}`; }
export function contentSemantic(namespace: string, role: string) { return `{{${namespace}.${role}}}`; }

export function contentSeed(context: RecipeContext, value: Omit<WidgetBlueprintSeed, "sourceSectionId" | "sourceComponentVariantId" | "sourcePatternId" | "sectionRole">): WidgetBlueprintSeed {
  const props = value.type === "container" ? { ...value.props, layout: value.style?.display ?? value.props?.layout ?? "flex" } : value.props;
  return Object.freeze({ ...value, props, sourceSectionId: context.section.id, sourceComponentVariantId: context.section.componentVariantId, sourcePatternId: context.section.patternIds[0], sectionRole: context.section.type });
}

export function contentIntent(context: RecipeContext, decisions?: { density?: ContentDensity; mediaMode?: ContentMediaMode; ctaPlacement?: ContentCtaPlacement }) {
  const selection = context.input.componentResult?.recommendedSelections.find((item) => item.variant.id === context.section.componentVariantId);
  return {
    pageRhythm: context.input.compositionResult?.pageRhythm.rhythm ?? "direct",
    visualBreathing: context.input.compositionResult?.visualBreathing.level ?? "balanced",
    sectionWeight: context.input.compositionResult?.sectionWeights.find((item) => item.sectionId === context.section.id)?.weight ?? "medium",
    mediaContentAlternation: context.input.compositionResult?.compositionPlan?.mediaContentAlternation.pattern ?? "content-led",
    densityTransition: context.input.compositionResult?.densityTransitions.find((item) => item.fromSectionId === context.section.id || item.toSectionId === context.section.id)?.transition ?? "steady",
    mobileStackingNotes: context.input.compositionResult?.mobileStacking.notes ?? [],
    editableFields: selection?.editableMappingIntent?.editableFields ?? selection?.variant.editableMappingIntent?.editableFields ?? [],
    requiredFacts: selection?.requirements?.requiredFacts ?? selection?.variant.requiredFacts ?? [],
    requiredAssets: selection?.requirements?.requiredAssets ?? selection?.variant.requiredAssets ?? [],
    patternIds: context.section.patternIds,
    ...(decisions?.density ? { contentDensity: decisions.density } : {}),
    ...(decisions?.mediaMode ? { mediaMode: decisions.mediaMode } : {}),
    ...(decisions?.ctaPlacement ? { ctaPlacement: decisions.ctaPlacement } : {}),
  };
}

export function contentSpacing(context: RecipeContext) {
  const base = context.input.designResult?.spacingProfile.sectionY ?? 72;
  const breathing = context.input.compositionResult?.visualBreathing.level;
  const weight = context.input.compositionResult?.sectionWeights.find((item) => item.sectionId === context.section.id)?.weight;
  return Math.round(base * (breathing === "airy" ? 1.1 : breathing === "compact" ? .84 : 1) * (weight === "heavy" ? 1.06 : weight === "light" ? .9 : 1));
}

export function contentGutter(context: RecipeContext) { return context.input.designResult?.spacingProfile.gutter ?? 24; }
export function surface(context: RecipeContext) { return context.input.designResult?.colorProfile.background ?? "#ffffff"; }
export function foreground(context: RecipeContext) { return context.input.designResult?.colorProfile.foreground ?? "#111827"; }
export function secondaryForeground(context: RecipeContext) { return String(context.input.designResult?.designTokens.color.textSecondary ?? context.input.designResult?.designTokens.color.mutedForeground ?? context.input.designResult?.colorProfile.foreground ?? "#4b5563"); }
export function accent(context: RecipeContext) { return context.input.designResult?.colorProfile.accent ?? "#1d4ed8"; }
export function mutedSurface(context: RecipeContext) { return context.input.designResult?.colorProfile.muted ?? "#f3f4f6"; }

export function contentColumn(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return contentSeed(context, { id: contentId(context, role), type: "column", name: role, parentId, children, props: { semanticRole: role }, style: { display: "flex", flexDirection: "column", ...style } });
}

export function contentContainer(context: RecipeContext, role: string, parentId: string, children: string[], style: BuilderStyle = {}) {
  return contentSeed(context, { id: contentId(context, role), type: "container", name: role, parentId, children, props: { semanticRole: role, layout: style.display ?? "flex" }, style });
}

export function contentHeading(context: RecipeContext, namespace: string, parentId: string, role: string, level: "h2" | "h3" | "h4" = "h3") {
  const section = level === "h2";
  return contentSeed(context, { id: contentId(context, `heading.${role}`), type: "heading", name: role, parentId, children: [], props: { text: contentSemantic(namespace, role), level }, style: { color: foreground(context), fontFamily: context.input.designResult?.typographyProfile.headingFamily ?? "Inter", fontSize: section ? { desktop: 44, tablet: 36, mobile: 30 } : level === "h3" ? { desktop: 24, tablet: 22, mobile: 20 } : { desktop: 19, tablet: 18, mobile: 18 }, lineHeight: section ? 1.1 : 1.25 } });
}

export function contentText(context: RecipeContext, namespace: string, parentId: string, role: string, typography: "body" | "eyebrow" | "microcopy" = "body") {
  const size = typography === "eyebrow" ? 13 : typography === "microcopy" ? 13 : 16;
  return contentSeed(context, { id: contentId(context, `text.${role}`), type: "text", name: role, parentId, children: [], props: { text: contentSemantic(namespace, role) }, style: { color: typography === "body" ? secondaryForeground(context) : foreground(context), fontFamily: context.input.designResult?.typographyProfile.bodyFamily ?? "Inter", fontSize: { desktop: size, tablet: size, mobile: size }, fontWeight: typography === "eyebrow" ? 600 : 400, lineHeight: typography === "microcopy" ? 1.45 : 1.6, letterSpacing: typography === "eyebrow" ? .4 : 0 } });
}

export function contentButton(context: RecipeContext, namespace: string, parentId: string, role: string) {
  return contentSeed(context, { id: contentId(context, `button.${role}`), type: "button", name: role, parentId, children: [], props: { text: contentSemantic(namespace, role), url: contentSemantic(namespace, `${role}.url`) }, style: { backgroundColor: accent(context), color: "#ffffff", borderRadius: context.input.designResult?.themeProfile.radius ?? 10, padding: "13px 20px" } });
}

export function contentImage(context: RecipeContext, namespace: string, parentId: string, role: string, ratio: string) {
  return contentSeed(context, { id: contentId(context, `image.${role}`), type: "image", name: role, parentId, children: [], props: { src: contentSemantic(namespace, role), alt: contentSemantic(namespace, `${role}.alt`), aiImagePrompt: contentSemantic(namespace, `${role}.prompt`) }, style: { width: "100%", aspectRatio: ratio, objectFit: "cover", borderRadius: context.input.designResult?.themeProfile.radius ?? 14 } });
}

export function finalizeContentCompilation(nodes: WidgetBlueprintSeed[]): WidgetBlueprintSeed[] {
  const headings = nodes.filter((node) => node.type === "heading");
  const h1Count = headings.filter((node) => node.props?.level === "h1").length;
  const sectionHeadingCount = headings.filter((node) => node.props?.level === "h2").length;
  const invalidItem = headings.some((node) => node.props?.level !== "h2" && !["h3", "h4"].includes(String(node.props?.level)));
  if (h1Count || sectionHeadingCount !== 1 || invalidItem) throw new Error("CONTENT_COMPILER_HEADING_HIERARCHY_INVALID");
  return nodes;
}
