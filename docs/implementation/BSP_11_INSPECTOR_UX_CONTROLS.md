# BSP-11 Inspector UX Controls

Date: 2026-07-08  
Status: Implemented with compile-safe regression coverage  
Phase: Builder Bug Fix Sprint 5

## Objective

BSP-11 addresses inspector UX/control blockers:

- BUG-0001: Color picker missing
- BUG-0006: Unit picker missing
- BUG-0008: Alignment controls are text boxes
- BUG-0007: Inspector controls visible but do nothing

## Implementation Summary

### Color Picker

Updated the existing inspector `ColorPicker` to provide:

- Hex/text input.
- Native visual color input.
- Palette swatches.
- Clear/transparent support.
- Theme-token-ready metadata through `data-theme-token-ready`.

`ColorProperty` now uses the shared color picker instead of rendering a text box plus static preview.

### Unit Picker

Added unit parsing/formatting helpers and `UnitInput` support for:

- `px`
- `%`
- `em`
- `rem`
- `vw`
- `vh`

Unknown units fall back to `px`. Unit-aware controls are used for applicable dimension, spacing, and position values in the Design tab. Freeform CSS fields such as `gridTemplateColumns`, `border`, `transform`, and background URLs remain text inputs.

### Alignment Controls

Added `AlignmentInput` with visual segmented/icon controls for text and layout alignment. Added `AlignmentProperty` so widget-defined `alignment` properties are now renderable through the property renderer instead of being hidden as unsupported controls.

### Dead Control Handling

Updated property binding renderability so implemented `alignment` controls are visible, while still hiding unsupported control types such as `gradient` and `shadow` with disabled reasons.

### Responsive Device Support

Applicable Design tab controls now write through the responsive style pipeline:

- Text alignment.
- Text/icon/background colors.
- Size/dimension values.
- Spacing values.
- Position offsets.

## Regression Coverage

Added compile-safe specs:

- `inspector/color-picker.test.ts`
- `inspector/unit-picker.test.ts`
- `inspector/alignment-controls.test.ts`
- `inspector/dead-controls.test.ts`

Updated helper coverage:

- `helpers/testInspectorHarness.ts`

Coverage includes:

- Color picker metadata and responsive color updates.
- Clear color behavior preserving a real binding.
- Unit parsing, formatting, fallback to `px`, and responsive unit updates.
- Text and layout alignment validation.
- Alignment property renderability.
- Unsupported controls hidden/disabled with reasons.

## Verification

Command run:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

No test runner script is configured in `apps/web-app/package.json`; BSP-11 tests are compile-safe regression specifications until a runner is added.

## Safety

- `ai-v9` untouched.
- AI generation not wired.
- Mapper not executed.
- No AI Builder nodes inserted.
- Feature flags unchanged.
- No route changes.
- No unrelated Builder UI refactor.

## Remaining Risks

- Color token selection UI is metadata-ready but not connected to a real theme token picker.
- Alignment icon coverage is intentionally minimal; richer layout alignment options may need dedicated icons and browser QA.
- Inspector behavior still needs executable component tests and browser-level manual QA.
- Some advanced CSS fields remain intentionally freeform text inputs.
