# Builder RC Defect Register

Updated: 2026-07-11

This register is append-only for RC findings. A defect is recorded before any fix. “Open” means no production-readiness claim may rely on the affected evidence.

## BRC-0001 — Builder RC specifications have no executable test harness

| Field | Value |
| --- | --- |
| Defect ID | BRC-0001 |
| Title | Builder RC specifications have no executable test harness |
| Severity | P1 — Critical Launch Defect |
| Workstream | Test infrastructure / all RC validation workstreams |
| Reproduction steps | 1. Inspect `apps/web-app/package.json`. 2. Inspect the repository for Vitest/Jest/Playwright configuration and scripts. 3. Open any Builder `*.test.ts` file. 4. Run `pnpm --dir apps/web-app typecheck:builder`. |
| Expected behaviour | Builder test files are registered with executable unit/component/integration/browser runners that report cases, passes, failures, skips, flakes, artifacts, and exit non-zero on failed assertions. |
| Actual behaviour | The package exposes only `typecheck:builder`. The 48 test files export compile-safe specification objects containing 202 assertion descriptors and future runner notes; no runner executes them. No Builder Playwright, visual, accessibility, or performance configuration exists. |
| Affected files | `apps/web-app/package.json`, `apps/web-app/tsconfig.builder.json`, `apps/web-app/modules/builder-v2/__tests__/**/*.test.ts` |
| Affected widgets | All 48 registered launch widget types; none has executable RC evidence |
| Affected devices | All desktop, tablet, and mobile targets |
| Blueprint impact | Blueprint and command integrity assertions are not executable, so corruption prevention is unverified |
| Data-loss risk | Unknown/high validation risk: persistence, recovery, and destructive history paths cannot be certified |
| Publishing impact | Preview/published parity, publish lifecycle, rollback, and draft isolation are unverified |
| AI impact | AI command safety and post-sequence Blueprint validity are unverified |
| Root cause | Earlier BSP work intentionally created compile-safe regression metadata before choosing and integrating test runners; the runner integration was never completed |
| Fix status | Fixed |
| Regression test | Required: runner self-test proving a deliberately failing assertion causes non-zero exit, plus CI invocation of unit and browser projects |
| Verification result | Verified: RC-T1 87/87, full-suite failures return exit 1 |

## Summary

| Severity | Open | Fixed | Verified |
| --- | ---: | ---: | ---: |
| P0 | 0 | 0 | 0 |
| P1 | 0 | 7 | 7 |
| P2 | 5 | 1 | 1 |
| P3 | 0 | 0 | 0 |

Known defects from prior audit documents are not silently reclassified as new RC discoveries. They will receive RC IDs when reproduced in their applicable phase.

## BRC-0002 — Rejected and no-op commands pollute undo history

| Field | Value |
| --- | --- |
| Defect ID | BRC-0002 |
| Title | Rejected and no-op commands pollute undo history |
| Severity | P1 — Critical Launch Defect |
| Workstream | CommandBus / history integrity |
| Reproduction steps | Initialize `CommandBus`; execute an `InsertNodeCommand` with an incompatible parent/child relationship; inspect `canUndo()` and history metadata. |
| Expected behaviour | A rejected or unchanged command leaves Blueprint and history unchanged. |
| Actual behaviour | The command returns the unchanged Blueprint, but `CommandBus.execute` still pushes an undo snapshot. |
| Affected files | `core/commands/CommandBus.ts` |
| Affected widgets | Any operation rejected by a command implementation |
| Affected devices | All |
| Blueprint impact | Blueprint remains valid, but history no longer represents mutations accurately |
| Data-loss risk | Medium; undo can traverse phantom operations and mislead recovery behavior |
| Publishing impact | None direct |
| AI impact | High; rejected AI command plans can pollute subsequent undo behavior |
| Root cause | `CommandBus.execute` did not compare the validated result with the pre-command snapshot before recording history |
| Fix status | Fixed |
| Regression test | `rc-t1/commands/commandbus-integrity.test.ts` |
| Verification result | Verified by focused CommandBus and RC-T1 suites |

## RC-T1 deferred findings

The complete harness run exposed six executable failures outside RC-T1. They remain open and are not hidden from the all-Builder command.

| ID | Severity | Workstream | Actual failure | Target phase | Status |
| --- | --- | --- | --- | --- | --- |
| BRC-0003 | P2 | Layout | Equal-third numeric preset returns full precision instead of the asserted rounded value | RC-T2 | Fixed and verified |
| BRC-0004 | P2 | Rendering/motion | Horizontal parallax contract expected `0.2`, received `10` | RC-T9 | Open |
| BRC-0005 | P2 | Rendering/motion | Vertical parallax contract expected `0.15`, received `7.5` | RC-T9 | Open |
| BRC-0006 | P2 | Theme | Normalized theme still contains an undefined value | RC-T6 | Open |
| BRC-0007 | P2 | Widget/AI metadata | Popup widget is not gated as its contract requires | RC-T7/RC-T16 | Open |
| BRC-0008 | P2 | Widget Inspector | A layout widget lacks declared design controls | RC-T5/RC-T7 | Open |

