import type { BuilderBlueprintInput, ResponsiveBlueprint, SectionBlueprint, WidgetBlueprint } from "./builderBlueprint";
import { buildContainerBlueprints, widgetBlueprintToTree } from "./containerBlueprint";
import { buildRegenerationMetadata } from "./regenerationMetadata";
import { buildSectionCapabilities } from "./sectionCapabilities";

/**
 * Builds section blueprints from primitive widget blueprints.
 *
 * @example
 * const sections = buildSectionBlueprints(input, widgets);
 */
export function buildSectionBlueprints(input: BuilderBlueprintInput, widgets: readonly WidgetBlueprint[]): SectionBlueprint[] {
  const byId = new Map(widgets.map((widget) => [widget.id, widget]));
  return widgets.filter((widget) => widget.type === "section").map((sectionWidget) => {
    const descendants = widgets.filter((widget) => widget.id === sectionWidget.id || widget.parentId === sectionWidget.id || widget.id.startsWith(sectionWidget.id.replace("section.", "")));
    const sectionWidgets = descendants.length > 1 ? descendants : widgets.filter((widget) => widget.id === sectionWidget.id || widget.parentId === sectionWidget.id || sectionWidget.children.includes(widget.id));
    const containers = buildContainerBlueprints(sectionWidget.id, widgets.filter((widget) => widget.id === sectionWidget.id || widget.parentId === sectionWidget.id || sectionWidget.children.includes(widget.id) || widget.id.includes(sectionWidget.id.replace("section.", ""))));
    const responsive: ResponsiveBlueprint = Object.freeze({
      breakpoints: ["desktop", "tablet", "mobile"],
      bindings: sectionWidgets.flatMap((widget) => widget.responsiveBindings),
    });
    return Object.freeze({
      id: `section-blueprint.${sectionWidget.id}`,
      sourceSectionId: sectionWidget.aiMetadata.sourceSectionId ?? sectionWidget.id,
      role: sectionWidget.sectionRole ?? String(sectionWidget.props.role ?? "section"),
      purpose: String(sectionWidget.props.purpose ?? "Editable generated section."),
      rootWidgetId: sectionWidget.id,
      widgetTree: widgetBlueprintToTree(sectionWidget, byId),
      widgets: sectionWidgets,
      containers,
      inspectorBlueprints: sectionWidgets.map((widget) => widget.inspector),
      capabilities: buildSectionCapabilities(),
      responsive,
      regenerationMetadata: buildRegenerationMetadata(input, sectionWidget.aiMetadata.sourceSectionId, sectionWidget.aiMetadata.sourceComponentVariantId, sectionWidget.sectionRole),
    });
  });
}
