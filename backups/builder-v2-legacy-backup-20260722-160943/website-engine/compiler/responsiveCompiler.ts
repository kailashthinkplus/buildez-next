import type { CompilerInput, CompiledResponsiveRule, CompiledSection } from "./compiledPlan";

export function compileResponsiveRules(input: CompilerInput, sections: readonly CompiledSection[]): CompiledResponsiveRule[] {
  const mobileOrder = input.compositionResult?.mobileStacking.order ?? sections.map((section) => String(section.id));
  return [
    Object.freeze({ id: "responsive.mobile.stack", breakpoint: "mobile" as const, rule: `stack sections in composition order: ${mobileOrder.join(" -> ")}` }),
    Object.freeze({ id: "responsive.tablet.balance", breakpoint: "tablet" as const, rule: "preserve section order and readable density" }),
    Object.freeze({ id: "responsive.desktop.expand", breakpoint: "desktop" as const, rule: "allow full layout density without changing content order" }),
    ...sections.map((section) => Object.freeze({ id: `responsive.section.${section.id}`, breakpoint: "mobile" as const, rule: `${input.decisionPlan.selectedResponsiveStrategy}: ${section.type} remains editable and ordered.`, targetId: String(section.id) })),
  ];
}
