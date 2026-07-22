import type { BuilderTheme } from "../../types/blueprint";
import { createBuilderTheme } from "../../theme/defaultTheme";
import type { BuilderBlueprintInput } from "./builderBlueprint";
import type { WidgetBlueprintSeed } from "./widgetBlueprint";
import { RecipeRegistry, type SemanticSection } from "./recipes";
import { ComponentVariantCompilerRegistry } from "./component-recipes";
import { CompositionQualityEngine, type CompositionQualityScore } from "../composition-quality";
import { DesignIntelligenceCompiler, type DesignExecutionPlan } from "../design-intelligence";
import { CreativeDirectorCompiler, type CreativeDirectionPlan } from "../creative-director";
import { LayoutArchetypeRegistry, type LayoutArchetypeId } from "../layout-archetypes";
import { compileNativeVisualCapability } from "./nativeVisualCapabilityCompiler";

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "section";
}

type SectionAssociationDiagnostic = Readonly<{ code: "MISSING_STABLE_SECTION_ASSOCIATION"; sectionId: string; message: string }>;

function orderedSections(input: BuilderBlueprintInput, diagnostics: SectionAssociationDiagnostic[]): SemanticSection[] {
  const composition = input.compositionResult?.orderedSectionSequence ?? [];
  if (composition.length) return composition.map((section, order) => {
    const spec = input.websiteSpec?.sections.find((candidate) => String(candidate.id) === section.id);
    const scopedSelection = input.componentResult?.sectionSelections?.find((candidate) => candidate.section.id === section.id);
    const selection = scopedSelection?.selection ?? input.componentResult?.recommendedSelections.find((candidate) => candidate.variant.id === section.componentId);
    if (input.websiteSpec?.sections.length && !spec) diagnostics.push(Object.freeze({ code: "MISSING_STABLE_SECTION_ASSOCIATION", sectionId: section.id, message: `No WebsiteSpec section matches stable composition section ${section.id}; component ID fallback is forbidden.` }));
    return {
      id: section.id,
      type: spec?.type ?? section.category,
      purpose: spec?.purpose ?? section.purpose,
      componentVariantId: selection?.variant.id ?? section.componentId ?? spec?.componentVariantRef,
      componentCategory: selection?.variant.category ?? section.category,
      layoutArchetypeId: scopedSelection?.layoutArchetypeId,
      forceLegacyRecipe: scopedSelection?.forceLegacyRecipe,
      nativeCapability: scopedSelection?.selectedCapability,
      containerMode: scopedSelection?.containerMode,
      patternIds: [...(spec?.patternRefs ?? []), ...(scopedSelection?.section.patternId ? [scopedSelection.section.patternId] : []), ...(selection?.variant.patternIds ?? [])].filter((value, index, values) => values.indexOf(value) === index),
      order,
    };
  });

  if (input.websiteSpec?.sections.length) return input.websiteSpec.sections.map((section, order) => {
    const scopedSelection = input.componentResult?.sectionSelections?.find((candidate) => candidate.section.id === String(section.id));
    const selection = scopedSelection?.selection ?? input.componentResult?.recommendedSelections.find((candidate) => candidate.variant.id === section.componentVariantRef) ?? input.componentResult?.recommendedSelections[order];
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
  selectedArchetypes: Array<{ sectionId: string; archetype: LayoutArchetypeId }>;
  compositionQuality: CompositionQualityScore;
  designExecutionPlan: DesignExecutionPlan;
  creativeDirectionPlan: CreativeDirectionPlan;
  associationDiagnostics: readonly SectionAssociationDiagnostic[];
}>;

export function compileSemanticBlueprint(input: BuilderBlueprintInput): SemanticBlueprintCompilation {
  const associationDiagnostics: SectionAssociationDiagnostic[] = [];
  const sections = orderedSections(input, associationDiagnostics);
  const compiledCreativeDirection = CreativeDirectorCompiler.compile(input);
  const creativeDirectionPlan = input.artDirectionBrief
    ? Object.freeze({ ...compiledCreativeDirection, artDirectionBrief: input.artDirectionBrief })
    : compiledCreativeDirection;
  const compositionQuality = CompositionQualityEngine.evaluate({
    sections: sections.map((section) => ({
      id: section.id,
      componentVariantId: section.componentVariantId,
      category: section.componentCategory ?? section.type,
      purpose: section.purpose,
    })),
    businessFamily: input.websiteSpec?.business.family,
    archetype: input.websiteSpec?.archetype,
    conversionGoal: input.websiteSpec?.goals.primaryGoal,
    selectedComponents: input.componentResult?.recommendedSelections.map((selection) => selection.variant.id),
    designIntent: input.designResult,
  });
  const designExecutionPlan = DesignIntelligenceCompiler.compile({
    designResult: input.designResult,
    businessFamily: input.websiteSpec?.business.family,
    archetype: input.websiteSpec?.archetype,
    compositionResult: input.compositionResult,
    componentResult: input.componentResult,
    selectedComponents: input.componentResult?.recommendedSelections.map((selection) => selection.variant.id),
  });
  const sectionNodeIds = sections.map((section, index) => `section.${safeId(section.id || `section_${index}`)}`);
  const page: WidgetBlueprintSeed = Object.freeze({
    id: "page.root", type: "page", name: "Page", parentId: null, children: sectionNodeIds,
    props: { title: input.websiteSpec?.business.businessName ?? "{{website.name}}", semanticCompiler: true }, style: {},
  });
  const selectedRecipes: Array<{ sectionId: string; recipe: string }> = [];
  const selectedArchetypes: Array<{ sectionId: string; archetype: LayoutArchetypeId }> = [];
  const seeds: WidgetBlueprintSeed[] = [page];
  sections.forEach((section, index) => {
    const context = { input, section, sectionNodeId: sectionNodeIds[index], key: safeId(section.id || `section_${index}`) };
    if (section.nativeCapability && section.containerMode) {
      const nativeSeeds = compileNativeVisualCapability(context, section.nativeCapability, section.containerMode);
      if (nativeSeeds) {
        selectedRecipes.push({ sectionId: section.id, recipe: `native:${section.nativeCapability}` });
        seeds.push(...nativeSeeds);
        return;
      }
    }
    const selectedCompiler = ComponentVariantCompilerRegistry.resolve(section);
    if (selectedCompiler) {
      selectedRecipes.push({ sectionId: section.id, recipe: selectedCompiler.name });
      seeds.push(...selectedCompiler.compiler.compile(context));
      return;
    }
    const selectedArchetype = section.forceLegacyRecipe ? undefined : section.layoutArchetypeId ? LayoutArchetypeRegistry.get(section.layoutArchetypeId) : LayoutArchetypeRegistry.resolve(section, input.artDirectionBrief, input.websiteSpec?.business.family);
    if (selectedArchetype) {
      selectedRecipes.push({ sectionId: section.id, recipe: `archetype:${selectedArchetype.id}` });
      selectedArchetypes.push({ sectionId: section.id, archetype: selectedArchetype.id });
      seeds.push(...selectedArchetype.compile(context));
      return;
    }
    const selectedRecipe = RecipeRegistry.resolve(section);
    selectedRecipes.push({ sectionId: section.id, recipe: selectedRecipe.name });
    seeds.push(...selectedRecipe.recipe(context));
  });
  return Object.freeze({ seeds, sections, selectedRecipes, selectedArchetypes, compositionQuality, designExecutionPlan, creativeDirectionPlan, associationDiagnostics: Object.freeze(associationDiagnostics) });
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
