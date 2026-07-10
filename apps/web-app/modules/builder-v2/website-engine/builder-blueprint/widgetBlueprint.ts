import type { BuilderStyle } from "../../types/blueprint";
import type { BuilderBlueprintInput, BuilderPrimitiveType, WidgetBlueprint } from "./builderBlueprint";
import { buildAIWidgetMetadata } from "./aiWidgetMetadata";
import { buildInspectorBlueprint } from "./inspectorBlueprint";
import { buildMotionBindings } from "./motionBinding";
import { buildPropertyDefinitions } from "./propertyDefinition";
import { buildEditablePropertyBindings, buildPropertyBindings } from "./propertyBinding";
import { buildRegenerationMetadata } from "./regenerationMetadata";
import { buildResponsivePropertyBindings } from "./responsiveBinding";
import { buildStyleBindings } from "./styleBinding";
import { buildWidgetCapabilities } from "./widgetCapabilities";

const CHILDREN: Record<BuilderPrimitiveType, BuilderPrimitiveType[]> = {
  page: ["section"],
  section: ["container"],
  container: ["column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"],
  column: ["heading", "text", "button", "image", "video", "icon", "divider", "spacer", "container"],
  heading: [],
  text: [],
  button: [],
  image: [],
  video: [],
  icon: [],
  divider: [],
  spacer: [],
};

export type WidgetBlueprintSeed = Readonly<{ id: string; type: BuilderPrimitiveType; name?: string; parentId: string | null; children?: string[]; props?: Record<string, unknown>; style?: BuilderStyle; sourceSectionId?: string; sourceComponentVariantId?: string; sourcePatternId?: string; sectionRole?: string }>;

/**
 * Builds a fully editable primitive widget blueprint.
 *
 * @example
 * const widget = buildWidgetBlueprint(input, { id: "heading_1", type: "heading", parentId: "column_1" });
 */
export function buildWidgetBlueprint(input: BuilderBlueprintInput, seed: WidgetBlueprintSeed): WidgetBlueprint {
  const propertyDefinitions = buildPropertyDefinitions(seed.type, seed.id);
  const propertyBindings = buildPropertyBindings(seed.id, propertyDefinitions);
  const editablePropertyBindings = buildEditablePropertyBindings(propertyBindings, propertyDefinitions);
  const responsiveBindings = buildResponsivePropertyBindings(propertyDefinitions);
  const style = seed.style ?? {};
  return Object.freeze({
    id: seed.id,
    type: seed.type,
    name: seed.name ?? seed.type,
    parentId: seed.parentId,
    children: [...(seed.children ?? [])],
    props: seed.props ?? {},
    style,
    inspector: buildInspectorBlueprint(seed.id, propertyDefinitions, propertyBindings, editablePropertyBindings, responsiveBindings),
    propertyDefinitions,
    propertyBindings,
    editablePropertyBindings,
    responsiveBindings,
    styleBindings: buildStyleBindings(seed.id, style),
    motionBindings: buildMotionBindings(input, seed.id),
    capabilities: buildWidgetCapabilities(seed.type),
    aiMetadata: buildAIWidgetMetadata(input, seed.sourceSectionId, seed.sourceComponentVariantId),
    regenerationMetadata: buildRegenerationMetadata(input, seed.sourceSectionId, seed.sourceComponentVariantId, seed.sectionRole),
    allowedChildren: CHILDREN[seed.type],
    sourcePatternId: seed.sourcePatternId,
    sourceComponentVariantId: seed.sourceComponentVariantId,
    sectionRole: seed.sectionRole,
  });
}

/**
 * Builds many widget blueprints from primitive seeds.
 *
 * @example
 * const widgets = buildWidgetBlueprints(input, seeds);
 */
export function buildWidgetBlueprints(input: BuilderBlueprintInput, seeds: readonly WidgetBlueprintSeed[]): WidgetBlueprint[] {
  return seeds.map((seed) => buildWidgetBlueprint(input, seed));
}
