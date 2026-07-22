import type { CriticInput } from "./criticInput";
import { createCategoryResult, hardFailure, metadataIssue, repairRecommendation } from "./criticScoring";
import type { CriticCategoryResult } from "./criticResult";

/**
 * Evaluates whether generated metadata preserves native Builder editability.
 *
 * @example
 * const result = runEditabilityCritic({ builderBlueprintResult, mappingPlan });
 */
export function runEditabilityCritic(input: CriticInput): CriticCategoryResult {
  const blueprint = input.builderBlueprintResult;
  const mappingPlan = input.mappingPlan;
  const editableBindings = blueprint?.editablePropertyBindings.length ?? 0;
  const nodePlanCount = mappingPlan?.nodeCreationPlan.length ?? 0;
  const nonEditableSections = input.compiledPlan?.sections.filter((section) => !section.editable || section.mapperIntent !== "native-editable-section") ?? [];
  const supportedTypes = new Set(["page", "section", "container", "column", "heading", "text", "button", "image", "video", "icon", "divider", "spacer"]);
  const unsupportedWidgetTypes = [
    ...(blueprint?.blueprint.widgets.map((widget) => widget.type).filter((type) => !supportedTypes.has(type)) ?? []),
    ...(mappingPlan?.nodeCreationPlan.map((node) => node.nodeType).filter((type) => !supportedTypes.has(type)) ?? []),
  ];
  const opaqueOutputCount = [
    ...(blueprint?.blueprint.widgets ?? []).map((widget) => widget.props),
    ...(mappingPlan?.nodeCreationPlan ?? []).map((node) => node.nativeNode.props),
  ].filter((props) => {
    const keys = Object.keys(props ?? {}).join(" ").toLowerCase();
    const values = JSON.stringify(props ?? {}).toLowerCase();
    return keys.includes("dangerouslysetinnerhtml") || keys === "html" || /\b(html|css|react|blob)\b/.test(values);
  }).length;
  const issues = [];
  const hardFailures = [];
  const recommendations = [];

  if (!blueprint?.nativeCompatibility.nodeIntents.length && nodePlanCount === 0) {
    hardFailures.push(hardFailure("editability", "NO_EDITABLE_MAPPING_INTENT", "No editable mapping intent is available.", "Run Builder Blueprint and Mapper contracts to produce native editable mapping intent."));
  }
  if (nonEditableSections.length > 0) {
    hardFailures.push(hardFailure("editability", "NON_EDITABLE_GENERATED_SECTION", "A generated section is not marked editable.", "Recompile sections with native editable mapper intent."));
  }
  if (unsupportedWidgetTypes.length > 0) {
    hardFailures.push(hardFailure("editability", "UNSUPPORTED_WIDGET_TYPES", "Unsupported widget types are present in native mapping metadata.", "Map only to existing native Builder widget types."));
  }
  if (opaqueOutputCount > 0) {
    hardFailures.push(hardFailure("editability", "OPAQUE_HTML_BLOB_OUTPUT", "Opaque HTML, CSS, React, or blob-like output is present.", "Replace opaque output with native editable Builder nodes and property bindings."));
  }
  if (editableBindings === 0 && blueprint) {
    issues.push(metadataIssue("editability", "major", "No editable inspector bindings are available.", "Preserve inspector/property binding metadata for native Builder editing."));
  }
  if (nodePlanCount === 0) {
    recommendations.push(repairRecommendation("editability", "high", "Add native node mapping plan metadata.", "Create inert mapper plans before execution or preview parity."));
  }

  return createCategoryResult("editability", (input.simulationResult?.editabilityResult.score ?? 76) + Math.min(editableBindings, 12), [
    `Editable binding count: ${editableBindings}.`,
    `Native node mapping plan count: ${nodePlanCount}.`,
    `Unsupported widget type count: ${unsupportedWidgetTypes.length}.`,
  ], issues, hardFailures, recommendations, 1.2);
}
