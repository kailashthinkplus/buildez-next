# Builder RC-T3 Operations Report

Date: 2026-07-12

## Decision

## RC-T3 FAILED

Command integrity is strong, but the milestone requires substantially more real-browser evidence than was completed. DnD, cross-container movement, persistence/reload, keyboard focus safety, zoom/scroll/device operation targeting, composite journeys, and isolated golden journeys remain unverified.

## Delivered evidence

Commands inventoried: insert, delete, duplicate, update, reorder, reparent, copy/paste element, copy/paste style, wrap, visibility, lock, and responsive visibility. Unwrap and production multi-select operations are unsupported.

Five native RC-T3 tests were added. They cover CommandBus-only store architecture, duplicate/paste created-root identity, recursive semantic independence, unique IDs, delete/wrap/reparent validity and exact undo/redo, protected root delete, rejected cycles, invalid paste, and no rejected-operation history. One authenticated Chromium operation test duplicates a DOM-discovered leaf, proves the created node becomes selected, and undoes to the original node count.

Two P1 defects were fixed: BRC-0012 (duplicate/paste selection integrity) and BRC-0013 (direct store Blueprint replacement). RC-T3 remaining known P0: 0. Known reproduced RC-T3 P1: 0. Coverage blockers prevent a phase pass even without another reproduced P1.

## Execution

| Suite | Result |
| --- | --- |
| Existing commands baseline | 55/55 pass |
| RC-T3 Node | 60/60 pass |
| Operations only | 5/5 pass twice |
| Authenticated browser operations | 2/2 pass including setup |
| Reviewed general visual baseline | 2/2 pass including setup |
| Builder typecheck | Pass |
| Full Builder | 324/329 pass; 5 known later-phase failures |

Skipped: 0. Flaky observed: 0. New RC-T3 visual baselines: 0; the reviewed existing Builder baseline remained stable.

## Operation status

Insert, delete, duplicate, reorder, reparent, copy/paste, and wrap have passing Node command evidence. Duplicate has one real UI path. Unwrap and multi-select operations are unsupported. All other browser-level operation rows remain Partial or Blocked as recorded in the capability matrix. No unsafe test mutation endpoint was added and no destructive golden journey was run against user content.

RC-T4 was not started.

## RC-T3B isolation progress

The unsafe real-page testing blocker is resolved. Authenticated Playwright now creates a disposable draft through `POST /api/pages`, seeds or resets a deterministic 14-node fixture through the normal Blueprint save API, verifies Builder DOM structure, and soft-deletes the page through `DELETE /api/pages/:pageId` in `finally` cleanup. The executable reset journey deliberately duplicates a fixture heading, restores the canonical fixture through the production save contract, reloads, verifies the exact 14-node structure and cleared selection, and cleans up automatically. Result: 2/2 passed including authentication on a clean Chromium server.

This closes only the isolation/reset prerequisite. RC-T3 remains FAILED until the remaining DnD, persistence, keyboard, zoom/responsive, golden-journey, repeatability, and visual requirements execute successfully.
# RC-T3E update

Native Chromium cross-container DnD and production persistence are proven. Three consecutive focused runs and the failure/retry regression passed with zero leaked disposable pages. Remaining RC-T3C coverage may continue.

## RC-T3F completion checklist

- [ ] Palette insertion: non-empty, empty, first, last, persistence
- [ ] Native sibling reorder: boundary/middle/no-op, undo/redo, persistence
- [ ] Invalid and cancelled native DnD
- [ ] Scroll-, zoom-, and Desktop/Tablet/Mobile-aware targeting
- [ ] Canvas, inline editor, and Inspector keyboard focus safety
- [ ] Independent insert/duplicate/delete/reorder/move/copy-paste persistence
- [ ] Landing and nested-layout golden journeys
- [ ] Reviewed operation visual baselines
- [ ] Three DnD and two complete-suite repeatability runs with zero leaks
- [ ] Premium/composite journey, or explicit RC-T7 deferral from launch matrix
- Unsupported, not implementation work: unwrap, multi-select, cross-page clipboard

## RC-T3F final status

At the RC-T3F decision, RC-T3 remained failed and empty-container palette insertion was blocked by BRC-0016. Invalid/cancel, zoom, scroll, responsive, complete persistence, golden journeys, reviewed visuals, and twice-repeated full browser-suite evidence were incomplete.

## RC-T3G update

BRC-0016 is closed with Node and browser persistence evidence. Empty/non-empty/first/last palette insertion passes. RC-T3 remains failed because BRC-0018 invalid/cancelled DnD is an open P1; later geometry, persistence-matrix, journeys, visuals, and complete-suite repeatability remain gated.

## RC-T3H update

BRC-0018 is closed. Invalid and cancelled native DnD is atomic across Escape, Builder chrome, self, parent→descendant, and invalid hierarchy scenarios. Broader remaining RC-T3 gates were intentionally not resumed in this phase.
