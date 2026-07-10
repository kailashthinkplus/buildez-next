# Builder Critical Path

Date: 2026-07-08  
Phase: BSP-2

## Critical Path To AI Generation

1. Serialization/schema validator.
2. CommandBus bounded history and transactions.
3. Responsive architecture.
4. Inspector property binding proof.
5. Canvas/runtime/preview/publish parity baseline.
6. Manual repair loop: selection, clipboard, layers, keyboard, autosave.
7. Inspector UX: color, units, alignment, theme.
8. Widget expansion: embed/code, richer sections, premium editability policy.
9. Motion and advanced Builder UX.
10. AI readiness suite and release gate rescore.

## Gate Blockers

The following bugs directly block release gate success:

BUG-0002, BUG-0004, BUG-0007, BUG-0019, BUG-0024, BUG-0025, BUG-0026, BUG-0027, BUG-0031, BUG-0033, BUG-0037, BUG-0038, BUG-0039, BUG-0044, BUG-0049.

## Manual Quality Blockers

The following bugs block a professional manual Builder even before AI:

BUG-0001, BUG-0006, BUG-0008, BUG-0009, BUG-0010, BUG-0011, BUG-0014, BUG-0015, BUG-0016, BUG-0017, BUG-0021, BUG-0022, BUG-0023, BUG-0028, BUG-0029, BUG-0035, BUG-0036, BUG-0041, BUG-0045, BUG-0046, BUG-0047, BUG-0050.

## Architecture Work Items

- Versioned blueprint schema and validator.
- Command transaction model.
- Shared responsive value model.
- Inspector binding registry or proof harness.
- Shared render contract or parity harness.
- Save queue and revision model.
- Layer tree operation model.
- Header/footer editability policy.
- Scoped custom CSS and embed/code safety model.

## Recommended Next Phase

BSP-3 should not fix all bugs. It should create the regression suite foundation needed to safely fix Wave 1:

- Add schema validation tests.
- Add command/history tests.
- Add responsive binding tests.
- Add inspector binding tests.
- Add parity baseline tests.
- Add large-page and history stress scaffolding.
