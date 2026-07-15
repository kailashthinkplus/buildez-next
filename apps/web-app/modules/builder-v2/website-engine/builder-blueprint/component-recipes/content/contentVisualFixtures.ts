import { buildBuilderBlueprint } from "../../BuilderBlueprintEngine";
import { applyCreativeEnrichment, type Enrichment } from "../../../../ai-v10/creative/runV10CreativeEnrichment";

export const CONTENT_VISUAL_VARIANTS = ["ServiceMatrixCards01", "ProductFeatureStack01", "MenuPreviewCards01", "CourseCataloguePreview01", "VehicleServiceMatrix01"] as const;
export type ContentVisualVariant = typeof CONTENT_VISUAL_VARIANTS[number];

const fixtureDetails: Record<ContentVisualVariant, { category: string; family: string; businessFamily: string; count: number; assets: string[] }> = {
  ServiceMatrixCards01: { category: "service", family: "service", businessFamily: "professional_services", count: 6, assets: [] },
  ProductFeatureStack01: { category: "product", family: "commerce", businessFamily: "technology_saas", count: 4, assets: ["product-stage"] },
  MenuPreviewCards01: { category: "menu", family: "content", businessFamily: "food_and_beverage", count: 6, assets: ["food-category-one", "food-category-two"] },
  CourseCataloguePreview01: { category: "catalogue", family: "content", businessFamily: "education", count: 6, assets: [] },
  VehicleServiceMatrix01: { category: "service", family: "service", businessFamily: "automotive", count: 8, assets: [] },
};

export function buildContentCompilerVisualFixture(variant: ContentVisualVariant) {
  const detail = fixtureDetails[variant];
  const section = { id: "content", componentId: variant, category: detail.category, family: detail.family, purpose: "Explore available options and choose a next step", requiredFacts: [], requiredAssets: detail.assets, orderHint: 0 };
  const input = {
    websiteSpec: { id: `visual.${variant}`, version: "1", business: { businessName: "RC-9D.1 Visual Fixture", family: detail.businessFamily, audience: [], offerings: Array.from({ length: detail.count }, (_, index) => `Offering ${index + 1}`), differentiators: [], proofPoints: [], knownFacts: {}, missingFacts: [] }, goals: { primaryGoal: "explore", secondaryGoals: [], conversionGoals: ["take the next step"] }, archetype: "catalogue", sections: [{ id: "content", type: detail.category, purpose: section.purpose, requiredContentFields: [], requiredAssetIds: detail.assets, editable: true, patternRefs: [`pattern.${detail.category}`], componentVariantRef: variant }], factsUsed: [], missingFacts: [], confidence: 1 },
    compositionResult: { orderedSectionSequence: [section], pageRhythm: { rhythm: "guided", notes: [] }, visualBreathing: { level: "airy", notes: [] }, sectionWeights: [{ sectionId: "content", weight: "heavy", reason: "visual fixture" }], mobileStacking: { order: ["content"], stickyActionRecommended: false, notes: ["preserve reading order"] }, densityTransitions: [], ctaCadence: { earlyCta: false, finalCta: true, repeatEverySections: 3, notes: [] }, compositionPlan: { mediaContentAlternation: { pattern: detail.assets.length ? "alternating" : "content-led", notes: [] } } },
    componentResult: { recommendedSelections: [{ variant: { id: variant, category: detail.category, family: detail.family, patternIds: [`pattern.${detail.category}`], label: variant, version: "1", metadata: {}, requiredFacts: [], requiredAssets: detail.assets, editableMappingIntent: { target: "native_builder_component_plan", editableFields: [], repeatableRegions: [], assetSlots: detail.assets, notes: [] } }, requirements: { componentId: variant, requiredFacts: [], requiredAssets: detail.assets, missingFacts: [], missingAssets: [] }, editableMappingIntent: { target: "native_builder_component_plan", editableFields: [], repeatableRegions: [], assetSlots: detail.assets, notes: [] }, rationale: [] }] },
    designResult: { id: "visual.design", designLanguage: { name: "Editorial" }, typographyProfile: { headingFamily: "Georgia", bodyFamily: "Arial" }, colorProfile: { background: "#fbfaf7", foreground: "#201f1d", accent: "#9a4f32", muted: "#eee8df" }, spacingProfile: { sectionY: 88, gutter: 28, gridGap: 22 }, layoutProfile: { maxWidth: "1200px" }, motionProfile: { level: "none", behavior: [] }, responsiveProfile: { mobile: ["stack"], tablet: ["adapt"], desktop: ["expand"] }, themeProfile: { radius: "14px", shadow: "none" }, designTokens: { id: "visual.tokens", color: { textSecondary: "#5f5b55", mutedForeground: "#6b665f" }, typography: {}, spacing: {}, radius: {}, shadow: {} } },
    knownAssets: detail.assets,
  } as never;
  const blueprint = buildBuilderBlueprint(input).nativeBlueprint;
  const enrichment: Enrichment = { nodes: {} };
  const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'%3E%3Crect width='1200' height='700' fill='%23ded6ca'/%3E%3Cpath d='M0 560L330 260l230 210 180-150 460 380H0z' fill='%23b9aa98'/%3E%3C/svg%3E";
  for (const node of Object.values(blueprint.nodes)) {
    if (!JSON.stringify(node.props).includes("{{")) continue;
    enrichment.nodes![node.id] = node.type === "image"
      ? { props: { src: "", alt: "Visual fixture media", aiImagePrompt: "Neutral editorial media fixture" } }
      : node.type === "button"
        ? { props: { text: "Explore options", url: "#next-step" } }
        : node.type === "heading"
          ? { props: { text: node.props.level === "h2" ? "A clearer way to explore your options" : "A considered choice" } }
          : { props: { text: "Concise supporting information that stays readable at every breakpoint." } };
  }
  const hydrated = applyCreativeEnrichment(blueprint, enrichment);
  return { ...hydrated, nodes: Object.fromEntries(Object.entries(hydrated.nodes).map(([id, node]) => [id, node.type === "image" ? { ...node, props: { ...node.props, src: image } } : node])) };
}
