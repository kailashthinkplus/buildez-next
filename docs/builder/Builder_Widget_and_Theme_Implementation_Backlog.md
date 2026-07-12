# Builder Widget and Theme Implementation Backlog

Audit date: 2026-07-11. No time estimates are provided.

| ID | Priority | Exact scope / affected files | Dependencies | Acceptance criteria and tests | Docs | Complexity |
| --- | --- | --- | --- | --- | --- | --- |
| WTA-001 | P0 | Unify token resolution in `widgets/sdk/useWidget.ts`, `core/rendering/renderThemeResolver.ts`, preview/publish paths | token contract | Shared vectors resolve `theme.*`, aliases and responsive values identically | Theme audit | Medium |
| WTA-002 | P0 | Replace internal fixed website colors in `widgets/premium/ProductionWidgetView.tsx` with semantic theme-derived styles | WTA-001, expanded tokens | All premium surfaces/text/borders/actions change across every preset; contrast snapshots pass | Design audit | Large |
| WTA-003 | P0 | Expand tokens in `theme/theme.types.ts`, `defaultTheme.ts`, presets and Inspector panels for states/forms/cards/borders | migration/default normalization | Old blueprints normalize; new state tokens editable and serialized; dark contrast tests | Theme/preset docs | Large |
| WTA-004 | P0 | Implement real structured accessible form controls and submission-state contract for `leadForm`/`contactForm`; keep network provider separate | validation/security decision | labels, help/errors, disabled/loading/success, keyboard and save/reload tests | Inventory | Large |
| WTA-005 | P0 | Gate static interaction facsimiles: tabs, carousel, lightbox, beforeAfter, countdown, popup | catalog and BlockMenu | Incomplete types hidden or honestly labeled preview-only; no false launch claims | Matrix/checklist | Small |
| WTA-006 | P0 | Reconcile 36 premium registry definitions with 12 premium marketplace records in `marketplace/firstPartyElements.ts` | final decisions | every registered exposable type has one record; gated types excluded; registry test | Marketplace audit | Medium |
| WTA-007 | P0 | Add server-side entitlement validation on insert/save/publish | billing feature service | client metadata bypass fails; tenant/site scope tests; no cross-tenant activation | Marketplace audit | Large |
| WTA-008 | P0 | Define Builder/Preview/Published parity suite for all launch widgets | stable fixtures | same semantic tree/styles at three targets; no missing renderer | Inventory | Large |
| WTA-009 | P0 | Remove/flag unsupported `NodeType` vocabulary and obsolete wrapper renderers | migration/import audit | validator rejects unknown unregistered inserts; saved aliases migrate deterministically | Inventory | Medium |
| WTA-010 | P0 | Add responsive/a11y contract for core button/media/heading/layout | WTA-001/003 | keyboard/focus, alt/caption, hierarchy, mobile overflow tests | Design audit | Medium |
| WTA-011 | P1 | Replace shared premium string list with typed per-family item/action schemas | serialization migration | cards/people/prices/links/media round-trip without parsing display strings | Inventory | Large |
| WTA-012 | P1 | Consolidate feature, FAQ and gallery overlaps using variants and migration aliases | WTA-011 | one renderer/schema per family; old types load and save safely | Matrix | Large |
| WTA-013 | P1 | Add reset-to-inherited/reset-to-theme and sparse scoped overrides in Inspector | WTA-003 | cascade/reset/responsive serialization tests | Theme audit | Large |
| WTA-014 | P1 | Add empty/loading/error states for media, maps and collection widgets | structured schemas | useful insertion state; no remote placeholder dependency; snapshots | Design audit | Medium |
| WTA-015 | P1 | Enable safe AI insertion only per passed widget capability | parity/a11y gates | AI cannot insert gated types; generated nodes use tokens and validate | Inventory | Medium |
| WTA-016 | P1 | Build launch preset visual matrix for desktop/mobile | WTA-002/003 | seven presets show materially correct core/premium widgets | Preset plan | Medium |
| WTA-017 | P2 | Finish header/footer/navigation and structured social/WhatsApp actions | safe URL contract | mobile menu, landmarks, external-link safety, keyboard tests | Industry audit | Large |
| WTA-018 | P2 | Build structured industry variants for property/course/menu/room/product cards | WTA-011 | variants remain native editable compositions; vertical fixture tests | Industry audit | Large |
| WTA-019 | P2 | Implement verified map provider declaratively | marketplace manifest/security | CSP/consent/fallback/provider tests; no arbitrary script | Marketplace audit | Large |
| WTA-020 | P3 | Signed verified-partner manifest/package review, update, rollback | security/platform program | signatures, integrity, permissions, compatibility and rollback tests | Marketplace audit | Large |
| WTA-021 | P3 | CMS-bound blog/post/category widgets and filters/search | platform content APIs | loading/error/empty/pagination and tenant isolation tests | Industry audit | Large |

Defaults changed in this milestone: core semantic/responsive defaults, media empty-state intent, and premium root semantic spacing/surface defaults. These changes do not mark WTA-002–021 complete.
