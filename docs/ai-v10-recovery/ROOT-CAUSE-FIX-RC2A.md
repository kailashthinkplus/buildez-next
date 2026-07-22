# AI v10 Root Cause Fix RC-2A: Stable Section Provenance

## Outcome

All ten Sanjeevini seed `104729` composition sections now retain their own source pattern, type, and purpose after composition reordering and semantic compilation. Component IDs are no longer used as section identity.

No prompt, scoring, selection, composition order, archetype, visual geometry, rendering, Blueprint schema, responsive behavior, or repair behavior changed.

## Old join behavior

`sectionSpecBuilder.ts` paired reordered composition sections with Pattern Intelligence using the new array index:

```text
compositionSections[index] → selectedPatterns[index]
```

Composition order differs from Pattern Intelligence selection order, so 9 of 10 section pattern references were wrong.

`SemanticBlueprintCompiler.orderedSections` then used:

```text
candidate.id === section.id ||
candidate.componentVariantRef === section.componentId
```

Component IDs are reusable. The sticky CTA and editorial hero both selected `HeroEditorialSplit01`, so the compiler reused the editorial WebsiteSpec section for the sticky section and copied its type and purpose.

The compiler additionally appended `selectedPatterns[order]`, repeating the same post-reorder index association defect.

## New join contract

The canonical section identity is the section-scoped ID introduced with the Pattern Intelligence selection and carried unchanged through ComponentEngine and CompositionEngine, for example:

```text
section.sticky_mobile_cta.2
```

WebsiteSpec pattern association now resolves in this order:

1. exact `componentResult.sectionSelections[].section.id`;
2. identity-encoded pattern match for compatible legacy inputs;
3. no association, with `MISSING_STABLE_SECTION_ASSOCIATION` diagnostic.

Semantic compilation now:

1. joins WebsiteSpec only by exact section ID;
2. obtains component metadata only after identifying the section;
3. takes patterns from the exact WebsiteSpec/scoped-selection association;
4. never joins sections through component ID or composition array position.

Legacy inputs without a stable association continue from their own composition metadata. They emit an explicit diagnostic and receive no unrelated pattern/spec metadata.

## Before and after provenance

| Composition section | Before WebsiteSpec pattern | After |
| --- | --- | --- |
| `section.editorial_hero.6` | `contact_lead_capture` | `editorial_hero` |
| `section.footer_trust_closure.4` | `sticky_mobile_cta` | `footer_trust_closure` |
| `section.trust_band.5` | `final_conversion_block` | `trust_band` |
| `section.project_showcase.9` | `footer_trust_closure` | `project_showcase` |
| `section.lifestyle_gallery.10` | `trust_band` | `lifestyle_gallery` |
| `section.locality_map_narrative.8` | `editorial_hero` | `locality_map_narrative` |
| `section.faq_objection_handling.7` | `faq_objection_handling` | `faq_objection_handling` |
| `section.contact_lead_capture.1` | `locality_map_narrative` | `contact_lead_capture` |
| `section.sticky_mobile_cta.2` | `project_showcase` | `sticky_mobile_cta` |
| `section.final_conversion_block.3` | `lifestyle_gallery` | `final_conversion_block` |

The refreshed `section-provenance.json` reports zero mismatches.

Shared-component proof:

- editorial hero remains `type=hero`, purpose `Editorial Hero fits orientation...`, pattern `editorial_hero`;
- sticky CTA remains `type=conversion-block`, purpose `Sticky Mobile CTA fits conversion...`, pattern `sticky_mobile_cta`;
- both still select `HeroEditorialSplit01`, confirming that selection was not changed and no cross-section metadata was copied.

## Files changed

- `website-engine/specification/sectionSpecBuilder.ts`
- `website-engine/specification/WebsiteSpecBuilder.ts`
- `website-engine/builder-blueprint/SemanticBlueprintCompiler.ts`
- `__tests__/website-engine/stable-section-provenance.test.ts`
- this report

## Diagnostics and compatibility

`buildSectionSpecsWithDiagnostics` exposes stable-association diagnostics without changing the existing `buildSectionSpecs` return contract. WebsiteSpec Builder surfaces those diagnostics as major trace warnings. `SemanticBlueprintCompilation.associationDiagnostics` exposes compiler-side misses.

The legacy fallback cannot select a WebsiteSpec section by component ID. It uses the composition section's own type and purpose, leaves unknown pattern association empty, and records the failure.

## Geometry confirmation

The fixed-seed Blueprint retains the same ten composition sections, component selections, archetypes, and node anatomy. RC-1 display behavior and captured geometry remain unchanged. RC-2A corrects provenance only; it does not address the ComponentEngine hero selection, duplicate floating-proof anatomy, nested metric widths, or remaining overflow observations.