`BRC-0001` status: **Closed and verified**. The Node test harness executes actual assertions, focused commands pass locally, and observed failures return exit code 1.

## BRC-0009 — Canvas width rewrites intentionally wide layout values

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T2 canvas boundaries / rendering parity |
| Reproduction | Resolve a node with `width: 1600px`, `minWidth: 1400`, and `canvasWidth: 1200` through `resolveRenderStyle`. |
| Expected | Builder and runtime retain the same semantic widths; the canvas scroll viewport makes wide content reachable. |
| Actual | Builder-oriented resolution rewrote both values to `100%`. |
| Root cause | `resolveRenderStyle` contained canvas-size clamping inside the shared semantic resolver. |
| Affected surfaces | Builder canvas; parity with Preview and Published |
| Fix status | Fixed and verified |
| Regression | `rc-t2/layout/layout-resolution.test.ts` |

## BRC-0010 — Builder viewport widths duplicate canonical responsive definitions

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T2 viewport simulation |
| Reproduction | Compare local numeric widths in `BuilderShell.tsx` with `RESPONSIVE_BREAKPOINTS`. |
| Expected | Builder device simulation consumes the canonical responsive device definition. |
| Actual | Desktop/tablet/mobile widths were repeated locally. |
| Root cause | Workspace implementation predated the canonical import. |
| Affected surfaces | Builder viewport simulation and responsive parity |
| Fix status | Fixed and verified |
| Regression | `rc-t2/layout/layout-resolution.test.ts` plus Builder typecheck |

## BRC-0011 — Canonical renderer silently drops supported layout fields

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T2 Flex/Grid/gap/overflow/rendering parity |
| Reproduction | Resolve responsive row/column gaps, Flex child sizing/order, Grid row/item placement, and overflow axes through `resolveRenderStyle`. |
| Expected | Valid schema values emit valid CSS on Builder, Preview, and Published paths. |
| Actual | The fields were absent from the returned style object. |
| Root cause | The shared resolver mapped only the original layout subset. |
| Affected surfaces | Builder, Preview, Published |
| Fix status | Fixed and verified |
| Regression | `rc-t2/layout/layout-resolution.test.ts` |

## BRC-0012 — Duplicate and paste leave selection on the source or target

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T3 operation selection integrity |
| Reproduction | Select a node, invoke duplicate or paste from BuilderShell, and inspect `useSelectionStore.selectedNodeId`. |
| Expected | The newly created root is selected so the Inspector, overlay, and next operation target the result. |
| Actual | Duplicate retains the original selection and paste retains the paste target; command APIs expose no created root ID. |
| Impact | A subsequent delete/style/move can affect the wrong node. |
| Root cause | Operation commands returned only a Blueprint and BuilderShell did not derive or receive the created node identity. |
| Fix status | Fixed and verified |
| Regression | `rc-t3/operations/operation-integrity.test.ts`; `playwright/tests/builder/operations/duplicate-selection.spec.ts` |

## BRC-0013 — Active Builder store exposes a direct Blueprint mutation escape hatch

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T3 CommandBus enforcement |
| Reproduction | Call `useBuilderStore.getState().setBlueprint(next)` from any production client path. |
| Expected | Editing mutations have no public store API that bypasses CommandBus validation and history. |
| Actual | `setBlueprint` directly replaces store state without validation, history, dirty revision, or CommandBus synchronization. |
| Impact | Future or accidental callers can create state divergence and persist unvalidated data. |
| Root cause | Transitional store API remained after CommandBus became canonical. |
| Fix status | Fixed and verified |
| Regression | `rc-t3/operations/commandbus-enforcement.test.ts` |

## BRC-0014 — Cross-container browser journey cannot complete deterministic save and cleanup

