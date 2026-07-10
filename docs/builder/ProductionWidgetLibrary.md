# Production Widget Library

Date: 2026-07-09  
Phase: BSP-15  
Status: Implemented with compile-safe regression coverage

## What Changed

BSP-15 registers the production widget catalog through the existing Builder widget registry and renders those widgets through native React views that expose editable Builder props/styles. The implementation uses the existing `PremiumWidgetDefinitions` path rather than creating a second widget system.

## Native Editability Contract

Every production widget declares:

- Editable content regions: `eyebrow`, `title`, `body`, `primaryCta`, `secondaryCta`, and `items`.
- Editable design controls: background color, text color, border radius, padding, and gap.
- Advanced metadata: accessibility label.
- Responsive metadata: responsive spacing/gap and mobile visibility metadata.
- Theme token support: color, radius, spacing, and gap metadata.
- Motion metadata: metadata-only motion preset, with no runtime animation execution.
- Clipboard and undo/redo support: native node command contracts.
- Serialization: native Builder node shape with `type`, `children`, `props`, and `style`.
- Runtime parity: canvas and runtime share the same production widget renderer.
- AI metadata: readiness is explicit, but AI insertion remains disabled.

## Safety Exceptions

`embed` is registered as a restricted native widget. It renders a safe placeholder/text view and carries a safety warning. It does not execute scripts, inline HTML, or opaque templates.

`popupModal` is registered as metadata-only and gated. Runtime popup execution, triggers, focus trap, escape behavior, and publish readiness remain out of scope for BSP-15.

## Regression Coverage

Compile-safe specs were added for:

- Production widget library contracts.
- Production widget serialization contracts.
- Existing widget modernization baseline.
- Existing widget AI readiness metadata.

No test runner is configured yet, so these specs compile and can be connected to the future regression runner.
