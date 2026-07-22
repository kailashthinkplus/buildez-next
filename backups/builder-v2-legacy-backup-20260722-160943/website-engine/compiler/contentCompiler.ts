import type { CompilerInput, CompiledContentRole } from "./compiledPlan";

export function compileContentRoles(input: CompilerInput, sectionIds: readonly string[]): CompiledContentRole[] {
  const hierarchy = input.contentStrategy?.messageHierarchy ?? [];
  const ctas = input.contentStrategy?.ctaStrategy ?? [];
  const sectionRoles = input.contentStrategy?.sectionMessagingRoles
    ? Object.entries(input.contentStrategy.sectionMessagingRoles).map(([sectionRole, messageRole]) => `${sectionRole}: ${messageRole}`)
    : [];
  return sectionIds.map((sectionId, index) => Object.freeze({
    sectionId,
    role: hierarchy[index % Math.max(hierarchy.length, 1)] ?? "support primary message",
    messageRole: sectionRoles,
    ctaRole: ctas,
  }));
}
