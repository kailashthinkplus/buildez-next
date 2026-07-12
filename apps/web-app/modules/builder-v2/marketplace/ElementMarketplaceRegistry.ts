import type { ElementCatalogItem } from "./types";
import { firstPartyElements } from "./firstPartyElements";
import { PremiumWidgetDefinitions } from "../widgets/premium";

class Registry {
  private readonly elements = new Map<string, ElementCatalogItem>();

  register(element: ElementCatalogItem) {
    if (this.elements.has(element.id)) {
      throw new Error(`[Builder] Element "${element.id}" already registered.`);
    }

    this.elements.set(element.id, Object.freeze(element));
  }

  get(elementId: string) {
    const element = this.elements.get(elementId);

    if (!element) {
      throw new Error(`[Builder] Element "${elementId}" is not registered.`);
    }

    return element;
  }

  getAll() {
    return [...this.elements.values()];
  }

  getAiComposableElements() {
    return this.getAll().filter((element) => element.ai.canGenerate);
  }

  clear() {
    this.elements.clear();
  }
}

export const ElementMarketplaceRegistry = new Registry();

for (const element of firstPartyElements) {
  ElementMarketplaceRegistry.register({
    ...element,
    launchStatus: "available",
  });
}

const registeredTypes = new Set(
  ElementMarketplaceRegistry.getAll().map((element) => element.type)
);

for (const definition of PremiumWidgetDefinitions) {
  if (registeredTypes.has(definition.type)) continue;

  const category = marketplaceCategory(definition.category);
  ElementMarketplaceRegistry.register({
    id: `premium.${category}.${definition.type}`,
    type: definition.type,
    name: definition.name,
    description:
      definition.aiPrompt ??
      `A production-ready ${definition.name.toLowerCase()} with editable content and theme-driven design.`,
    source: "marketplace",
    category,
    tier: "premium",
    requiredFeature:
      definition.category === "commerce" ? "commerce_widgets" : "premium_widgets",
    allowedPlans:
      definition.category === "commerce" ? ["business"] : ["pro", "business"],
    marketplaceCategory: definition.name,
    tags: [definition.type, definition.category, "responsive", "theme-ready"],
    industryTags: ["all"],
    styleTags: ["modern", "professional", "responsive"],
    aiUseCases: definition.aiPrompt ? [definition.aiPrompt] : [],
    ai: {
      canGenerate: true,
      guidance:
        definition.aiPrompt ??
        `Use ${definition.name} when it directly supports the page goal.`,
    },
    launchStatus: "available",
  });
}

function marketplaceCategory(
  category: (typeof PremiumWidgetDefinitions)[number]["category"]
): ElementCatalogItem["category"] {
  if (category === "layout") return "layout";
  if (category === "media") return "media";
  if (category === "commerce") return "commerce";
  if (category === "dynamic") return "data";
  if (category === "forms") return "conversion";
  if (category === "marketing") return "conversion";
  return "content";
}
