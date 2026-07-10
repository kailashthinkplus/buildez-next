# Constitution

The BuildEZ Website Engine exists to produce truthful, editable, industry-aware websites. Its constitution is stricter than any single implementation shortcut.

- The LLM plans; BuildEZ designs.
- WebsiteSpec is the source of truth.
- The renderer is deterministic.
- Preview and published output must share the same rendering contract.
- Visual QA evaluates pixels and DOM, not just JSON shape.
- Repair can replace a section structurally; it is not limited to copy tweaks.
- Missing facts are marked as missing facts, not converted into confident claims.
- Every generated section must remain editable in the builder.
- Industries are modeled through ontology, inheritance, archetypes, section patterns, and component patterns.
- Business, brand, content, experience, and pattern intelligence must happen before WebsiteSpec.
- WebsiteSpec records the result of reasoning; it must not become the dumping ground for all reasoning.
- Do not create hardcoded industry generators as the foundation.

Cross-industry implications:

- Real estate: no fake launch dates, registration/compliance numbers, prices, inventory, awards, or generic SaaS feature blocks.
- Healthcare: no fake credentials, cure guarantees, privacy claims, or unsupported medical outcomes.
- Restaurant: no fake hours, fake menu prices, fake reservation availability, or unrelated stock food.
- Education: no fake accreditation, placement statistics, faculty credentials, or admission guarantees.
- Automotive: no fake inventory, warranty terms, discount claims, financing terms, or availability.

## Implementation Guidance

Future Codex sessions should treat this document as architectural intent, then confirm current code before editing. Any behavior change must update the relevant module doc, specification, phase checklist, and changelog.
