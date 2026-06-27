import type { SectionDefinition } from "./types";
import { firstPartySections } from "./sections/marketingSections";

class Registry {
  private readonly sections = new Map<string, SectionDefinition>();

  register(section: SectionDefinition) {
    if (this.sections.has(section.id)) {
      throw new Error(`[Builder] Section "${section.id}" already registered.`);
    }

    this.sections.set(section.id, Object.freeze(section));
  }

  get(sectionId: string) {
    const section = this.sections.get(sectionId);

    if (!section) {
      throw new Error(`[Builder] Section "${sectionId}" is not registered.`);
    }

    return section;
  }

  getAll() {
    return [...this.sections.values()];
  }

  clear() {
    this.sections.clear();
  }
}

export const SectionRegistry = new Registry();

for (const section of firstPartySections) {
  SectionRegistry.register(section);
}
