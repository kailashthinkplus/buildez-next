# BSP-8 Responsive Architecture and Inspector Binding Fixes

Date: 2026-07-08  
Program: Builder Stabilization Program  
Phase: BSP-8  
Type: Bug fix sprint

## Objective

Fix critical Builder blockers around device-specific responsive values, responsive preview/control correctness, inspector controls that do nothing, and property binding proof.

## Bugs Addressed

- BUG-0002 responsive controls: partially addressed with a shared responsive model and inspector controls tied to the active canvas device.
- BUG-0019 responsive preview: partially addressed by making canvas style resolution use the same responsive resolver as inspector updates.
- BUG-0007 inspector controls doing nothing: partially addressed with property binding validation and hiding unsupported registry controls.
- Related property binding and responsive override risks: addressed through compile-safe regression specs.

## Responsive Model Added

Created `apps/web-app/modules/builder-v2/core/responsive/`:

- `responsiveTypes.ts`
- `responsiveValue.ts`
- `responsiveBreakpoints.ts`
- `responsiveResolver.ts`
- `responsiveUpdate.ts`
- `responsiveValidation.ts`
- `index.ts`

The model supports base, desktop, tablet, and mobile values; breakpoint override resolution; inheritance from desktop to tablet to mobile; explicit override detection; and reset override behavior.

## Inspector Behavior

- Design tab now uses the shared canvas `device` state instead of local inspector-only state.
- Advanced tab responsive controls now use the shared canvas `device` state.
- Desktop edits base/desktop values.
- Tablet edits tablet overrides.
- Mobile edits mobile overrides.
- Device controls expose inherited/override status.
- Reset override is available for non-desktop style overrides.

## Canvas Behavior

Canvas responsive style resolution now uses the shared responsive resolver. Tablet falls back to desktop/base; mobile falls back to tablet, then desktop/base.

## Property Binding Proof

Added:

- `core/properties/propertyBindingRegistry.ts`
- `core/properties/propertyBindingValidation.ts`
- `core/properties/propertyUpdatePipeline.ts`

Visible registry controls now resolve to real `props.*` or `style.*` paths. Unsupported property types are hidden by the registry renderer instead of appearing as inert controls.

## Regression Coverage

Updated compile-safe specs:

- `responsive/device-specific-values.test.ts`
- `inspector/property-binding.test.ts`
- `helpers/testResponsiveHarness.ts`
- `helpers/testInspectorHarness.ts`

Coverage includes desktop/tablet/mobile divergence, tablet inheritance, mobile inheritance, override reset, active-device-only inspector updates, visible binding validation, unsupported control hiding, and property path updates.

## Limits

No browser/component test runner is configured, so responsive preview and rendered inspector behavior are compile-safe specs only. Full release gate confidence still requires executable component/browser coverage.

## Verification

Command run:

```text
pnpm --dir apps/web-app typecheck:builder
```

Result: passed.

## Safety

No `ai-v9` files changed. AI generation was not wired. Mapper was not executed. No AI Builder nodes were inserted. Feature flags remain false. No unrelated Builder UI was refactored.
