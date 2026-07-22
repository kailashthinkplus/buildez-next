export type AIEditSafety = Readonly<{
  ruleId: string;
  title: string;
  required: true;
  currentlySatisfied: boolean;
  blockers: string[];
}>;

export function buildEditSafetyRules(): AIEditSafety[] {
  return [
    rule("no-builder-mutation", "AI must not mutate Builder store directly.", true, []),
    rule("no-commandbus-execution", "AI must not execute CommandBus until release gate passes.", true, ["BUG-0031", "BUG-0033"]),
    rule("schema-validation", "AI output must pass native Builder schema validation before persistence.", false, ["BUG-0037", "BUG-0025"]),
    rule("responsive-validation", "AI responsive output must pass desktop/tablet/mobile validation.", false, ["BUG-0002", "BUG-0019", "BUG-0049"]),
    rule("inspector-binding-validation", "AI-editable properties must be proven through inspector binding tests.", false, ["BUG-0007"]),
    rule("parity-validation", "AI output must pass canvas/preview/publish parity checks.", false, ["BUG-0026", "BUG-0027", "BUG-0039"]),
    rule("preserve-user-edits", "AI regeneration must preserve user edits by default.", false, ["REGENERATION_METADATA_NOT_ENFORCED"]),
    rule("publish-block", "AI-generated pages must not publish without release gate approval.", true, ["RELEASE_GATE_FAILED"]),
  ];
}

function rule(ruleId: string, title: string, currentlySatisfied: boolean, blockers: string[]): AIEditSafety {
  return Object.freeze({
    ruleId,
    title,
    required: true as const,
    currentlySatisfied,
    blockers,
  });
}
