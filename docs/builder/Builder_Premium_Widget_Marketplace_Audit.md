# Builder Premium Widget Marketplace Audit

Audit date: 2026-07-11

## Current implementation

The marketplace is a static first-party catalog, not an installable package marketplace. `marketplace/ElementMarketplaceRegistry.ts` registers `firstPartyElements.ts` at module load. `WidgetMarketplaceModal.tsx` provides client-side discovery and plan-lock presentation; `BlockMenu.tsx` opens it. The actual runtime registry remains `core/registry/WidgetRegistry.ts` via `widgets/registerWidgets.ts`.

There are 24 catalog records (12 core, 12 premium) but 48 widget definitions (12 core, 36 premium). Therefore 24 registered premium types are invisible to marketplace metadata. `allowedPlans` and `requiredFeature` are descriptive client metadata; no audited tenant entitlement or activation enforcement connects them to registration/render/publish.

No widget package model, manifest, signature verification, installation record, activation state, dependency resolver, permissions system, migration registry, update/uninstall/rollback flow, ratings, review workflow, or widget-specific billing/licensing route was found in active Builder code or Prisma models. Theme marketplace UI and platform app-marketplace navigation are separate products and must not be treated as widget-marketplace infrastructure.

## Launch decision

Launch a curated first-party premium catalog only. Do not execute arbitrary uploaded JavaScript, HTML, React, CSS, migrations, or remote modules in Builder/Preview/Published runtime. “Install” at launch should mean enabling a platform-shipped manifest and registered renderer already included in the deployed release.

The launch manifest must declare immutable ID, widget type, version, publisher, tier/feature, category/tags, allowed plans, property schema, responsive fields, semantic theme bindings, allowed parents/children, accessibility contract, render target support, Blueprint schema version, migration ID, asset allowlist, permissions, AI guidance, and test evidence. Registration must reject unknown types, duplicate IDs, undeclared capabilities, opaque output, executable embed content, and incompatible Blueprint versions.

## Reusable architecture

- Reuse `WidgetRegistry` as the only executable definition registry.
- Extend `ElementCatalogItem` rather than introduce a parallel discovery model.
- Reuse `WidgetProperty`, capability/Inspector/serialization/AI metadata, Blueprint validation, CommandBus, and renderer parity checks.
- Reuse plan concepts only after server-side entitlement enforcement is added; never trust `allowedPlans` in the modal.

## Requirements and risks

| Phase | Requirement | Risk controlled |
| --- | --- | --- |
| P0 launch | Reconcile all catalog types with registered types; server-side entitlement on insert/save/publish | Hidden widgets and client-side plan bypass |
| P0 launch | First-party manifest validation and capability allowlist | Registry drift and unsafe capability escalation |
| P0 launch | One renderer contract across Builder/Preview/Publish | Builder-only widgets |
| P0 launch | Safe provider metadata for embeds; CSP/URL allowlist | XSS, data exfiltration, tenant compromise |
| P1 | Version and Blueprint compatibility ranges plus deterministic migrations | Saved-site breakage on updates |
| P1 | Activation records scoped by tenant/site and audited | Cross-tenant leakage |
| Post-launch | Signed verified-partner packages, review pipeline, asset integrity, rollback | Supply-chain and runtime compromise |
| Reject now | Arbitrary third-party code, database/filesystem access, unrestricted APIs/scripts | Platform and tenant compromise |

Runtime registration must be deterministic before blueprint load. Widgets receive serializable props/style/children only and cannot access tenant secrets, database connections, filesystem, Builder stores, other tenants, or unrestricted network/script execution. Partner widgets should initially be declarative compositions of approved primitives; sandboxed third-party execution is a separate post-launch security program.

## Categories

Use a small cross-industry taxonomy at launch: Layout, Content, Media, Navigation, Forms, Marketing, Conversion, Commerce, Social Proof, Data, Integrations, Accessibility, and Advanced UI. Industry is a separate multi-value facet (Real Estate, Healthcare, Restaurant, Education, Automotive, Hospitality, Portfolio, Agency, Ecommerce) rather than duplicating widget categories. Analytics is an integration facet, not a visual widget category.

## Candidate decisions

- Core: layout primitives, Heading, Text, Button, Image, Video, Icon, Divider, Spacer; future Link/List/Blockquote and composable form primitives.
- Premium built-in: hero, CTA, structured cards, FAQ, testimonials, pricing, logo cloud, timeline, team, table, safe code block.
- Premium marketplace: carousel, lightbox/masonry, before/after, map/provider widgets, countdown, popup/off-canvas, CMS lists, Lottie and verified integrations after their runtime contracts exist.
- Industry-specific: offer/property/product grids, booking, restaurant menu, course, healthcare appointment variants.
- Template-only: trust badges, icon text, logo-cloud arrangements, sticky CTA sections, generic interactive-card variants when composed from primitives.
- Reject: raw HTML/script widgets, social-feed credential access in widget code, arbitrary plugins, duplicated card/accordion/gallery types without distinct contracts.
