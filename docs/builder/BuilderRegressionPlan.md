# Builder Regression Plan

Date: 2026-07-08  
Phase: BSP-3 update  
Status: Compile-safe scaffold created; executable runner not configured yet

## Goal

Create a repeatable regression suite that proves native Builder edits are stable before AI generation is allowed to create editable Builder nodes.

## Required Regression Areas

1. Canvas selection, hover, nested selection, lock/visibility, and empty states.
2. Drag/drop insert, reorder, reparent, invalid drops, and block-menu drops.
3. Resize handles and dimension editing once resize is stabilized.
4. Inspector content controls for every registered widget.
5. Inspector style controls for every rendered style property.
6. Inspector advanced controls for responsive, accessibility, SEO, motion, custom CSS, and visibility.
7. Responsive editing across desktop, tablet, and mobile.
8. CommandBus undo/redo for every command.
9. Compound command transaction behavior.
10. Clipboard copy/paste node and copy/paste style.
11. Layers selection, sorting, lock/visibility, and naming.
12. Serialization round-trip, invalid payload rejection, migrations, and history.
13. Autosave, manual save, page switch, preview, and publish race conditions.
14. Preview parity and published runtime parity.
15. Accessibility and keyboard navigation.

## BSP-3 Scaffold

BSP-3 created the initial regression tree under `apps/web-app/modules/builder-v2/__tests__/`.

Created scaffold areas:

- `fixtures`
- `helpers`
- `commands`
- `serialization`
- `inspector`
- `responsive`
- `widgets`
- `parity`
- `ai-compatibility`

Created harness files:

- `testBlueprintFixtures.ts`
- `testNodeFactory.ts`
- `testCommandHarness.ts`
- `testSerializationHarness.ts`
- `testInspectorHarness.ts`
- `testResponsiveHarness.ts`
- `testWidgetHarness.ts`
- `testParityHarness.ts`
- `testAssertions.ts`

Created initial specs:

- `commands/history-transactions.test.ts`
- `serialization/blueprint-schema.test.ts`
- `serialization/save-reload-roundtrip.test.ts`
- `inspector/property-binding.test.ts`
- `responsive/device-specific-values.test.ts`
- `widgets/core-widgets-serialization.test.ts`
- `parity/canvas-runtime-contract.test.ts`
- `ai-compatibility/native-node-contract.test.ts`

## Runner Requirement

No test runner is configured in `apps/web-app`. BSP-3 specs are compile-safe exported regression specifications validated by `pnpm --dir apps/web-app typecheck:builder`.

Future work must choose and configure:

- A unit/contract runner for pure TypeScript tests.
- A component runner for inspector/canvas interaction.
- A browser runner for preview, publish, accessibility, and parity.
- A stress runner for performance budgets.

## Minimum Test Matrix

| Area | Desktop | Tablet | Mobile | Canvas | Preview | Publish |
| --- | --- | --- | --- | --- | --- | --- |
| Basic widgets | Required | Required | Required | Required | Required | Required |
| Layout widgets | Required | Required | Required | Required | Required | Required |
| Premium widgets | Required | Required | Required | Required | Required | Required |
| Theme tokens | Required | Required | Required | Required | Required | Required |
| Motion | Required | Required | Required | Required | Required | Required |
| Clipboard | Required | Optional | Optional | Required | N/A | N/A |
| Layers | Required | Optional | Optional | Required | N/A | N/A |

## Regression Fixtures

- Empty page.
- Primitive page with section/container/column/text/button/image/video/icon/divider/spacer.
- Deep nested layout with at least 8 levels.
- Wide page with 100 nodes.
- Large AI-like page with 300+ nodes.
- Header/footer page.
- Token-heavy theme page.
- Responsive-heavy page with divergent desktop/tablet/mobile values.
- Media-heavy page.
- Premium-widget page.
- Invalid blueprint payloads.

## Entry Criteria

- Builder typecheck passes.
- Bug database P0/P1 issues are either fixed or explicitly covered by failing tests.
- Schema validator exists.
- Test fixtures are deterministic.

## Exit Criteria

- No blocker or critical regression failures.
- Canvas, inspector, serialization, responsive, history, and preview/publish parity tests pass.
- Regression suite is runnable locally and in CI.
