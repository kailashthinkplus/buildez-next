# Builder Theme Color and Design Token Audit

Audit date: 2026-07-11

## Architecture found

`theme/theme.types.ts` defines a compact site token model; `defaultTheme.ts` normalizes it; `themePresets.ts` contains six first-party presets; `SiteThemeFrame.tsx` emits theme styling; `core/rendering/renderThemeResolver.ts` resolves published/render styles; `widgets/sdk/useWidget.ts` resolves canvas widget styles; Inspector color controls write local style values. Blueprint validation only confirms `theme.tokens` is an object.

The system is site-level. No explicit Page → Section → Container → Widget inheritance object or “reset to inherited/theme” state exists. Inheritance currently relies on CSS and absent local style keys. Responsive style values exist, but color inheritance and interaction-state overrides are not modeled consistently. Builder and render resolvers previously accepted different syntaxes; canvas widget resolution now accepts `theme.*`, legacy aliases, and `{theme.*}`.

## Token coverage

| Required area | Current token | Gap / decision |
| --- | --- | --- |
| Brand | `primary`, `accent` | Add secondary plus hover/active tokens or derived state policy |
| Surfaces | background, surface, surfaceAlt | Add elevated, muted, overlay and section semantic aliases |
| Text | textPrimary, textSecondary, primaryContrast | Add muted, inverse, link |
| Borders | border | Add subtle, strong, divider |
| States | none | Add success, warning, error, info, disabled, focusRing |
| Buttons | primary/secondary structures | Add hover/active/focus/disabled; do not hardcode in widget renderers |
| Forms | none | Add background, text, placeholder, border/focus/error/disabled |
| Cards | radius/shadow only | Add background/text/border/hover surface |
| Typography | two families, sizes h1–h3/body/small | Add h4–h6, weights, line heights, letter spacing, responsive scale |
| Spacing | four semantic numbers | Add bounded scale and mobile section/card/form/button defaults |
| Radius/shadow | button/card/media | Sufficient launch basis; add focus/elevation semantics, not arbitrary variants |

## Inheritance contract to implement

Site tokens are immutable defaults. Page/section/container may hold sparse semantic token overrides; widgets inherit the nearest value. A widget local override is stored explicitly and wins for that property/state. “Reset to inherited” removes the local key; “reset to site theme” removes the scoped override. Interaction states inherit from their base semantic component state unless explicitly overridden. Responsive values select the active breakpoint and then follow the same cascade. Preview and Published must use the identical resolver and serialized sparse overrides.

Dark/inverse treatment must be explicit (`colorMode: auto|light|dark|inverse`) or validated by contrast utilities; guessing from arbitrary background strings is unreliable. AI may choose tokens and scoped modes but should not scatter resolved hex values into nodes.

## Hardcoded-color findings

- `widgets/premium/ProductionWidgetView.tsx` contains fixed Slate/Blue/White/Amber/Emerald classes throughout its internal UI.
- Icon and Divider defaults contained fixed hex values; these defaults were changed to semantic paths.
- Theme presets legitimately contain literal palette definitions. Literal colors belong there, not in widget defaults.
- AI factories often materialize palette hex values into node styles. They should emit token references when the value represents a semantic theme role.
- Inspector UI chrome colors are application UI and are not website-theme violations.

## Parity and tests

Existing `__tests__/theme/theme-normalization.test.ts`, `theme-tokens.test.ts`, and `theme-panels.test.ts` cover normalization/metadata, not full cascade, interaction states, contrast, or Builder/Preview/Published snapshots. Add resolver conformance vectors shared by canvas and publish, dark/inverse contrast tests, sparse override serialization, reset behavior, and responsive-state tests.
