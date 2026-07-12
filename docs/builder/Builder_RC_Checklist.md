# Builder RC Checklist

Updated: 2026-07-11

## RC-T0 — Baseline and Test Inventory

- [x] Repository test configuration and declared Builder scripts inspected.
- [x] Unit, integration, component, browser, visual, accessibility, performance, Blueprint fixture, stress fixture, widget, and rendering-parity areas inventoried.
- [x] All named RC source documents confirmed present.
- [x] Existing declared Builder validation command run: `pnpm --dir apps/web-app typecheck:builder` passed.
- [x] Baseline counts, environment assumptions, commands, gaps, and blockers recorded in `Builder_RC_Test_Baseline.md`.
- [x] Initial test matrix created in `Builder_RC_Test_Matrix.md`.
- [x] Initial defect register created in `Builder_RC_Defect_Register.md`.
- [x] No production code modified during baseline establishment.
- [ ] Executable Builder unit/integration/component runner configured (`BRC-0001`, P1).
- [ ] Playwright browser projects and visual regression configured (`BRC-0001`, P1).
- [ ] Accessibility and deterministic performance runners configured (`BRC-0001`, P1).

RC-T0 inventory status: **complete**. Executable validation baseline: **blocked**. RC-T1 must not be reported complete until the harness executes assertions rather than only compiling specification metadata.

## RC-T1 — Executable Harness, Blueprint and CommandBus

| Item | Status | Evidence |
| --- | --- | --- |
| Executable Builder harness established | Complete | `test:builder*` scripts and Node adapter |
| Failing assertion produces non-zero exit | Complete | Full run: 6 failures, exit 1 |
| Blueprint fixtures established | Complete | Existing deterministic fixtures reused and extended by native cases |
| Blueprint validation executable | Complete | 32/32 Blueprint-focused tests pass |
| Serialization round-trip executable | Complete | Stable repeated round trips covered |
| Migration tests executable | Blocked | No production migration/version API was discovered |
| CommandBus initialization executable | Complete | Invalid and repeated initialization covered |
| Insert/delete/duplicate/move/update executable | Complete | Production commands exercised through CommandBus |
| Style command executable | Complete | Existing style/clear/clipboard contracts execute |
| Copy/paste executable | Complete | Valid, invalid, undo, and redo paths execute |
| Wrap executable | Complete | Transaction sequence covers wrap |
| Unwrap executable | Not Applicable | No production unwrap command exists |
| Transaction integrity executable | Complete | Middle-step failure rolls back and leaves history clean |
| Undo/redo integrity executable | Complete | Exact state comparisons and redo invalidation covered |
| Deterministic repeated run verified | Complete | RC-T1 passed twice, 87/87 |
| Seeded randomized validation | Complete | Seed 41001, 50 validated operations |
| CI command documented | Complete | No CI workflow exists; integration command documented |
| BRC-0001 resolved | Complete | Closed with executable evidence |

RC-T1 status: **passed**. Six non-RC-T1 P2 failures remain visible in the all-Builder suite and are assigned to later phases.

## RC-T2 — Canvas and Layout

- [x] Mandatory canvas/layout baseline documented before RC-T2 production changes.
- [x] Existing full inventory reproduced: baseline 314/320.
- [x] `BRC-0003`, `BRC-0009`, `BRC-0010`, and `BRC-0011` fixed with executable regressions.
- [x] Dedicated `test:builder:rc-t2`, `test:builder:layout`, and `test:builder:canvas` scripts added.
- [x] RC-T2 Node suite passes 67/67; Builder typecheck passes.
- [x] Full inventory improved to 319/324; five known later-phase failures remain.
- [ ] Real-browser scrolling, transformed pointer geometry, sticky positioning, bounding boxes, and reviewed visual fixtures validated.
- [ ] Four Figma layout-fidelity fixtures reviewed across Builder, Preview, and Published.

RC-T2 status: **blocked at the browser/visual gate**. The available in-app browser was unavailable and the repository has no configured browser project; Node tests were not misrepresented as browser layout proof. RC-T3 has not started.

