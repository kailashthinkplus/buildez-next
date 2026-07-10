import type { BuilderPrimitiveType, PropertyControlType, PropertyDefinition, PropertyGroupId } from "./builderBlueprint";

type DefinitionSeed = Readonly<{ id: string; label: string; path: string; control: PropertyControlType; group: PropertyGroupId; value: unknown; responsive?: boolean; aiEditable?: boolean; allowedValues?: readonly unknown[]; min?: number; max?: number; step?: number; unitOptions?: readonly string[]; helpText?: string }>;

const COMMON: DefinitionSeed[] = [
  { id: "advanced.name", label: "Name", path: "name", control: "text", group: "advanced", value: "", aiEditable: false },
  { id: "ai.regenerate", label: "Regenerate", path: "metadata.regenerate", control: "toggle", group: "ai", value: true, aiEditable: false },
];

const BY_TYPE: Record<BuilderPrimitiveType, DefinitionSeed[]> = {
  page: [{ id: "content.title", label: "Page Title", path: "props.title", control: "text", group: "content", value: "Website", aiEditable: true }],
  section: [
    { id: "layout.container", label: "Container", path: "props.container", control: "select", group: "layout", value: "boxed", allowedValues: ["boxed", "full"] },
    { id: "spacing.paddingTop", label: "Padding Top", path: "style.paddingTop", control: "slider", group: "spacing", value: 80, responsive: true, min: 0, max: 200, step: 1, unitOptions: ["px"] },
    { id: "spacing.paddingBottom", label: "Padding Bottom", path: "style.paddingBottom", control: "slider", group: "spacing", value: 80, responsive: true, min: 0, max: 200, step: 1, unitOptions: ["px"] },
    { id: "background.color", label: "Background", path: "style.backgroundColor", control: "color", group: "background", value: "transparent" },
  ],
  container: [
    { id: "layout.direction", label: "Direction", path: "style.flexDirection", control: "select", group: "layout", value: "column", responsive: true, allowedValues: ["row", "column"] },
    { id: "layout.gap", label: "Gap", path: "style.gap", control: "slider", group: "layout", value: 24, responsive: true, min: 0, max: 96, unitOptions: ["px"] },
  ],
  column: [
    { id: "layout.width", label: "Width", path: "style.width", control: "text", group: "layout", value: "100%", responsive: true },
    { id: "layout.gap", label: "Gap", path: "style.gap", control: "slider", group: "layout", value: 16, responsive: true, min: 0, max: 96, unitOptions: ["px"] },
  ],
  heading: [
    { id: "content.text", label: "Text", path: "props.text", control: "textarea", group: "content", value: "Section heading", aiEditable: true },
    { id: "content.level", label: "Heading Level", path: "props.level", control: "select", group: "content", value: "h2", allowedValues: ["h1", "h2", "h3", "h4", "h5", "h6"] },
    { id: "typography.fontSize", label: "Font Size", path: "style.fontSize", control: "slider", group: "typography", value: 48, responsive: true, min: 12, max: 120, unitOptions: ["px"] },
    { id: "typography.color", label: "Color", path: "style.color", control: "color", group: "typography", value: "text.primary" },
    { id: "typography.align", label: "Alignment", path: "style.textAlign", control: "alignment", group: "typography", value: "left", allowedValues: ["left", "center", "right"] },
  ],
  text: [
    { id: "content.text", label: "Text", path: "props.text", control: "textarea", group: "content", value: "Supporting text", aiEditable: true },
    { id: "typography.fontSize", label: "Font Size", path: "style.fontSize", control: "slider", group: "typography", value: 16, responsive: true, min: 10, max: 48, unitOptions: ["px"] },
    { id: "typography.color", label: "Color", path: "style.color", control: "color", group: "typography", value: "text.secondary" },
  ],
  button: [
    { id: "button.text", label: "Button Text", path: "props.text", control: "text", group: "button", value: "Get Started", aiEditable: true },
    { id: "button.link", label: "Link", path: "props.url", control: "link", group: "button", value: "#" },
    { id: "button.variant", label: "Variant", path: "props.variant", control: "select", group: "button", value: "primary", allowedValues: ["primary", "secondary", "outline", "ghost"] },
  ],
  image: [
    { id: "media.src", label: "Image", path: "props.src", control: "image", group: "media", value: "", aiEditable: true },
    { id: "media.alt", label: "Alt Text", path: "props.alt", control: "text", group: "media", value: "" },
    { id: "border.radius", label: "Radius", path: "style.borderRadius", control: "slider", group: "border", value: 12, min: 0, max: 64, unitOptions: ["px"] },
  ],
  video: [
    { id: "media.src", label: "Video", path: "props.src", control: "video", group: "media", value: "" },
    { id: "media.poster", label: "Poster", path: "props.poster", control: "image", group: "media", value: "" },
  ],
  icon: [
    { id: "media.icon", label: "Icon", path: "props.glyph", control: "icon", group: "media", value: "sparkle" },
    { id: "typography.color", label: "Color", path: "style.color", control: "color", group: "typography", value: "text.primary" },
  ],
  divider: [{ id: "border.color", label: "Color", path: "style.color", control: "color", group: "border", value: "#cbd5e1" }],
  spacer: [{ id: "spacing.height", label: "Height", path: "style.height", control: "slider", group: "spacing", value: 24, responsive: true, min: 4, max: 240, unitOptions: ["px"] }],
};

/**
 * Builds property definitions for a primitive widget.
 *
 * @example
 * const definitions = buildPropertyDefinitions("heading", "headline");
 */
export function buildPropertyDefinitions(type: BuilderPrimitiveType, widgetId: string): PropertyDefinition[] {
  return [...BY_TYPE[type], ...COMMON].map((definition) => Object.freeze({
    id: `${widgetId}.${definition.id}`,
    label: definition.label,
    propertyPath: definition.path,
    controlType: definition.control,
    group: definition.group,
    defaultValue: definition.value,
    currentValue: definition.value,
    responsive: Boolean(definition.responsive),
    aiEditable: definition.aiEditable ?? false,
    userEditable: true,
    validationRules: ["editable-native-builder-property"],
    allowedValues: definition.allowedValues,
    min: definition.min,
    max: definition.max,
    step: definition.step,
    unitOptions: definition.unitOptions,
    helpText: definition.helpText,
  }));
}
