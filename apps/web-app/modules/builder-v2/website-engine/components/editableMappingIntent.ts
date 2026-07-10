import type { ComponentCategory, EditableMappingIntent } from "./componentVariant";

/**
 * Builds future editable mapping intent. This does not create Builder nodes.
 *
 * @example
 * const intent = buildEditableMappingIntent("hero", ["headline"], ["heroImage"]);
 */
export function buildEditableMappingIntent(category: ComponentCategory, editableFields: string[], assetSlots: string[] = []): EditableMappingIntent {
  return Object.freeze({
    target: "native_builder_component_plan",
    editableFields,
    repeatableRegions: ["items"].filter(() => ["gallery", "service", "product", "catalogue", "FAQ", "timeline", "portfolio", "testimonial"].includes(category)),
    assetSlots,
    notes: [
      "Metadata only.",
      "Mapper must later convert this intent into editable native Builder structures.",
      "No Builder nodes are created by Component Engine.",
    ],
  });
}