| Field | Value |
| --- | --- |
| Severity | P1 |
| Workstream | RC-T3C DnD persistence / browser infrastructure |
| Reproduction | Create the disposable fixture, native-drag Button A into Container B, verify parent and selection, then invoke the visible Save now control and reload. |
| Expected | Blueprint POST completes, reload preserves Container B parentage, and teardown soft-deletes the draft. |
| Actual | The retained journey currently fails before save. A headed trace proved fixed Builder chrome intercepted `dragTo` until the 45-second deadline; after closing the chrome, Chromium still did not produce a deterministic `inside` drop for the target geometry. The separate teardown hook deletes each failed-run draft without using the exhausted main-test deadline. |
| Trace | `test-results/...cross-container.../trace.zip` from RC-T3C focused run |
| Root cause | Combined infrastructure/product-observability issue. The original reported save hang was a masked DnD actionability timeout plus in-body cleanup using the remaining test deadline. Save itself also lacked a canonical DOM state and read render-closure state. Those save/cleanup defects are fixed, but the native DnD precondition remains nondeterministic, so end-to-end persistence is not yet proven. |
| Fix status | Fixed: real POST, API persistence, reload, failure/retry, independent cleanup, and three consecutive focused passes verified |
| Regression | `playwright/tests/builder/operations/cross-container.spec.ts` (passing three consecutive focused runs) |

## BRC-0015 — Native Chromium DnD target and completion nondeterminism

| Field | Value |
| --- | --- |
| Severity | P1 |
| Classification | Product event-lifecycle defect plus test handle/geometry defect |
| Reproduction | Drag selected Button A to non-empty Container B using native Chromium while target is partially visible. |
| Root cause | Test used editable content instead of the production move handle; stale/off-viewport release geometry and edge auto-scroll changed collision intent; Builder also cleared drag identity on pointerup before native completion. |
| Product impact | Valid real-user drags could cancel or resolve at an unintended sibling edge. |
| Fix | Real handle selector, observable active/over/intent/valid state, removal of premature pointerup cancellation, and live padding-lane sequencing. |
| Production files | `SelectionToolbar.tsx`, `BuilderShell.tsx` |
| Regression | `cross-container.spec.ts` and `builderDrag.ts` |
| Result | Fixed; three consecutive focused passes without retries |

## BRC-0016 — Empty-container palette drop inserts under a synthesized parent

| Field | Value |
| --- | --- |
| Severity | P1 |
| Classification | Product hierarchy/target-contract defect |
| Reproduction | Empty Container C, native-drag Heading from Blocks into it, and compare observed target with inserted parent. |
| Expected | Container C / inside / valid, with Heading as its only child. |
| Actual | Before fix, deleting the only child collapsed the fixture Container and native release occurred through fixed chrome onto Section C, whose correct hierarchy path generated a wrapper. |
| Impact | Visible palette target and resulting hierarchy disagree. |
| Root cause | Combined fixture and native-release geometry defect: the "empty Container" had no persistent target lane, and its wide left edge was occluded by palette chrome. The insertion planner also did not explicitly preserve a requested Container before its Section fallback. |
| Fix | Explicit Container/Column targets produce a one-step direct insertion; fixture Container C retains an empty-state lane; pointer release uses the visible target lane; `builder:drop-commit` proves the committed parent. |
| Regression | Node hierarchy insertion assertions plus `drag-insert.spec.ts` empty/non-empty browser scenarios |
| Evidence | Node RC-T3 62/62; empty Container browser pass with Container C as commit parent, save/API/reload; palette repeated runs passed with failure-safe teardown |
| Status | Fixed and closed |

## BRC-0017 — Builder operation keyboard shortcuts were absent

| Field | Value |
| --- | --- |
| Severity | P1 |
| Root cause | BuilderShell only handled fullscreen Escape. |
| Fix | Added CommandBus-backed delete, duplicate, copy, paste, undo, and redo with editable-control exclusion. |
| Regression | `playwright/tests/builder/operations/keyboard-focus.spec.ts` |
| Status | Fixed; focused authenticated browser regression passed |

## BRC-0018 — Invalid and Escape-cancelled DnD can retain a valid canvas drop

| Field | Value |
| --- | --- |
| Severity | P1 |
| Classification | Native DnD cancellation/occlusion defect |
| Reproduction | Start Button A from the production move handle, then press Escape or release over Builder header chrome. |
| Expected | No valid target, no mutation, no dirty/save request, unchanged hierarchy and history. |
| Actual | Escape path becomes dirty and autosaves; header path can retain Section A as the underlying valid target. |
| Regression | `playwright/tests/builder/operations/invalid-dnd.spec.ts` retained failing tests |
| Root cause | Split transient ownership allowed stale payload/target commit; collision scanning fell through chrome or dragged descendants; unchanged contenteditable blur emitted a phantom UpdateNodeCommand. |
| Fix | Unified active/cancelled/consumed session contract, final pointer target/intent/parent revalidation, chrome and dragged-subtree rejection, invalid-state clearing, and no-op inline text patch guard. |
| Node regressions | `drop-commit-safety.test.ts`, `inline-text-noop.test.ts` |
| Browser evidence | Escape, header, self, parent→descendant, and Section→widget invalid cases pass with clean state and unchanged API hierarchy. |
| Status | Fixed and closed |
