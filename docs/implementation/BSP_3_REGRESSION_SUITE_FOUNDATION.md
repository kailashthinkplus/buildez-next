# BSP-3 Regression Suite Foundation

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-3  
Type: Regression scaffold foundation

## Objective

Create a compile-safe regression test structure for the native Builder so future bug fixes can be protected by tests.

## Scope Completed

- Added `apps/web-app/modules/builder-v2/__tests__/` structure.
- Added deterministic Builder blueprint fixtures.
- Added command, serialization, inspector, responsive, widget, parity, and assertion harnesses.
- Added initial compile-safe `.test.ts` regression specifications.
- Added the Builder test tree to `apps/web-app/tsconfig.builder.json` so `typecheck:builder` validates the scaffold.

## Test Runner Status

No test runner is configured in `apps/web-app` as of BSP-3. The web app package exposes `typecheck:builder` only. BSP-3 therefore adds compile-safe regression specifications instead of executable runner tests.

Future runner requirements:

- Unit/contract runner for pure TypeScript harness tests.
- Component runner for inspector and canvas interaction tests.
- Browser runner for preview, publish, accessibility, and parity tests.
- Stress runner for large blueprints and CommandBus/history performance.

## Initial Bug Coverage

- BUG-0037: serialization/schema validation baseline.
- BUG-0025: save/reload round-trip baseline.
- BUG-0039: canvas/runtime contract drift baseline.
- BUG-0002: responsive device-specific values baseline.
- BUG-0019: responsive preview contract baseline.
- BUG-0007: inspector property binding baseline.
- BUG-0031: CommandBus history baseline.
- BUG-0033: multi-command undo transaction baseline, marked expected-failing.
- BUG-0026: publish parity contract baseline.
- BUG-0027: preview parity contract baseline.
- BUG-0028: accessibility audit baseline is represented in native node compatibility planning; executable accessibility checks require a browser runner.

## Files Created

- `apps/web-app/modules/builder-v2/__tests__/fixtures/testBlueprintFixtures.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testNodeFactory.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testCommandHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testSerializationHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testInspectorHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testResponsiveHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testWidgetHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testParityHarness.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testAssertions.ts`
- `apps/web-app/modules/builder-v2/__tests__/commands/history-transactions.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/serialization/blueprint-schema.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/serialization/save-reload-roundtrip.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/inspector/property-binding.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/responsive/device-specific-values.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/widgets/core-widgets-serialization.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/parity/canvas-runtime-contract.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/ai-compatibility/native-node-contract.test.ts`

## Files Modified

- `apps/web-app/tsconfig.builder.json`
- `docs/PROJECT_STATE.md`
- `docs/changelog/CHANGELOG.md`
- `docs/builder/BuilderRegressionPlan.md`
- `docs/builder/BuilderRegressionMatrix.md`

## Safety

No Builder runtime behavior changed. No routes, stores, widgets, canvas behavior, runtime rendering, feature flags, Website Engine behavior, ai-v9 files, AI wiring, Mapper execution, CommandBus mutation, or Builder node insertion changed.

## Verification

Command run:

```text
pnpm --dir apps/web-app typecheck:builder
```

Result: passed.

No runner tests were executed because no test runner is configured.