## RC-T3 — Builder Operations

- [x] Operations baseline and authoritative capability matrix documented before production changes.
- [x] Production commands, UI paths, direct mutation risks, DnD, clipboard, selection, transactions, and autosave inventoried.
- [x] RC-T3 Node suite passes 60/60; operations-only passes 5/5 twice.
- [x] Duplicate/paste expose created root IDs; duplicate browser selection and undo pass.
- [x] Active Builder store direct Blueprint replacement escape hatch removed.
- [x] Authenticated Chromium operation journey passes 2/2 including login setup.
- [x] Reviewed RC visual baseline passes.
- [x] Builder typecheck passes; full inventory 324/329 with five unchanged later-phase failures.
- [ ] Palette insert, delete, paste, wrap, cross-container move, and DnD validated through real UI.
- [ ] Persistence/reload validated for every launch-critical operation.
- [ ] Zoom/scroll/responsive DnD and keyboard focus safety validated.
- [ ] Isolated repeatable golden journeys and operation visual baselines completed.

RC-T3 status: **FAILED** because mandatory browser operation coverage is materially incomplete. RC-T4 has not started.

RC-T3F historical decision: **FAILED**. BRC-0016 was P1 and mandatory browser gates were incomplete.

RC-T3G: BRC-0016 closed; palette position matrix passes. **FAILED** on open P1 BRC-0018 before broader remaining gates.

## Widget, Marketplace, Default Design, and Theme Audit

- [x] All active Builder V2 registries and 48 registered widget types inventoried.
- [x] Twelve core widgets classified and required core gaps recorded.
- [x] Thirty-six premium-labelled widgets classified by actual behavior.
- [x] Static first-party marketplace architecture and 24/48 catalog drift audited.
- [x] Duplicate widget families, obsolete wrappers, and legacy registries identified.
- [x] Theme storage, normalization, resolution, Inspector, and render paths audited.
- [x] Existing semantic tokens and missing state/form/card/border tokens audited.
- [x] Default design quality classified for every registered type/family.
- [x] Typography scale/defaults audited; responsive core defaults updated.
- [x] Section/container/card/form spacing audited; responsive launch defaults specified.
- [x] Twelve target-industry coverage rows completed.
- [x] Launch decision matrix completed with scores, effort, dependencies and risks.
- [x] P0–P3 implementation backlog completed with acceptance criteria and tests.
- [x] Launch blockers identified: token/parser divergence, hardcoded premium internals, static interaction facsimiles, form runtime, catalog drift, entitlement enforcement, and parity/a11y coverage.

## Implementation gates (not complete merely because documented)

- [x] Core defaults use centralized semantic paths instead of widget-specific fixed colors.
- [x] Core heading/text/section/container/media defaults improved for responsive insertion.
- [x] Premium root defaults declare semantic surface/text/radius/responsive spacing.
- [x] Premium website UI uses active semantic theme palette, radius, border, and shadow values across all specialized views.
- [ ] Theme cascade and reset semantics implemented across site/page/section/container/widget/state. Central state/form/card tokens now exist; scoped cascade/reset remains.
- [ ] All launch widgets achieve at least 90/100 and pass parity/a11y tests.
- [x] Interactive premium widget paths provide working controls for accordion, tabs, carousel, lightbox, before/after, countdown, responsive navigation, forms, and popup.
- [ ] Forms have real required labeled fields and success/reset states; external platform submission routing remains.
- [x] Marketplace catalog exposes all 12 core and 36 registered premium widgets.
- [ ] Server-side tenant entitlement enforced at insert, save, and publish.
- [ ] Builder, Preview, and Published visual/semantic parity proven.
- [ ] AI insertion enabled only for widgets that pass launch gates.
# RC-T3E

- [x] Native handle and event contract documented
- [x] Active, over-target, inside, and valid states observable
- [x] Production save, persisted API state, and reload proven
- [x] Failure state and retry proven
- [x] Cleanup independent and leak sweeper returns zero
- [x] Three consecutive focused passes
- [ ] Remaining RC-T3C browser-operation gates
