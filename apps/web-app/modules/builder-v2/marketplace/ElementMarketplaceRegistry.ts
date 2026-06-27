import type { ElementCatalogItem } from "./types";
import { firstPartyElements } from "./firstPartyElements";

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
  ElementMarketplaceRegistry.register(element);
}
