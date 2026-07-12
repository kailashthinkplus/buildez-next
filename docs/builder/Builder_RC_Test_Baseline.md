# Builder RC Test Baseline

Date: 2026-07-11  
Phase: RC-T0 — Baseline and Test Inventory  
Repository: `/Users/kailash/buildez`

## Result

RC-T0 is complete. The Builder TypeScript validation passes, but the repository does not have an executable Builder unit, integration, component, browser, accessibility, visual-regression, or performance test runner. Production readiness cannot be inferred from the compile-safe specification files. Defect `BRC-0001` blocks the remaining RC evidence and the release decision.

## Environment assumptions

- macOS host, Asia/Kolkata timezone.
- Node.js `v26.0.0`.
- pnpm `11.8.0`.
- Dependencies were already installed; no dependency installation or lockfile mutation was performed.
- No database, application server, tenant credentials, storage service, publish target, or browser session was started for RC-T0.
- The worktree contained extensive pre-existing tracked and untracked changes. RC-T0 did not alter production code or those existing changes.

## Commands run

| Command | Purpose | Result |
| --- | --- | --- |
| `git status --short` | Establish worktree state before validation | Pass; dirty worktree recorded |
| `rg --files ...` and targeted `rg` inventory commands | Locate configuration, specs, fixtures, reports, and coverage tooling | Pass |
| `node --version` | Record runtime | `v26.0.0` |
| `pnpm --version` | Record package manager | `11.8.0` |
| `pnpm --dir apps/web-app typecheck:builder` | Compile Builder source and specification tree through `tsconfig.builder.json` | Pass, exit 0 |

## Test configuration inventory

| Area | Repository evidence | Baseline status |
| --- | --- | --- |
| Unit framework | No Vitest, Jest, Node test, or equivalent Builder runner/config/script | Missing |
| Integration framework | No Builder integration runner or script | Missing |
| Component tests | Compile-safe Inspector/canvas specs exist; no component runner or DOM environment | Missing executable coverage |
| Playwright | Transitive lockfile references exist, but no Builder dependency, config, script, or tests were found | Missing |
| Visual regression | Parity metadata/fixtures exist; no screenshot project or committed baseline convention found | Missing |
| Performance | Stress scenario metadata and budget helpers exist; no benchmark runner or reporter | Missing executable coverage |
| Accessibility | Accessibility contracts/critics exist; no axe/browser scan configuration | Missing executable coverage |
| Blueprint fixtures | `__tests__/fixtures/testBlueprintFixtures.ts` and helper factories | Present, compile-safe |
| Stress fixtures | Nine stress specification files plus large-Blueprint/performance helpers | Present, not executed |
| Widget tests | Nine widget specification files | Present, not executed |
| Rendering parity | Canvas/runtime and motion parity specifications/helpers | Present, not rendered or executed |

## Specification inventory

The tree `apps/web-app/modules/builder-v2/__tests__` contains 48 `*.test.ts` files and 202 `assertCondition(...)` descriptors. These files export specification objects and explicitly state future runner requirements; they are not registered with an executable test API.

| Group | Files |
| --- | ---: |
| AI compatibility | 1 |
| Canvas | 3 |
| Commands | 6 |
| Global policy | 1 |
| Inspector | 7 |
| Layers | 1 |
| Layout | 1 |
| Parity | 1 |
| Rendering | 1 |
| Responsive | 1 |
| Serialization | 3 |
| Stress | 9 |
| Theme | 3 |
| Widgets | 9 |
| Workspace | 1 |
| **Total** | **48** |

## Baseline counts

| Validation kind | Passed | Failed | Skipped | Flaky | Not run / blocked |
| --- | ---: | ---: | ---: | ---: | ---: |
| Builder TypeScript command | 1 | 0 | 0 | 0 | 0 |
| Executable unit/integration/component test cases | 0 | 0 | 0 | 0 | 202 descriptors |
| Playwright/browser tests | 0 | 0 | 0 | 0 | Entire area |
| Visual comparisons | 0 | 0 | 0 | 0 | Entire area |
| Accessibility scans | 0 | 0 | 0 | 0 | Entire area |
| Performance benchmarks | 0 | 0 | 0 | 0 | Entire area |

No flaky tests were observed because no executable test suite ran. No tests were reported as skipped by a runner; the descriptors are classified as **Not Run**, not skipped.

## Failures and environment issues

- `typecheck:builder` had no compiler failures.
- No test-run failure output exists because no runner is configured.
- Browser, publishing, persistence, and multi-tenant validation require services, fixtures, credentials, routes, and environment contracts that are not defined by a runnable RC harness.
- The current Node version is newer than typical production LTS deployments; the repository declares no `engines` contract or RC environment pin in `apps/web-app/package.json`.

## Missing coverage

- Executable Blueprint validation, migration, serialization, and CommandBus tests.
- Component-level canvas, drag/drop, history, Inspector, theme, widget, and responsive tests.
- API-backed autosave, recovery, publishing, rollback, cache, and tenant-isolation tests.
- Canonical Builder/Preview/Published DOM, style, interaction, and screenshot parity.
- Browser/device projects for Chrome, Safari/WebKit, Firefox, and Edge/Chromium.
- Automated accessibility scans and manual keyboard/screen-reader evidence.
- Deterministic measured performance and long-session memory tests.
- Figma reproduction fixtures and fidelity scoring.
- Flake detection, retries policy, artifacts, and CI execution.

## Source-document inventory

All eight explicitly named audit/checklist sources were present at RC-T0: the RC checklist, complete widget inventory, launch decision matrix, implementation backlog, default design audit, theme color audit, premium marketplace audit, and industry coverage report. Additional stabilization, Blueprint, CommandBus, parity, and AI documentation is present under `docs/builder` and `docs/implementation`.

## Immediate blockers

1. `BRC-0001` — no executable Builder RC test harness. This prevents trustworthy pass/fail/skipped/flaky counts and blocks every subsequent release-evidence workstream.
2. Browser-service and environment contracts for Preview, Published runtime, persistence, publishing, rollback, and tenant isolation are not configured as a reproducible test environment.
3. The dirty worktree must remain preserved and makes attribution of failures to a clean release candidate impossible until a specific candidate commit/state is identified.

## RC-T0 gate

Baseline inventory: **Pass**.  
Executable production-validation baseline: **Blocked**.  
Production code changed: **No**.  
Next phase: establish the executable test harness as part of RC-T1, then execute Blueprint and CommandBus integrity tests. Do not claim RC-T1 complete from compile-safe descriptors alone.

## RC-T1 baseline update

The RC-T0 blocker has been resolved. `apps/web-app` now exposes executable Node test commands using `tsx`. The focused RC-T1 run executed 87 tests and passed 87. The all-Builder run executed 320 tests: 314 passed and 6 later-phase assertions failed. Both infrastructure and assertion failures returned non-zero status. See `Builder_RC_Blueprint_CommandBus_Report.md` for reconciliation and scope decisions.
