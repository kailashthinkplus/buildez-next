# BSP-15 Production Widget Library

Date: 2026-07-09  
Status: Implemented with compile-safe regression coverage

## Objective

Convert scaffolded widget metadata into native editable Builder widgets that can support future high-quality AI-generated websites after release gates pass.

## Implemented

- Extended Builder `NodeType` with the BSP-15 production widget catalog.
- Added registered native definitions for accordion, tabs, stats, logo cloud, masonry gallery, team, portfolio, timeline, feature grid, contact form, social links, carousel, before/after, table, countdown, code block, restricted embed, popup metadata, blog grid, post list, and category list.
- Added production React rendering for the expanded widget catalog through `ProductionWidgetView`.
- Updated canvas and runtime fallback rendering to use the same production widget view for parity.
- Updated widget capability metadata so production widgets are no longer scaffold-only or blocked preview widgets.
- Kept AI insertion disabled and marked restricted embed/popup metadata as gated.
- Added compile-safe regression specs for production widget library and serialization contracts.

## Safety

- `ai-v9` untouched.
- AI generation not wired.
- Mapper not executed.
- No AI Builder nodes inserted.
- Feature flags unchanged.
- No opaque HTML/template widgets added.
- Embed/code does not execute scripts.
- Popup remains metadata-only.

## Verification

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

No test runner is configured; BSP-15 regression files are compile-safe specs.
