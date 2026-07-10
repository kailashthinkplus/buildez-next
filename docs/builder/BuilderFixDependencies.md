# Builder Fix Dependencies

Date: 2026-07-08  
Phase: BSP-2

## Dependency Principles

- Schema validation comes before generated or expanded widgets.
- History transactions come before clipboard and drag repair workflows.
- Responsive architecture comes before unit picker, layout controls, and mobile preview work.
- Parity baseline comes before publish, preview, header/footer, and premium widget work.
- Inspector binding proof comes before inspector UX polish.

## Dependency Graph

| Foundation | Unlocks |
| --- | --- |
| BUG-0037 Blueprint API schema validation | BUG-0025, BUG-0038, BUG-0003, BUG-0012, BUG-0042, Wave 6 AI work |
| BUG-0031 Bounded CommandBus history | BUG-0032, BUG-0033, BUG-0010, BUG-0011, BUG-0035, BUG-0047 |
| BUG-0033 Command transactions | Clipboard, drag/drop, autosave, AI partial regeneration planning |
| BUG-0039 Canvas/runtime parity baseline | BUG-0026, BUG-0027, BUG-0004, BUG-0009, BUG-0042, BUG-0005 |
| BUG-0002 Responsive control architecture | BUG-0019, BUG-0049, BUG-0006, BUG-0008, BUG-0018 |
| BUG-0007 Inspector binding proof | BUG-0001, BUG-0006, BUG-0016, BUG-0017, BUG-0022, BUG-0040, BUG-0048 |
| BUG-0035 Unified drop intent | BUG-0015, BUG-0036, advanced layer sorting |
| BUG-0045 Save queue/revision policy | BUG-0050, preview/publish confidence |

## Wave Dependencies

Wave 1 has no predecessor and must start first.

Wave 2 depends on Wave 1 for history, transactions, serialization, parity, and responsive baseline.

Wave 3 depends on Wave 1 inspector binding proof and responsive architecture. Theme panels may begin as design specs earlier, but implementation should wait for schema and binding rules.

Wave 4 depends on Wave 1 schema validation and Wave 3 inspector conventions. Widget expansion without binding proof would increase the bug surface.

Wave 5 depends on Wave 1 parity and Wave 3 inspector controls. Motion and premium UX should not ship while basic controls are untrusted.

Wave 6 depends on all previous waves and the release gate.

## Critical Dependency Risks

- If serialization validation is delayed, every widget or AI output path remains unsafe.
- If parity baseline is delayed, preview and publish fixes cannot be proven.
- If transactions are delayed, copy/paste, drag/drop, and AI partial regeneration will remain brittle.
- If responsive architecture is delayed, unit picker and layout controls will be cosmetic rather than reliable.
