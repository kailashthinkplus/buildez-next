# Builder RC-T2 Canvas and Layout Report

Date: 2026-07-11

RC-T2 established a 67-test executable Node gate and fixed four reproduced layout defects. Equal column ratios are deterministic; intentionally wide content is no longer rewritten by the canvas; workspace device widths use the canonical responsive map; and the shared Builder/Preview/Published resolver now emits responsive row/column gaps, Flex child sizing/order, Grid row/item placement, and per-axis overflow.

Verification:

- `pnpm --dir apps/web-app test:builder:rc-t2`: 67/67 passed.
- `pnpm --dir apps/web-app typecheck:builder`: passed.
- `pnpm --dir apps/web-app test:builder`: 319/324 passed. The five failures are the already deferred RC-T6/RC-T7/RC-T9/RC-T16 findings; the RC-T2 `BRC-0003` failure is closed.

The real-browser gate could not execute because the in-app browser was unavailable and no Playwright/browser project exists in the repository. Consequently, actual scrolling, sticky behavior, transformed pointer coordinates, bounding boxes, screenshot parity, and the four manual Figma fidelity compositions are not approved. RC-T2 is blocked rather than passed, and RC-T3 was not started.
