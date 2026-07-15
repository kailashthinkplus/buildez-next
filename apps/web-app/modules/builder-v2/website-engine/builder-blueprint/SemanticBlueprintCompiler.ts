import type { BuilderTheme } from "../../types/blueprint";
import { createBuilderTheme } from "../../theme/defaultTheme";
import type { BuilderBlueprintInput } from "./builderBlueprint";
import type { WidgetBlueprintSeed } from "./widgetBlueprint";
import { RecipeRegistry, type SemanticSection } from "./recipes";

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "section";
}

function orderedSections(input: BuilderBlueprintInput): SemanticSection[] {
  const composition = input.compositionResult?.orderedSectionSequence ?? [];
  if (composition.length) return composition.map((section, order) => {
    const spec = input.websiteSpec?.sections.find((candidate) => String(candidate.id) === section.id || candidate.componentVariantRef === section.componentId);
    const selection = input.componentResult?.recommendedSelections.find((candidate) => candidate.variant.id === section.componentId);
    return {
      id: section.id,
      type: spec?.type ?? section.category,
      purpose: spec?.purpose ?? section.purpose,
      componentVariantId: selection?.variant.id ?? section.componentId ?? spec?.componentVariantRef,
      componentCategory: selection?.variant.category ?? section.category,
      patternIds: [...(spec?.patternRefs ?? []), ...(selection?.variant.patternIds ?? []), ...(input.patternIntelligence?.selectedPatterns[order]?.patternId ? [input.patternIntelligence.selectedPatterns[order].patternId] : [])].filter((value, index, values) => values.indexOf(value) === index),
      order,
    };
  });

  if (input.websiteSpec?.sections.length) return input.websiteSpec.sections.map((section, order) => {
    const selection = input.componentResult?.recommendedSelections.find((candidate) => candidate.variant.id === section.componentVariantRef) ?? input.componentResult?.recommendedSelections[order];
    return {
      id: String(section.id), type: section.type, purpose: section.purpose,
      componentVariantId: section.componentVariantRef ?? selection?.variant.id,
      componentCategory: selection?.variant.category,
      patternIds: [...(section.patternRefs ?? []), ...(selection?.variant.patternIds ?? []), ...(input.patternIntelligence?.selectedPatterns[order]?.patternId ? [input.patternIntelligence.selectedPatterns[order].patternId] : [])],
      order,
    };
  });

  const legacy = input.compiledPlan?.sections ?? [];
  return legacy.map((section, order) => ({
    id: String(section.id), type: String(section.type), purpose: section.purpose,
    componentVariantId: section.componentVariantIds[0], patternIds: section.patternId ? [section.patternId] : [], order,
  }));
}

export type SemanticBlueprintCompilation = Readonly<{
  seeds: WidgetBlueprintSeed[];
  sections: SemanticSection[];
  selectedRecipes: Array<{ sectionId: string; recipe: string }>;
}>;

export function compileSemanticBlueprint(input: BuilderBlueprintInput): SemanticBlueprintCompilation {
  const sections = orderedSections(input);
  const sectionNodeIds = sections.map((section, index) => `section.${safeId(section.id || `section_${index}`)}`);
  const page: WidgetBlueprintSeed = Object.freeze({
    id: "page.root", type: "page", name: "Page", parentId: null, children: sectionNodeIds,
    props: { title: input.websiteSpec?.business.businessName ?? "{{website.name}}", semanticCompiler: true }, style: {},
  });
  const selectedRecipes: Array<{ sectionId: string; recipe: string }> = [];
  const seeds: WidgetBlueprintSeed[] = [page];
  sections.forEach((section, index) => {
    const selected = RecipeRegistry.resolve(section);
    selectedRecipes.push({ sectionId: section.id, recipe: selected.name });
    seeds.push(...selected.recipe({ input, section, sectionNodeId: sectionNodeIds[index], key: safeId(section.id || `section_${index}`) }));
  });
  return Object.freeze({ seeds, sections, selectedRecipes });
}

export function createSemanticBuilderTheme(input: BuilderBlueprintInput): BuilderTheme {
  const fallback = createBuilderTheme();
  const design = input.designResult;
  if (!design) return fallback;
  const base = fallback.tokens as Record<string, any>;
  const tokens = design.designTokens;
  return {
    id: String(tokens.id || design.id),
    name: design.designLanguage.name,
    preset: `website-engine.${safeId(design.designLanguage.name)}`,
    tokens: {
      ...base,
      colors: { ...(base.colors || {}), ...tokens.color, background: design.colorProfile.background, textPrimary: design.colorProfile.foreground, primary: design.colorProfile.accent, surfaceAlt: design.colorProfile.muted },
      typography: { ...(base.typography || {}), ...tokens.typography, headingFont: design.typographyProfile.headingFamily, bodyFont: design.typographyProfile.bodyFamily },
      spacing: { ...(base.spacing || {}), ...tokens.spacing, sectionY: design.spacingProfile.sectionY, containerX: design.spacingProfile.gutter, contentGap: design.spacingProfile.gridGap },
      radius: { ...(base.radius || {}), ...tokens.radius, card: design.themeProfile.radius, media: design.themeProfile.radius },
      shadow: { ...(base.shadow || {}), ...(tokens.shadow || {}), card: design.themeProfile.shadow, media: design.themeProfile.shadow },
      motion: { level: design.motionProfile.level, behavior: design.motionProfile.behavior },
      responsive: design.responsiveProfile,
    },
  };
}

export const SemanticBlueprintCompiler = Object.freeze({ compile: compileSemanticBlueprint, createTheme: createSemanticBuilderTheme });
