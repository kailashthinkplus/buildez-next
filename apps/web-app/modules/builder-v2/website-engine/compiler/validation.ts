import type { ValidationIssue, ValidationResult } from "../sdk";
import { REPOSITORY_RECORDS } from "../repository";
import type { CompiledWebsitePlan } from "./compiledPlan";

const fakeClaimTerms = ["award-winning", "guaranteed results", "officially authorized", "number one", "#1"];
const forbiddenOutputTerms = ["builderNode", "reactElement", "className=", "<div", "</div>", "style={", "function component"];

function issue(path: string, message: string, code = "INVALID_COMPILED_PLAN"): ValidationIssue {
  return Object.freeze({ path, message, code });
}

function containsTerm(plan: CompiledWebsitePlan, terms: readonly string[]) {
  const text = JSON.stringify(plan).toLowerCase();
  return terms.some((term) => text.includes(term.toLowerCase()));
}

/**
 * Validates a local CompiledWebsitePlan.
 *
 * @example
 * const validation = validateCompiledWebsitePlan(plan);
 */
export function validateCompiledWebsitePlan(plan: CompiledWebsitePlan): ValidationResult<CompiledWebsitePlan> {
  const issues: ValidationIssue[] = [];
  const repositoryIds = new Set(REPOSITORY_RECORDS.map((record) => String(record.id)));

  if (!plan.id) issues.push(issue("id", "Compiled plan id is required.", "REQUIRED"));
  if (!plan.version) issues.push(issue("version", "Compiled plan version is required.", "REQUIRED"));
  if (!plan.selectedArchetype || plan.selectedArchetype === "unknown") issues.push(issue("selectedArchetype", "Selected archetype is required.", "REQUIRED"));
  if (!plan.selectedDesignLanguage || plan.selectedDesignLanguage === "unknown") issues.push(issue("selectedDesignLanguage", "Selected design language is required.", "REQUIRED"));
  if (plan.sections.length === 0) issues.push(issue("sections", "At least one section is required.", "REQUIRED"));
  for (const [index, section] of plan.sections.entries()) {
    if (!section.purpose) issues.push(issue(`sections.${index}.purpose`, "Every section needs a purpose.", "REQUIRED"));
    if (!section.contentRole) issues.push(issue(`sections.${index}.contentRole`, "Every section needs a compiled content role.", "REQUIRED"));
    if (!section.experienceRole) issues.push(issue(`sections.${index}.experienceRole`, "Every section needs a compiled experience role.", "REQUIRED"));
    if (!section.patternRole) issues.push(issue(`sections.${index}.patternRole`, "Every section needs a compiled pattern role.", "REQUIRED"));
    if (!section.editable || section.mapperIntent !== "native-editable-section") {
      issues.push(issue(`sections.${index}.editable`, "Every section must remain editable downstream.", "EDITABILITY_REQUIRED"));
    }
  }
  for (const [index, component] of plan.components.entries()) {
    if (!component.category) issues.push(issue(`components.${index}.category`, "Every component needs a category.", "REQUIRED"));
    if (!component.editableMappingIntent || component.editableMappingIntent.target !== "native_builder_component_plan") {
      issues.push(issue(`components.${index}.editableMappingIntent`, "Every component needs editable mapping intent.", "EDITABILITY_REQUIRED"));
    }
  }
  if (plan.assetRequirements.some((asset) => asset.required && !asset.reason)) {
    issues.push(issue("assetRequirements", "All required assets need reasons.", "REQUIRED"));
  }
  if (plan.qualityGates.length === 0) issues.push(issue("qualityGates", "Quality gates are required.", "REQUIRED"));
  if (plan.metadata.repositoryReferencesUsed.some((id) => !repositoryIds.has(id))) {
    issues.push(issue("metadata.repositoryReferencesUsed", "Repository references must exist.", "INVALID_REFERENCE"));
  }
  if (containsTerm(plan, fakeClaimTerms)) {
    issues.push(issue("plan", "Compiled plan appears to contain fake business fact language.", "FAKE_FACT"));
  }
  if (containsTerm(plan, forbiddenOutputTerms)) {
    issues.push(issue("plan", "Compiled plan must not contain Builder node, HTML, React, or CSS output.", "FORBIDDEN_OUTPUT"));
  }
  if (plan.outputKind !== "mapper-ready-plan" || plan.editable !== true) {
    issues.push(issue("outputKind", "Compiled output must be an editable mapper-ready plan.", "INVALID_OUTPUT_KIND"));
  }

  return Object.freeze({
    valid: issues.length === 0,
    value: issues.length === 0 ? plan : undefined,
    issues,
  });
}
