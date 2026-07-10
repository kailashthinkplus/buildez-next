# BSP-13 Widget & Inspector Modernization

Date: 2026-07-09  
Status: Implemented with compile-safe regression coverage  
Phase: Builder Bug Fix Sprint 7

## Objective

BSP-13 adds a widget capability and readiness foundation for production-quality manual Builder editing and future AI-generated editable nodes.

## Implementation Summary

Created metadata modules under `apps/web-app/modules/builder-v2/widgets/`:

- `widgetCapabilities.ts`
- `widgetModernization.ts`
- `widgetInspectorSupport.ts`
- `widgetSerializationSupport.ts`
- `widgetAiReadiness.ts`

The metadata covers every registered widget and scaffold-only entries for missing production widget categories.

## Registered Widgets Audited

Audited all registered core and premium widgets, including page, section, container, column, heading, text, button, image, video, icon, divider, spacer, and registered premium widgets.

## Widgets Scaffolded

Added scaffold-only metadata for accordion, tabs, carousel, testimonial, timeline, stats/counter, logo cloud, gallery/masonry, before-after, team, portfolio, form, table, embed/code block, map, social links, countdown, and popup/modal.

Scaffold widgets are not production-ready and are not registered as usable widgets.

## Inspector Modernization

Each capability declares:

- Supported inspector groups.
- Editable props.
- Editable styles.
- Responsive fields.
- Theme token fields.
- Motion-ready metadata.
- AI-readiness metadata only.

## Embed/Code Safety

Embed/code is scaffold-only and gated. Unsafe JS execution is not enabled in Builder, and automatic publish is not allowed by policy.

## Regression Coverage

Added compile-safe specs:

- `widgets/widget-capabilities.test.ts`
- `widgets/widget-modernization.test.ts`
- `widgets/widget-inspector-support.test.ts`
- `widgets/widget-serialization-support.test.ts`
- `widgets/widget-ai-readiness.test.ts`

## Verification

```bash
pnpm --dir apps/web-app typecheck:builder
```

Result: Passed.

No test runner script is configured in `apps/web-app/package.json`; BSP-13 tests are compile-safe regression specifications until a runner is added.

## Safety

- `ai-v9` untouched.
- AI generation not wired.
- Mapper not executed.
- No AI Builder nodes inserted.
- Feature flags unchanged.
- No opaque HTML/template blobs added.
- No unrelated Builder UI refactor.

## Remaining Risks

- Scaffold widgets still need real native editable implementations.
- Premium widgets remain blocked for AI readiness until native editability or locked-component policy is complete.
- Browser-level widget, inspector, accessibility, preview, and publish parity tests remain pending.
