# Builder RC-T2 Canvas and Layout Baseline

Date: 2026-07-11  
Phase boundary: RC-T2 only  
Status at baseline: failing; production code had not been changed by RC-T2 when this document was created.

## Files and architecture inspected

The inventory covered `modules/builder-v2/canvas`, `workspace/BuilderShell.tsx`, the Builder stores, `core/rendering`, `core/responsive`, Section/Container/Column widgets and defaults, Inspector layout controls, `layout/columnStructure.ts`, `runtime/PublishedPageRenderer.tsx`, preview and published routes, and all existing canvas/layout/responsive/parity tests. The RC checklist, defect register, test matrix, and RC-T1 report were also inspected.

The active Builder path is `BuilderRoot -> BuilderProvider -> BuilderShell -> BuilderCanvas -> canvas/NodeRenderer`. `BuilderShell` owns the scroll viewport and reads zoom/device state from the canonical Builder `useCanvasStore`; it calculates fixed device width, scaled content dimensions, and workspace chrome offsets. The separate `canvas/viewport/Viewport.tsx` and `canvas/store/useViewportStore.ts` pair is stale and internally inconsistent, and is not on the active render path.

Preview (`app/preview/.../page.tsx`) and Published (`app/(runtime)/[...slug]/page.tsx`) both use `runtime/PublishedPageRenderer.tsx`. Builder NodeRenderer and PublishedPageRenderer share `resolveRenderStyle`, `getRenderContainerWidthStyle`, and `getRenderSectionContentWidthStyle`. Responsive values resolve through `core/rendering/renderResponsiveResolver.ts` and `core/responsive`; canonical device widths are declared in `responsiveBreakpoints.ts`.

Expected width architecture is already explicit: Page and outer Section are full bleed; the Section content wrapper owns boxed/full width; a direct child Container fills that wrapper; nested Containers retain independent width constraints. Builder and runtime must pass the same semantic style values into the shared resolver.

## Baseline commands and results

| Command | Result |
| --- | --- |
| `pnpm --dir apps/web-app typecheck:builder` | Pass, exit 0 |
| `pnpm --dir apps/web-app test:builder` | 320 executed; 314 pass, 6 fail, 0 skip |

The attempted name-filter invocation was reconciled against the package script: its argument placement caused the complete inventory to run, so the only claimed count is the observed complete 320-test result. Existing executable layout-related contracts passed for canvas backgrounds, canvas metadata, Section/Container width architecture (21 assertions), responsive values (9), canvas/runtime pure style parity (10), alignment controls, unit parsing, and workspace fullscreen metadata.

## RC-T1 deferred failures mapped to RC-T2

- `BRC-0003` is RC-T2: `normalizeColumnWidths(3)[0]` returns `33.333333333333336`; the executable contract expects deterministic `33.333` serialization.
- `BRC-0008` concerns a layout widget's Inspector metadata but is assigned to RC-T5/RC-T7. It does not prove a layout rendering defect and remains deferred.
- `BRC-0004` and `BRC-0005` are motion rendering contracts assigned to RC-T9.
- `BRC-0006` is theme normalization assigned to RC-T6.
- `BRC-0007` is widget/AI gating assigned to RC-T7/RC-T16.

## Missing coverage at baseline

No executable RC-T2 suite or dedicated scripts existed. Pure coverage was missing for zoom bounds/coordinate transforms, scaled scroll extents, canonical viewport mapping, row/column gaps, Flex/Grid value emission, sizing units, overflow/position/z-index, deep responsive nesting, representative parity fixtures, and deterministic layout performance. There was no configured browser runner, so real scrolling, sticky behavior, bounding boxes, pointer mapping, or screenshot parity had not been production-validated and must not be claimed from Node descriptors.

## Initial defects and parity risks

- `BRC-0003` (P2, open at baseline): nondeterministic full-precision equal-column output.
- `BRC-0009` (candidate P1): `resolveRenderStyle` rewrites oversized pixel `width` and `minWidth` to `100%` when `canvasWidth` is supplied. This is a semantic Builder/runtime parity risk and can make intentionally wide content unreachable instead of scrollable.
- `BRC-0010` (candidate P1): viewport/device widths in the active workspace use local constants/fallbacks rather than importing `RESPONSIVE_BREAKPOINTS`, risking simulation/runtime breakpoint drift.
- `BRC-0011` (candidate P1): the shared style resolver does not emit several layout fields represented by the schema/RC contract, notably row/column gap and common Grid/Flex child properties; Inspector values may therefore be silently dropped.
- `BRC-0012` (candidate P2): the unused viewport component imports a nonexistent store symbol and expects a different state shape, creating a dangerous stale compatibility path.

Browser-only acceptance remains blocked pending a minimal real-browser harness or a documented environment limitation. RC-T2 cannot claim visual approval from this baseline.
