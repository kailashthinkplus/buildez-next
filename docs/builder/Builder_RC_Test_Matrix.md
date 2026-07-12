# Builder RC Test Matrix

Updated: 2026-07-11  
Status values: Not Run, Pass, Fail, Blocked, Flaky, Not Applicable.

This matrix begins with the RC-T0 inventory and phase gates. Scenario-level rows are added before execution in each phase; compile-safe assertion descriptors do not count as automated execution.

| test ID | workstream | feature | scenario | device | browser | automated | manual | expected result | actual result | status | defect ID | regression test | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RC-T0-001 | Baseline | Configuration | Inventory declared Builder validation scripts and framework configuration | N/A | N/A | Yes | Yes | All configured runners and projects identified | Only TypeScript validation is configured | Pass | BRC-0001 | N/A | Inventory complete |
| RC-T0-002 | Baseline | TypeScript | Run `pnpm --dir apps/web-app typecheck:builder` | N/A | N/A | Yes | No | Exit 0 | Exit 0 | Pass | — | N/A | One command passed; this is not test execution |
| RC-T0-003 | Baseline | Unit/integration tests | Execute existing Builder assertions | N/A | N/A | Yes | No | Runner reports test cases and assertions | No runner is configured; 202 descriptors were not executed | Blocked | BRC-0001 | Required | 48 compile-safe `*.test.ts` files |
| RC-T0-004 | Baseline | Browser tests | Inventory and execute Playwright projects | Desktop/tablet/mobile | Chrome/WebKit/Firefox/Edge | Yes | No | Projects execute with artifacts | No Builder Playwright config, script, or tests | Blocked | BRC-0001 | Required | Transitive lockfile references do not constitute setup |
| RC-T0-005 | Baseline | Visual regression | Locate and execute canonical visual baselines | All | All supported | Yes | Yes | Stable screenshots compare across three surfaces | No screenshot project/baselines found | Blocked | BRC-0001 | Required | Parity specs are metadata only |
| RC-T0-006 | Baseline | Accessibility | Locate and execute automated accessibility scans | All | All supported | Yes | Yes | Scan results and manual evidence recorded | No executable axe/browser setup | Blocked | BRC-0001 | Required | Accessibility source contracts exist |
| RC-T0-007 | Baseline | Performance | Locate and execute deterministic benchmarks | Desktop | Chrome | Yes | Yes | Actual timing/memory results recorded | Scenario metadata exists without a runner | Blocked | BRC-0001 | Required | No numbers invented |
| RC-T1-GATE | Blueprint/CommandBus | Phase gate | Execute complete RC-T1 suite | N/A | N/A | Yes | Yes | All supported commands and schema paths verified | Awaiting RC-T1 | Not Run | — | Required | Must resolve harness blocker first |
| RC-T1-001 | Harness | Failure propagation | Execute known failing full inventory | N/A | N/A | Yes | No | Non-zero exit on failure | 6 failures, exit 1 | Pass | BRC-0003–0008 | Adapter | Harness proven |
| RC-T1-002 | Blueprint | Validation/serialization | Run Blueprint-only suite | N/A | N/A | Yes | No | All executable contracts pass | 32/32 pass | Pass | — | Native plus adapted | No skips/flakes |
| RC-T1-003 | CommandBus | Commands/history | Run CommandBus-only suite | N/A | N/A | Yes | No | All executable contracts pass | 55/55 pass | Pass | BRC-0002 | Native plus adapted | No skips/flakes |
| RC-T1-004 | Blueprint/CommandBus | Focused gate | Run combined RC-T1 suite twice | N/A | N/A | Yes | No | Deterministic pass | 87/87 pass on both runs | Pass | — | Yes | Seed 41001 included |
| RC-T1-005 | Migration | Version migration | Execute production migration API | N/A | N/A | Yes | No | Supported migrations verified | No production migration API discovered | Blocked | — | Required when API exists | Does not invalidate current-version integrity result |
| RC-T2-GATE | Canvas/layout | Phase gate | Execute complete RC-T2 suite | All | All supported | Yes | Yes | Canvas/layout parity verified | Node RC-T2 67/67; real-browser gate unavailable | Blocked | — | Required | Browser layout/visual acceptance remains required |
| RC-T2-001 | Layout | Column ratios | Equal thirds serialize deterministically | All | N/A | Yes | No | Stable 33.333 values | Pass | Pass | BRC-0003 | `rc-t2/layout/layout-resolution.test.ts` | — |
| RC-T2-002 | Canvas/parity | Wide content | Canvas does not clamp semantic width/min-width | Desktop | N/A | Yes | No | Builder equals runtime; wide values retained | Pass | Pass | BRC-0009 | `rc-t2/layout/layout-resolution.test.ts` | — |
| RC-T2-003 | Responsive | Viewport definitions | Workspace consumes canonical device widths | All | N/A | Yes | No | 1200/768/390 canonical mapping | Pass | Pass | BRC-0010 | `rc-t2/layout/layout-resolution.test.ts` | — |
| RC-T2-004 | Layout/parity | Flex/Grid/gap/overflow | Shared resolver emits responsive supported fields | All | N/A | Yes | No | No supported property silently dropped | Pass | Pass | BRC-0011 | `rc-t2/layout/layout-resolution.test.ts` | — |
| RC-T2-005 | Browser | Scroll/sticky/pointer/visual parity | Execute real browser fixtures | All | Chrome | Yes | Yes | Actual browser geometry and reviewed images pass | In-app browser unavailable; no project harness configured | Blocked | — | Required | Node assertions are not substituted |
| RC-T3-GATE | Builder operations | Phase gate | Execute complete RC-T3 suite | All | Chromium | Yes | Yes | Operations and drag/drop verified | Node 60/60; one authenticated duplicate journey passes; required DnD/persistence/keyboard/golden journeys incomplete | Fail | — | Required | RC-T3 FAILED; RC-T4 not started |
| RC-T3-001 | Operations | Command integrity | Execute RC-T3 Node suite | N/A | N/A | Yes | No | All command invariants pass | 60/60 pass | Pass | BRC-0012/0013 | RC-T3 native tests | — |
| RC-T3-002 | Selection | Duplicate result | Duplicate leaf selects created ID and undo restores count | Desktop | Chromium | Yes | No | Created node selected; exact count restored | 2/2 including auth setup | Pass | BRC-0012 | Playwright operation test | No skips/flakes |
| RC-T3-003 | Architecture | CommandBus enforcement | Active store has no direct replace action | N/A | N/A | Yes | No | No mutation escape hatch | Pass | Pass | BRC-0013 | Static native assertion | — |
| RC-T3-004 | Browser | DnD/persistence/keyboard/golden journeys | Execute complete launch-critical operation matrix | All | Chromium | Yes | Yes | All required journeys pass | Materially incomplete | Fail | — | Required | Prevents RC-T3 pass |
| RC-T4-GATE | History/recovery | Phase gate | Execute complete RC-T4 suite | All | All supported | Yes | Yes | Undo/redo integrity verified | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T5-GATE | Inspector | Phase gate | Execute complete RC-T5 suite | All | All supported | Yes | Yes | Every visible control verified | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T6-GATE | Theme/defaults | Phase gate | Execute complete RC-T6 suite | All | All supported | Yes | Yes | Theme and defaults verified | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T7-GATE | Widgets | Phase gate | Execute complete RC-T7 suite | All | All supported | Yes | Yes | Every launch widget verified | Awaiting earlier phase | Not Run | — | Required | No widget may be skipped |
| RC-T8-GATE | Responsive | Phase gate | Execute complete RC-T8 suite | Desktop/tablet/mobile | All supported | Yes | Yes | Breakpoint behavior verified | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T9-GATE | Rendering parity | Phase gate | Execute complete RC-T9 suite | All | All supported | Yes | Yes | Builder = Preview = Published | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T10-GATE | Figma fidelity | Phase gate | Execute six sections and two pages | All | All supported | Yes | Yes | Professional fidelity without custom code | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T11-GATE | Persistence | Phase gate | Execute autosave/recovery suite | All | All supported | Yes | Yes | No data-loss path remains | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T12-GATE | Publishing | Phase gate | Execute publish lifecycle suite | All | All supported | Yes | Yes | Preview/published lifecycle verified | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T13-GATE | Accessibility | Phase gate | Execute automated and manual suite | All | All supported | Yes | Yes | No critical violation | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T14-GATE | Performance | Phase gate | Execute scale/long-session benchmarks | Desktop | Chrome | Yes | Yes | Actual budgets measured and met | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T15-GATE | Browser/device | Phase gate | Execute supported matrix | All | Chrome/Safari/Firefox/Edge | Yes | Yes | No browser P0/P1 | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T16-GATE | AI readiness | Phase gate | Execute AI command contract suite | N/A | N/A | Yes | Yes | Commands validated and undoable | Awaiting earlier phase | Not Run | — | Required | — |
| RC-T17-GATE | Stress | Phase gate | Execute seeded stress suite | All | Supported projects | Yes | Yes | No corruption or degradation | Awaiting earlier phase | Not Run | — | Required | — |
# RC-T3E evidence

Focused native DnD: 3/3 consecutive passes. Save failure/retry: pass. RC-T3 Node: 60/60. Operations: 5/5. Full inventory: 324/329 with the same five unrelated failures.
