# Builder RC-T1 Blueprint and CommandBus Report

Date: 2026-07-11

## Framework and architecture

The canonical harness is Node's built-in `node:test`, with `tsx 4.21.0` for TypeScript loading. No competing unit framework or CI workflow existed. `createRegressionSpec` now adapts each eager boolean descriptor into a real assertion; empty specs and duplicate IDs within a module process are rejected. Native `node:test` files cover deeper RC-T1 state transitions. Each source file is loaded as an isolated test module to avoid global state leakage.

The harness is pure Node, deterministic, filterable by package scripts, readable in CI, and exits non-zero on failures. DOM/browser work remains assigned to later phases.

## Specification reconciliation

- Original inventory: 48 files and the RC-T0 descriptor count.
- Current inventory: 50 files after adding two native RC-T1 files.
- All original files are loaded by `test:builder`.
- Descriptor-based regression files are adapted to executable assertions.
- Nine stress files currently behave as static scenario modules under Node; measured stress execution remains deferred to RC-T14/RC-T17.
- Browser/React/rendered behavior statements execute only their pure contract assertions; rendered DOM claims remain deferred to their named RC phases.
- No obsolete file was removed. One clipboard assertion used an invalid assumption; its input was corrected to a genuinely incompatible page paste, with rationale in source.

## Executed results

| Suite | Tests | Passed | Failed | Skipped | Flaky |
| --- | ---: | ---: | ---: | ---: | ---: |
| Blueprint only | 32 | 32 | 0 | 0 | 0 |
| CommandBus only | 55 | 55 | 0 | 0 | 0 |
| RC-T1 combined | 87 | 87 | 0 | 0 | 0 |
| RC-T1 repeated run | 87 | 87 | 0 | 0 | 0 |
| Full Builder inventory | 320 | 314 | 6 | 0 | 0 observed |

The full-suite failures are `BRC-0003` through `BRC-0008` and belong to later layout, rendering, theme, Inspector, widget, and AI phases.

## Coverage

Blueprint tests cover valid shape, root type/existence, identity mismatch, missing links, orphaning, duplicate/multiple children, cycles, hierarchy, undefined array values, malformed JSON, responsive/theme preservation, deterministic serialization, and repeated round trips. No production migration registry/API was found, so migration-specific execution is blocked rather than fabricated.

CommandBus tests use production implementations for initialization, insert, delete, duplicate, move/reparent/reorder, update/style, clipboard, wrap, transactions, undo/redo, invalid results, duplicate IDs, exact snapshot restoration, redo invalidation, and post-operation validation. There is no production unwrap command. Seeded randomized update/undo/redo validation uses seed `41001` for 50 iterations.

## Defects

- `BRC-0001`: fixed and verified; executable harness exists.
- `BRC-0002`: fixed and verified; unchanged/rejected commands no longer create phantom history.
- `BRC-0003`–`BRC-0008`: open P2 later-phase findings; visible in `test:builder`.
- RC-T1 open P0/P1: zero.

## CI status and limitations

No `.github/workflows` or other repository CI configuration exists, so no pipeline was modified. CI should deterministically install with `pnpm install --frozen-lockfile`, then run the Builder typecheck and `test:builder:rc-t1`. Node 26 emits a `tsx` loader deprecation warning; it does not affect results. Browser, database, network, persistence, and publish infrastructure are intentionally absent from RC-T1.

## Commands

```sh
pnpm --dir apps/web-app typecheck:builder
pnpm --dir apps/web-app test:builder
pnpm --dir apps/web-app test:builder:rc-t1
pnpm --dir apps/web-app test:builder:blueprint
pnpm --dir apps/web-app test:builder:commands
pnpm --dir apps/web-app test:builder:watch
```

## RC-T1 PASSED

The executable harness works, all current-version Blueprint and production CommandBus integrity tests pass, transaction/history safety is verified, and no RC-T1 P0 or P1 remains. Migration coverage is blocked by the absence of a production migration contract; later-phase pure-contract failures remain documented and visible.
