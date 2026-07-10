# 2026-07-09 BSP-12 Theme Global Columns

## Scope

Implemented BSP-12 for theme panels, theme token metadata, header/footer policy, and multi-column selector presets.

## Files Created

- `apps/web-app/modules/builder-v2/theme/themeTokenMetadata.ts`
- `apps/web-app/modules/builder-v2/theme/globalSectionPolicy.ts`
- `apps/web-app/modules/builder-v2/layout/columnStructure.ts`
- `apps/web-app/modules/builder-v2/__tests__/theme/theme-panels.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/theme/theme-tokens.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/layout/multi-column-selector.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/global/header-footer-policy.test.ts`
- `docs/builder/HeaderFooterEditablePolicy.md`
- `docs/implementation/BSP_12_THEME_GLOBAL_COLUMNS.md`
- `docs/developer-logs/2026-07-09_BSP_12_THEME_GLOBAL_COLUMNS.md`

## Files Modified

- `apps/web-app/modules/builder-v2/sidebar/PanelContainer.tsx`
- `apps/web-app/modules/builder-v2/layout/ColumnStructurePicker.tsx`
- `apps/web-app/modules/builder-v2/workspace/BuilderShell.tsx`
- `docs/builder/BuilderBugDatabase.md`
- `docs/builder/BuilderRegressionMatrix.md`
- `docs/builder/BuilderQualityScore.md`
- `docs/builder/BuilderReleaseGateChecklist.md`
- `docs/PROJECT_STATE.md`
- `docs/changelog/CHANGELOG.md`

## Verification

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

`apps/web-app/package.json` does not define a test runner script. BSP-12 tests are compile-safe regression specs.

## Safety Notes

- Did not modify `ai-v9`.
- Did not wire AI generation.
- Did not execute Mapper.
- Did not insert AI Builder nodes.
- Did not change feature flags.
- Did not change routes.
- Did not refactor unrelated Builder UI.
