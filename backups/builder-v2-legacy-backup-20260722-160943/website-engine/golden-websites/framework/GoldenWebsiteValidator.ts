import type { BuilderBlueprint } from "../../builder-blueprint/builderBlueprint";
import type { GoldenWebsiteCase } from "./GoldenWebsiteCase";
import type { CompositionQualityScore } from "../../composition-quality";
import type { DesignExecutionPlan } from "../../design-intelligence";

export type GoldenValidation = Readonly<{
  passed: boolean;
  failedRules: readonly string[];
  warnings: readonly string[];
  capabilities: Readonly<Record<string, boolean>>;
}>;

export function validateGoldenWebsite(
  fixture: GoldenWebsiteCase,
  blueprint: BuilderBlueprint,
  composition: CompositionQualityScore,
  design: DesignExecutionPlan,
  serializationPassed: boolean,
): GoldenValidation {
  const selected = blueprint.sections.map((section) => section.regenerationMetadata.sourceComponentVariantId).filter(Boolean);
  const capabilities = Object.freeze({
    "native-nodes": blueprint.nativeCompatibility.compatible && blueprint.nativeNodeIntents.length === blueprint.widgets.length && blueprint.nativeCompatibility.unsupportedWidgetTypes.length === 0,
    editable: blueprint.widgets.every((widget) => widget.capabilities.canEdit && widget.inspector.propertyBindings.length > 0),
    responsive: blueprint.widgets.every((widget) => widget.inspector.tabs.includes("responsive")) && blueprint.responsiveBindings.length > 0,
    serializable: serializationPassed,
    "runtime-parity": blueprint.validation.valid && Object.keys(blueprint.nativeBlueprint.nodes).length === blueprint.widgets.length,
  });
  const failedRules: string[] = [];
  if (!blueprint.validation.valid) failedRules.push("blueprint-invalid");
  if (fixture.expectedComponents.some((component) => !selected.includes(component))) failedRules.push("expected-components-missing");
  if (composition.score < fixture.expectedScores.composition) failedRules.push("composition-score-below-threshold");
  if (design.qualityScore.overall < fixture.expectedScores.design) failedRules.push("design-score-below-threshold");
  for (const capability of fixture.requiredCapabilities) if (!capabilities[capability]) failedRules.push(`capability-${capability}-failed`);
  for (const antiPattern of fixture.antiPatterns) if (composition.warnings.some((warning) => warning.code === antiPattern)) failedRules.push(`anti-pattern-${antiPattern}`);
  return Object.freeze({
    passed: failedRules.length === 0,
    failedRules: Object.freeze(failedRules),
    warnings: Object.freeze([...composition.warnings.map((warning) => warning.message), ...design.qualityScore.warnings.map((warning) => warning.message)]),
    capabilities,
  });
}
