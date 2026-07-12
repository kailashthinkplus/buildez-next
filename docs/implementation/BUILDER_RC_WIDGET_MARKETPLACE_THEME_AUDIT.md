# Builder RC Widget, Marketplace, and Theme Audit Implementation Record

Date: 2026-07-11

## Outcome

The active Builder V2 has 48 registered widgets (12 core and 36 premium-labelled), one executable widget registry, and a separate static marketplace catalog with only 24 records. The audit documents actual behavior rather than registry claims: several premium names render static previews, the premium family shares one generic schema/renderer, AI insertion is disabled, and no installable third-party widget marketplace exists.

The implementation portion improves core insertion defaults and begins semantic theme alignment without adding widgets or parallel architecture. `widgets/sdk/useWidget.ts` now accepts the same direct theme paths and legacy aliases used elsewhere. Page, Section, Container, Heading, Text, Button, Image, Video, Icon, and Divider defaults now use semantic theme references and/or responsive professional defaults. Premium root defaults now use semantic surface/text/radius and responsive spacing.

## Authoritative evidence

- Registry and definitions: `widgets/registerWidgets.ts`, `core/registry/WidgetRegistry.ts`, `widgets/premium/PremiumWidget.definition.ts`.
- Rendering: `canvas/NodeRenderer.tsx`, `widgets/*/*.tsx`, `widgets/premium/ProductionWidgetView.tsx`, core rendering resolvers, Website Engine parity modules.
- Inspector/capabilities: PropertyRegistry, definition schemas, `widgetCapabilities.ts`, `widgetInspectorSupport.ts`.
- Serialization/actions: Blueprint schema/repair, CommandBus, clipboard commands, duplicate command, history.
- Marketplace: `marketplace/ElementMarketplaceRegistry.ts`, `firstPartyElements.ts`, modal and BlockMenu.
- Theme: theme types/defaults/presets/frame/metadata plus canvas/render resolvers.

## Measured baseline

- Registered widgets: 48; core 12; premium-labelled 36.
- Marketplace candidates represented today: 12 premium; 24 additional registered premium types need an explicit catalog/gate decision.
- Industry-specific native types: 0; generic premium types have industry tags/use cases.
- Strict launch-ready (90+): 0; minor-work candidates: 7; major-work/partial: 35; not-launch-ready/gated: 6.
- Missing complete semantic theme support: 48; premium types with hardcoded internal palette: 36.
- Missing complete Inspector behavior: 0 definition schemas, but all 36 premium schemas are generic rather than use-case-complete.
- Missing advertised runtime behavior: galleryLightbox, tabs, masonryGallery, carousel, beforeAfter, countdown, popupModal; forms/maps are also runtime-partial.
- Missing complete responsive support: 48 (metadata exists broadly; interaction/layout proof does not).
- Missing AI insertion readiness: 48 (`canAIInsert` is false by policy).

## Next phase

Execute backlog WTA-001 through WTA-010 as the next implementation phase: semantic resolver parity and expanded state tokens; remove premium hardcoded internal website colors; gate incomplete interactions; implement accessible forms; reconcile marketplace metadata; enforce server-side entitlement; and establish Builder/Preview/Published parity plus core accessibility/responsive tests.

### P0 progress

The follow-up phase completed the first safe slice of WTA-002, WTA-004, and WTA-005. Premium shared surfaces now consume the active theme; forms use native labeled controls; incomplete interaction types report gated capability; and preview-only curated marketplace entries cannot insert. Server submission, specialized premium-view color conversion, expanded state tokens, catalog expansion, entitlement enforcement, and executable parity/a11y suites remain open.
