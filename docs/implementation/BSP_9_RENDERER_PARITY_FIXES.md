# BSP-9 Renderer Parity Fixes

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-9  
Type: Bug fix sprint

## Objective

Fix parity blockers between Builder Canvas, runtime renderer, Preview, and Published output by introducing shared render contracts and shared style resolution.

## Bugs Addressed

- BUG-0025 publish parity: partially addressed with shared render contract and contract-level preview/publish parity validation.
- BUG-0026 preview parity: partially addressed with shared style/theme/responsive resolution.
- BUG-0039 canvas/runtime renderer drift: partially addressed by moving common style/container resolution into `core/rendering`.
- Related responsive/style/theme parity risks: addressed through shared responsive and theme token resolution.

## Rendering Contracts Added

Created `apps/web-app/modules/builder-v2/core/rendering/`:

- `renderContract.ts`
- `renderStyleResolver.ts`
- `renderResponsiveResolver.ts`
- `renderThemeResolver.ts`
- `renderWidgetResolver.ts`
- `renderParityValidation.ts`
- `index.ts`

## Shared Style Resolution

Canvas and runtime now share resolver logic for:

- responsive values
- theme token aliases
- colors
- spacing and sizing
- borders and shadows
- container width mode
- unsupported/native widget contract metadata
- style cleanup and box shorthand conflict handling

Canvas still applies canvas-only scaling and editing overlays. Runtime still applies runtime-only motion CSS, keyframes, and published wrapper behavior.

## Widget Parity

Native parity contract coverage now includes:

- page
- section
- container
- column
- heading
- text
- button
- image
- video
- icon
- divider
- spacer

Unsupported widgets are explicitly identified by the contract rather than silently treated as native parity-safe.

## Regression Coverage

Updated compile-safe specs:

- `apps/web-app/modules/builder-v2/__tests__/parity/canvas-runtime-contract.test.ts`
- `apps/web-app/modules/builder-v2/__tests__/helpers/testParityHarness.ts`

Coverage includes same-node style parity, responsive style parity, theme token parity, unsupported widget handling, missing asset handling, preview/publish contract parity, and builder-only overlay leakage checks.

## Limits

No route changes were made. Preview and publish route consumption is validated at contract level only. Full release gate confidence still requires executable browser snapshots for canvas, preview, and published output.

No test runner is configured in `apps/web-app`; BSP-9 ran Builder typecheck and compile-safe regression specs only.

## Verification

Command run:

```text
pnpm --dir apps/web-app typecheck:builder
```

Result: passed.

## Safety

No `ai-v9` files changed. AI generation was not wired. Mapper was not executed. No AI Builder nodes were inserted. Feature flags remain false. No unrelated Builder UI was refactored.
