import type { BuilderBlueprint, BuilderBlueprintValidationResult, WidgetBlueprint } from "./builderBlueprint";

const forbiddenTerms = ["PremiumWidgetPreview", "<div", "</div>", "className=", "reactElement", "function component", "dangerouslySetInnerHTML"];
const allowedTypes = new Set(["page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"]);

function issue(path: string, code: string, message: string) {
  return Object.freeze({ path, code, message });
}

function validateWidget(widget: WidgetBlueprint, issues: ReturnType<typeof issue>[]) {
  if (!allowedTypes.has(widget.type)) issues.push(issue(`widgets.${widget.id}.type`, "INVALID_PRIMITIVE", "Widget type must be an allowed native primitive."));
  if (!widget.inspector) issues.push(issue(`widgets.${widget.id}.inspector`, "REQUIRED", "Every widget needs an InspectorBlueprint."));
  if (!widget.propertyDefinitions.length) issues.push(issue(`widgets.${widget.id}.propertyDefinitions`, "REQUIRED", "Every widget needs property definitions."));
  if (!widget.propertyBindings.length) issues.push(issue(`widgets.${widget.id}.propertyBindings`, "REQUIRED", "Every widget needs property bindings."));
  if (!widget.capabilities?.canEdit) issues.push(issue(`widgets.${widget.id}.capabilities`, "EDITABILITY", "Every widget must be editable."));
  if (!widget.aiMetadata?.editable || !widget.aiMetadata.regeneratable) issues.push(issue(`widgets.${widget.id}.aiMetadata`, "REGENERATION", "Every widget needs editable AI metadata."));
  if (!widget.regenerationMetadata?.editable || !widget.regenerationMetadata.regeneratable) issues.push(issue(`widgets.${widget.id}.regenerationMetadata`, "REGENERATION", "Every widget needs regeneration metadata."));
  if (widget.propertyDefinitions.some((definition) => definition.responsive) && !widget.responsiveBindings.length) {
    issues.push(issue(`widgets.${widget.id}.responsiveBindings`, "RESPONSIVE", "Responsive-capable widgets need responsive bindings."));
  }
}

/**
 * Validates Builder Blueprint Engine output.
 *
 * @example
 * const validation = validateBuilderBlueprint(blueprint);
 */
export function validateBuilderBlueprint(blueprint: BuilderBlueprint): BuilderBlueprintValidationResult {
  const issues: ReturnType<typeof issue>[] = [];
  if (!blueprint.id) issues.push(issue("id", "REQUIRED", "Blueprint id is required."));
  if (!blueprint.version) issues.push(issue("version", "REQUIRED", "Blueprint version is required."));
  if (!blueprint.sections.length) issues.push(issue("sections", "REQUIRED", "At least one section blueprint is required."));
  for (const section of blueprint.sections) {
    if (!section.widgetTree) issues.push(issue(`sections.${section.id}.widgetTree`, "REQUIRED", "Every section needs editable widget tree metadata."));
    if (!section.capabilities.canEdit) issues.push(issue(`sections.${section.id}.capabilities`, "EDITABILITY", "Every section must be editable."));
  }
  for (const widget of blueprint.widgets) validateWidget(widget, issues);
  if (!blueprint.nativeCompatibility.compatible) {
    issues.push(issue("nativeCompatibility", "NATIVE_COMPATIBILITY", "Blueprint must map to existing native Builder node/widget/property concepts."));
  }
  for (const widget of blueprint.widgets) {
    if (!blueprint.nativeWidgetIntents.some((intent) => intent.widgetId === widget.id)) {
      issues.push(issue(`widgets.${widget.id}.nativeWidgetIntent`, "NATIVE_WIDGET_INTENT", "Every widget needs native widget mapping intent."));
    }
    if (!blueprint.nativeNodeIntents.some((intent) => intent.sourceWidgetId === widget.id)) {
      issues.push(issue(`widgets.${widget.id}.nativeNodeIntent`, "NATIVE_NODE_INTENT", "Every widget needs native node mapping intent."));
    }
    if (!blueprint.nativeInspectorBindingIntents.some((intent) => intent.widgetId === widget.id)) {
      issues.push(issue(`widgets.${widget.id}.nativeInspectorBindingIntent`, "NATIVE_INSPECTOR_INTENT", "Every widget needs native inspector/property binding intent."));
    }
  }
  if (!blueprint.responsiveBindings.length) issues.push(issue("responsiveBindings", "RESPONSIVE", "Responsive metadata is required."));
  const serialized = JSON.stringify(blueprint);
  if (forbiddenTerms.some((term) => serialized.includes(term))) issues.push(issue("blueprint", "FORBIDDEN_OUTPUT", "Blueprint must not contain PremiumWidgetPreview, HTML, React, CSS, or blob output."));
  return Object.freeze({ valid: issues.length === 0, issues });
}
