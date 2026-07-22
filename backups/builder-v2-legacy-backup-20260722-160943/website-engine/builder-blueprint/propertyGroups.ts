import type { PropertyGroup } from "./builderBlueprint";

export const DEFAULT_PROPERTY_GROUPS: PropertyGroup[] = [
  { id: "content", label: "Content" },
  { id: "typography", label: "Typography" },
  { id: "layout", label: "Layout" },
  { id: "spacing", label: "Spacing" },
  { id: "background", label: "Background" },
  { id: "border", label: "Border" },
  { id: "shadow", label: "Shadow" },
  { id: "media", label: "Media" },
  { id: "button", label: "Button" },
  { id: "animation", label: "Animation" },
  { id: "responsive", label: "Responsive" },
  { id: "advanced", label: "Advanced" },
  { id: "ai", label: "AI" },
];

/**
 * Builds standard Inspector property groups.
 *
 * @example
 * const groups = buildPropertyGroups();
 */
export function buildPropertyGroups(): PropertyGroup[] {
  return DEFAULT_PROPERTY_GROUPS.map((group) => Object.freeze({ ...group }));
}
