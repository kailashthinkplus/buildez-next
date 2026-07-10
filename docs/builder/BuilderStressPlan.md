# Builder Stress Plan

Date: 2026-07-08  
Phase: BSP-4 update  
Status: Compile-safe stress scaffold created; executable runner not configured yet

## Goal

Find Builder limits before AI can generate pages larger and more complex than normal manual authoring.

## Stress Dimensions

| Dimension | Target |
| --- | --- |
| Node count | 50, 100, 300, 500, 1000 |
| Nesting depth | 4, 8, 12, 20 |
| History depth | 25, 100, 250, 500 commands |
| Media nodes | 10, 50, 100 images/videos |
| Drag/drop | 100 repeated reorders and reparents |
| Inspector edits | 500 rapid property updates |
| Autosave | Repeated changes during save, preview, publish, and page switch |
| Responsive | Full per-device override matrix |
| Runtime | Preview and publish render for large pages |

## Metrics

- Builder load time.
- Command execution time.
- Undo/redo latency.
- Selection and hover latency.
- Drag frame stability.
- Save payload size.
- Save duration.
- Preview render time.
- Published render time.
- Memory growth during history use.
- React render count hotspots.

## Critical Scenarios

- AI-like 300 node page with theme tokens and responsive overrides.
- Deep nested layout with repeated containers and columns.
- Large page with many inline editable text nodes.
- Page with custom CSS, motion metadata, and background images.
- Repeated undo/redo after compound commands.

## Failure Thresholds To Define In BSP-2

- Max accepted command latency.
- Max accepted save payload.
- Max accepted preview open time.
- Max accepted memory growth.
- Max accepted drag latency.

## BSP-4 Scaffold

BSP-4 created `apps/web-app/modules/builder-v2/__tests__/stress/` and metadata-only stress helpers.

Created helper files:

- `testStressHarness.ts`
- `testLargeBlueprintFactory.ts`
- `testPerformanceBudget.ts`

Created stress specs:

- `large-blueprint-stress.test.ts`
- `deep-nesting-stress.test.ts`
- `large-undo-redo-stress.test.ts`
- `responsive-switching-stress.test.ts`
- `large-image-page-stress.test.ts`
- `section-duplication-stress.test.ts`
- `drag-drop-zoom-stress.test.ts`
- `save-reload-stress.test.ts`
- `ai-generated-page-stress.test.ts`

## BSP-4 Performance Budgets

| Budget | Node Count | Sections | Depth | Payload Bytes | Commands | History | Images | Render Risk | Inspector Risk |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| baseline100 | 100 | 25 | 8 | 350000 | 100 | 100 | 25 | medium | medium |
| aiLarge500 | 500 | 100 | 12 | 1750000 | 250 | 250 | 100 | high | high |
| extreme1000 | 1000 | 160 | 20 | 3500000 | 500 | 500 | 200 | critical | critical |

## Runner Requirement

No test runner is configured in `apps/web-app`. BSP-4 stress specs are compile-safe exported scenario metadata validated by `pnpm --dir apps/web-app typecheck:builder`.

Future stress execution requires a runner that can measure command latency, undo/redo latency, memory growth, serialized payload size, canvas render behavior, preview behavior, and published runtime behavior.

## BSP-1 Finding

Current architecture uses full blueprint cloning and unbounded history in `CommandBus.ts`; stress testing is mandatory before AI handoff.
