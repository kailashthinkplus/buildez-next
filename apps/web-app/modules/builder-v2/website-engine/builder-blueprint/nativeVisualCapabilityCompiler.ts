import type { BuilderStyle, NodeType } from "../../types/blueprint";
import { ProductionGenerationCapabilityCatalog } from "../native-visual-capabilities";
import type { ContainerMode } from "../components";
import type { RecipeContext } from "./recipes";
import type { WidgetBlueprintSeed } from "./widgetBlueprint";
import { compileWidgetPopulation, type WidgetPopulationContext } from "./widget-population";

const semantic = (context: RecipeContext, role: string) => `{{${context.section.type.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.${role}}}`;

function widthContract(mode: ContainerMode) {
  if (mode === "boxed") return { container: "boxed" as const };
  if (mode === "wide") return { container: "boxed" as const, maxWidth: 1280 };
  return { container: "full" as const };
}

function sectionStyle(context: RecipeContext, mode: ContainerMode): BuilderStyle {
  const base = context.input.designResult?.spacingProfile.sectionY ?? 88;
  const surface = context.input.designResult?.colorProfile.background ?? "#ffffff";
  const muted = context.input.designResult?.colorProfile.muted ?? surface;
  return {
    position: "relative",
    overflow: mode === "fullBleed" ? "hidden" : "visible",
    paddingTop: { desktop: base, tablet: Math.round(base * .72), mobile: Math.round(base * .5) },
    paddingBottom: { desktop: base, tablet: Math.round(base * .72), mobile: Math.round(base * .5) },
    backgroundColor: mode === "fullBleed" || mode === "breakout" ? muted : surface,
  };
}

export function compileNativeVisualCapability(context: RecipeContext, widgetType: NodeType, containerMode: ContainerMode): WidgetBlueprintSeed[] | undefined {
  const capability = ProductionGenerationCapabilityCatalog.get(widgetType);
  if (!capability) return undefined;
  const assets = context.input.knownAssets ?? [];
  const populationContext: WidgetPopulationContext = {
    sectionIntent: { id:context.section.id,purpose:context.section.purpose,type:context.section.type,patternIds:context.section.patternIds },
    narrativeRole: capability.semanticRoles[0] ?? context.section.type,
    conversionRole: /conversion|contact|lead|cta/.test(`${context.section.type} ${context.section.purpose}`.toLowerCase()) ? "conversion" : "none",
    selectedCapability:widgetType, selectedWidgetType:widgetType,
    knownFacts: { logoAssets:assets.filter((asset)=>/logo/i.test(asset)), whatsappDestination:undefined },
    missingFacts:(context.input.missingFacts ?? []).map((fact)=>typeof fact === "string" ? fact : JSON.stringify(fact)), availableAssets:assets,
    mediaStrategy:context.input.mediaStrategy, neighbouringSections:[], generationSeed:context.input.websiteSpec?.id ?? context.key,
    artDirectionBrief:context.input.artDirectionBrief,
  };
  const population = compileWidgetPopulation(populationContext);
  if (!population.ok || !population.props) return undefined;
  const widgetId = `native.${widgetType}.${context.key}`;
  const section = Object.freeze({
    id: context.sectionNodeId,
    type: "section" as const,
    name: `${context.section.type} native capability`,
    parentId: "page.root",
    children: [widgetId],
    props: {
      role: context.section.type,
      purpose: context.section.purpose,
      ...widthContract(containerMode),
      layoutIntent: { containerMode },
      nativeVisualCapability: widgetType,
    },
    style: sectionStyle(context, containerMode),
    sourceSectionId: context.section.id,
    sourceComponentVariantId: context.section.componentVariantId,
    sourcePatternId: context.section.patternIds[0],
    sectionRole: context.section.type,
  } satisfies WidgetBlueprintSeed);
  const widget = Object.freeze({
    id: widgetId,
    type: widgetType,
    name: capability.visualSilhouette,
    parentId: context.sectionNodeId,
    children: [],
    props: population.props,
    style: {
      width: "100%",
      maxWidth: "none",
      borderRadius: containerMode === "fullBleed" ? 0 : context.input.designResult?.themeProfile.radius ?? 16,
      padding: { desktop: containerMode === "fullBleed" ? 48 : 32, tablet: 28, mobile: 20 },
      gap: { desktop: 20, tablet: 18, mobile: 16 },
      backgroundColor: "theme.colors.surface",
      color: "theme.colors.textPrimary",
      mediaUrl: context.input.knownAssets?.[0] ?? "",
    },
    sourceSectionId: context.section.id,
    sourceComponentVariantId: context.section.componentVariantId,
    sourcePatternId: context.section.patternIds[0],
    sectionRole: context.section.type,
  } satisfies WidgetBlueprintSeed);
  return [section, widget];
}
