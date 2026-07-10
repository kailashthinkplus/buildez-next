# BSP-12 Theme Panels, Header/Footer Policy, and Multi-Column Selector

Date: 2026-07-09  
Status: Implemented with compile-safe regression coverage  
Phase: Builder Bug Fix Sprint 6

## Objective

BSP-12 addresses global Builder/theme blockers:

- BUG-0016: Colors/settings panel empty
- BUG-0017: Theme settings empty
- BUG-0004: Header/footer cannot be edited through Builder
- BUG-0018: Multi-column widget lacks column type selector on insert

## Implementation Summary

### Theme Panels

Added theme token metadata under `apps/web-app/modules/builder-v2/theme/themeTokenMetadata.ts`.

Updated the sidebar colors and settings panels to render non-empty Builder UI from the existing theme system:

- Global colors.
- Global fonts.
- Spacing scale.
- Radius tokens.
- Shadow tokens.
- Button defaults.
- Section/container defaults.

Theme token updates go through CommandBus and update `blueprint.theme.tokens`.

### Theme Token Bindings

Added safe token metadata for colors, typography, spacing, radius, shadow, button, and section/container defaults.

The inspector color picker remains token-ready through metadata but does not yet include a full token picker UI.

### Header/Footer Policy

Added header/footer global section policy metadata in `theme/globalSectionPolicy.ts`.

Policy summary:

- Header/footer must eventually be native editable Builder structures.
- Opaque header/footer blobs are blocked.
- AI-generated header/footer output is blocked until native editability exists.
- Site-shared ownership is required.
- Preview/publish must consume the same native global section model.

Created `docs/builder/HeaderFooterEditablePolicy.md`.

### Multi-Column Selector

Added shared column structure presets and application helper in `layout/columnStructure.ts`.

Required presets now exist:

- 1 column
- 2 equal
- 3 equal
- 4 equal
- 30/70
- 70/30
- 25/75
- 75/25
- 25/50/25
- 20/60/20
- sidebar/content
- content/sidebar

Updated `ColumnStructurePicker` to use the shared preset list. Updated BuilderShell column structure application to use the shared native-column helper while preserving CommandBus undo/redo.

## Regression Coverage

Added compile-safe specs:

- `theme/theme-panels.test.ts`
- `theme/theme-tokens.test.ts`
- `layout/multi-column-selector.test.ts`
- `global/header-footer-policy.test.ts`

## Verification

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

No test runner script is configured in `apps/web-app/package.json`; BSP-12 tests are compile-safe regression specifications until a runner is added.

## Safety

- `ai-v9` untouched.
- AI generation not wired.
- Mapper not executed.
- No AI Builder nodes inserted.
- Feature flags unchanged.
- No route changes.
- No unrelated Builder UI refactor.

## Remaining Risks

- Header/footer editability is policy-scaffolded, not fully implemented as native shared sections.
- Theme token picker in the inspector remains a future UI step.
- Theme panel updates are CommandBus-backed but still need browser-level QA.
- Column picker visual QA and drag/drop insert integration need executable tests.
