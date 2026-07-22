import { createBuilderTheme, defaultThemePreset, mergeThemeTokens } from "../theme/defaultTheme";
import { SectionRegistry } from "./SectionRegistry";
import { createBlueprintFromSectionSpecs } from "./nodeSpec";
import { firstPartyTemplates } from "./templates/websiteTemplates";
import type {
  CreateTemplateBlueprintOptions,
  TemplateBlueprintResult,
  TemplateDefinition,
} from "./types";

class Registry {
  private readonly templates = new Map<string, TemplateDefinition>();

  register(template: TemplateDefinition) {
    if (this.templates.has(template.id)) {
      throw new Error(`[Builder] Template "${template.id}" already registered.`);
    }

    this.templates.set(template.id, Object.freeze(template));
  }

  get(templateId: string) {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`[Builder] Template "${templateId}" is not registered.`);
    }

    return template;
  }

  getAll() {
    return [...this.templates.values()];
  }

  createBlueprint(options: CreateTemplateBlueprintOptions): TemplateBlueprintResult {
    const template = this.get(options.templateId);
    const theme = {
      ...options.theme,
      tokens: mergeThemeTokens(
        options.theme.tokens as any,
        template.themePatch
      ),
    };

    const sections = template.sections.map((entry) =>
      SectionRegistry.get(entry.sectionId).create(entry.input)
    );

    return {
      template,
      blueprint: createBlueprintFromSectionSpecs({
        title: options.title ?? template.name,
        template,
        theme,
        sections,
      }),
    };
  }

  createDefaultBlueprint(title = "Untitled"): TemplateBlueprintResult {
    return this.createBlueprint({
      title,
      templateId: "service-business-home",
      theme: createBuilderTheme(defaultThemePreset),
    });
  }

  clear() {
    this.templates.clear();
  }
}

export const TemplateRegistry = new Registry();

for (const template of firstPartyTemplates) {
  TemplateRegistry.register(template);
}
