export function buildAIPrompt({
  message,
  attachmentSummary,
}: {
  message: string;
  attachmentSummary?: string;
}) {
  return `
TASK:
Create a page blueprint based on the user request.

USER REQUEST:
${message}

${attachmentSummary ? `REFERENCE CONTEXT:\n${attachmentSummary}` : ""}

CONSTRAINTS:
- Do not assume any industry
- Do not introduce business language
- Do not optimize for conversion
- Do not invent new component types

STRUCTURE EXPECTATION:
- Logical section breakdown
- Clear grouping of content
- Reasonable default layout
- Neutral placeholder copy

OUTPUT:
Return ONLY the JSON blueprint.
`;
}
