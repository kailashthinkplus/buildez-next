# 2026-07-11 — Builder RC Widget, Marketplace, Theme Audit

## Work completed

- Audited the active Builder V2 registry, 48 definitions, Inspector/capability metadata, render paths, serialization/validation, CommandBus/clipboard/history, marketplace catalog/UI, theme system/presets, AI metadata, Website Engine, and legacy overlap.
- Created the complete inventory, marketplace audit, design-quality audit, theme audit, preset plan, industry coverage, launch matrix, and prioritized backlog.
- Added the authoritative Builder RC checklist and implementation record.
- Updated default design implementation without adding widget types: unified canvas widget token aliases/direct paths; moved core colors to semantic theme paths; added responsive typography/section/container defaults; improved button/media defaults; added semantic premium root defaults.

## Files changed

Code: `widgets/sdk/useWidget.ts`; defaults for button, heading, text, section, page, container, divider, icon, image, video; `widgets/premium/PremiumWidget.definition.ts`.

Documentation: all Builder RC widget/marketplace/theme documents dated 2026-07-11.

## Known blockers

Premium internal render views still contain fixed palette utilities. Interactive premium widgets are often static previews. Forms lack complete semantic/runtime behavior. Marketplace entitlements are metadata-only. Strict launch readiness remains zero until shared parity, accessibility, responsive, theme-state, and test gates pass.

## P0 follow-up implementation

- Passed active theme palette, contrast, surface, border, radius, and shadow values into the shared premium renderer.
- Converted the premium shared shell, header, cards, and form presentation to semantic theme variables.
- Replaced form-like divs with labeled native inputs/textarea and a semantic form/submit control; submission remains intentionally local until platform routing is defined.
- Marked gallery lightbox, tabs, masonry, carousel, before/after, countdown, and popup runtime capability as gated instead of production-ready.
- Added marketplace `available`/`preview` status. Smart Header, Lead Form, Gallery Lightbox, Floating WhatsApp, and Location Map remain visible but cannot be inserted from the curated marketplace.
- Removed the inaccurate marketplace “AI-ready” claim; the metric now reports insertable entries and explicitly says AI insertion is disabled.
- Added a compile-safe marketplace launch-gate specification and updated the production-widget capability specification.
- Expanded centralized theme normalization and metadata with semantic status/focus, form, and card tokens; presets inherit these defaults without widget-specific colors.

## Premium production UI correction

- Removed the preview-only insertion policy; all curated premium widgets are insertable.
- Replaced the generic production renderer with explicit rendering paths for all 36 premium widget types.
- Added working responsive navigation, accordion disclosure, ARIA tabs, lightbox dialog, carousel navigation, before/after range comparison, live countdown, native validated forms with success/reset state, and popup dialog with Escape dismissal.
- Added purpose-built professional layouts for hero, feature story/grid, offers, testimonials, pricing, stats, logo cloud, team, portfolio, timeline, location, social links, WhatsApp contact, CTA, footer, safe code/embed, editorial collections, comparison table, and categories.
- Reconciled marketplace discovery dynamically from the authoritative premium definitions: 48 total catalog items, including all 36 premium types.
- Kept restricted embed execution safe: provider metadata/code presentation is supported; arbitrary scripts and opaque HTML remain blocked.

## Premium visual-quality correction

- Replaced empty image-icon panels with local production-safe imagery from the existing theme demo asset library.
- Added image-led hero, gallery/lightbox, masonry, offers, team, portfolio, feature story, carousel, and editorial layouts.
- Added a varied semantic icon set for feature cards instead of numbered or generic placeholders.
- Reworked the footer from a flat text-color/black surface into a layered, theme-derived branded composition.
- Kept dark overlays only where they serve image legibility, modal backdrops, or code presentation.
- The in-app browser surface was unavailable during this pass, so visual screenshot approval remains to be performed when the local Builder preview is accessible.

## Premium element-level Design controls

- Added premium Design-tab sections for widget surface, eyebrow, title, body, primary CTA, featured media, and repeated cards.
- Added Google Font selection, font sizes/weights, line height, semantic color controls, CTA background/text/radius, media picker/URL/position/radius, and card surface/text/icon controls.
- Registered 24 element-level style fields in the authoritative premium widget schema so capability metadata, serialization, duplication, clipboard, and Inspector behavior share the same contract.
- New premium nodes default these fields to semantic theme references; local Inspector choices serialize as sparse node style overrides and are resolved by the existing theme-aware widget hook.
- Wired shared premium shells, hero typography/media, CTAs, feature cards, and media treatment to the element-level CSS variables.

## Motion runtime correction

- Added the shared MotionRuntimeEffects canvas/published execution layer.
- Normalized legacy premium motionPreset and advanced motion metadata into one runtime contract.
- Added viewport-triggered entrance playback, scroll and canvas-container parallax, hover/focus lift-scale-opacity transitions, pointer follow, sticky pinning, and reduced-motion handling.
- Added executable Inspector controls for trigger, hover lift/scale/opacity, mouse-follow strength, pin enablement, and pin offset.
- Added missing published rotate, blur, zoom, and luxury keyframes.
- Corrected canvas stagger selectors and retained published selectors across their different node data attributes.
- Added compile-safe motion parity regression coverage for legacy preset normalization, parallax, hover, mouse follow, and pin metadata.
