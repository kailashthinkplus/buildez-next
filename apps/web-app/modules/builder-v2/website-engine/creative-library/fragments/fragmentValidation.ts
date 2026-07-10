import type { CreativeFragment, RecipeAssemblyResult } from "./creativeFragment";
import { MINIMUM_FRAGMENT_FAMILY_COUNTS } from "./fragmentFamilies";

const forbiddenTerms = ["<div", "</div>", "classname", "react", "css", "html", "buildernode", "premiumwidgetpreview", "screenshot", "jsx", "tsx"];
const fakeClaimTerms = ["#1", "guaranteed", "award-winning", "best in", "certified by", "cure", "100%", "always available"];

export type FragmentValidationResult = Readonly<{ valid: boolean; issues: string[] }>;

export function validateCreativeFragment(fragment: CreativeFragment): FragmentValidationResult {
  const issues: string[] = [];
  if (!fragment.id) issues.push("fragment id required");
  if (!/^Fragment[A-Za-z0-9]+[0-9]{2}$/.test(fragment.id)) issues.push(`${fragment.id}: id format invalid`);
  if (!fragment.family) issues.push(`${fragment.id}: family required`);
  if (!fragment.compatibility.supportedRecipeFamilies.length) issues.push(`${fragment.id}: supported recipe families required`);
  if (!fragment.assemblyRules.length) issues.push(`${fragment.id}: assembly rules required`);
  if (!fragment.editabilityImpact.length) issues.push(`${fragment.id}: editability impact required`);
  if (!fragment.inspectorHints.length) issues.push(`${fragment.id}: inspector hints required`);
  if (!fragment.responsiveBehavior.length) issues.push(`${fragment.id}: responsive behavior required`);
  if (!fragment.accessibilityNotes.length) issues.push(`${fragment.id}: accessibility notes required`);
  const text = JSON.stringify(fragment).toLowerCase();
  if (forbiddenTerms.some((term) => text.includes(term))) issues.push(`${fragment.id}: forbidden output term`);
  if (fakeClaimTerms.some((term) => text.includes(term))) issues.push(`${fragment.id}: fake claim term`);
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validateFragmentCatalog(fragments: readonly CreativeFragment[]): FragmentValidationResult {
  const issues: string[] = [];
  const ids = new Set<string>();
  const counts = fragments.reduce<Record<string, number>>((next, fragment) => {
    if (ids.has(fragment.id)) issues.push(`duplicate fragment id: ${fragment.id}`);
    ids.add(fragment.id);
    next[fragment.family] = (next[fragment.family] ?? 0) + 1;
    issues.push(...validateCreativeFragment(fragment).issues);
    return next;
  }, {});
  if (fragments.length < 140) issues.push("fragment catalog must contain at least 140 fragments");
  for (const [family, minimum] of Object.entries(MINIMUM_FRAGMENT_FAMILY_COUNTS)) {
    if ((counts[family] ?? 0) < minimum) issues.push(`${family}: expected at least ${minimum} fragments`);
  }
  return Object.freeze({ valid: issues.length === 0, issues });
}

export function validateRecipeAssemblyResult(result: RecipeAssemblyResult): FragmentValidationResult {
  const issues: string[] = [];
  if (!result.plan.baseRecipeId) issues.push("assembly plan base recipe required");
  if (!result.plan.fragmentIds.length) issues.push("assembly plan fragments required");
  if (result.plan.metadataOnly !== true || result.plan.builderNodeOutput !== false) issues.push("assembly plan must remain metadata-only");
  return Object.freeze({ valid: issues.length === 0, issues });
}
