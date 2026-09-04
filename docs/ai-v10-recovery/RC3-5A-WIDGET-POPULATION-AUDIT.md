# RC-3.5A Native Widget Population Forensic Audit

## Scope and conclusion

This was an audit-only investigation of Sanjeevini Group, deterministic seed `104729`. No correction was implemented and no production generation, prompt, selection, rendering, or persistence behavior was changed.

The first shared production failure is `compileNativeVisualCapability` in `website-engine/builder-blueprint/nativeVisualCapabilityCompiler.ts`: it compiles every premium widget into the same flat `eyebrow/title/body/primaryCta/secondaryCta/items` envelope. Widget-specific structures are never created. A second independent failure is `discoverImageSlots` in `ai-v10/media/runV10ImageGeneration.ts`: it discovers only `image` nodes with `aiImagePrompt`, so premium-widget media slots never enter image generation. `ProductionWidgetView.tsx` then masks these omissions with internal demo media and hard-coded copy. Serialization is exact and is not a contributor.

The forensic fixture itself recursively resolves every semantic token to `Sanjeevini Group`. That is a test-fixture limitation, not evidence that the production creative model returns that copy. The structural compiler, image-discovery, renderer, selection-safety, and persistence findings are invariant between normal and forensic execution.

## Pipeline boundary

```text
section intent
  -> selectVisualCapability                  [unsafe fact gating for 2 widgets]
  -> compileNativeVisualCapability           [first shared structural loss]
  -> creative enrichment                     [can traverse emitted arrays; rich arrays absent]
  -> discoverImageSlots                      [premium media undiscovered]
  -> serialize / deserialize                 [exact]
  -> ProductionWidgetView                    [demo fallbacks expose/mask missing data]
```

## Widget findings

| Section | Widget | First bad stage | Exact evidence |
|---|---|---|---|
| `section.contact_lead_capture.1` | `leadForm` | `incomplete-compiler-props` | Compiler emits string `items[]`; no typed `fields[]`. Renderer hard-codes Name/Email/Phone/message and success text. |
| `section.sticky_mobile_cta.2` | `floatingWhatsApp` | `unsafe-required-data-missing` | Selection occurs without a verified number; final props omit `whatsappNumber`; renderer constructs an empty `https://wa.me/`. |
| `section.final_conversion_block.3` | `cta` | `no-failure` | Flat CTA fields are structurally consumed. Fixture copy is generic, but this audit cannot attribute that to production enrichment. |
| `section.footer_trust_closure.4` | `smartFooter` | `incomplete-compiler-props` | No `linkGroups`, `legalLinks`, or contact structure. Renderer supplies BZ branding, Company links, and “Your company”. |
| `section.trust_band.5` | `logoCloud` | `wrong-capability-selected` | No verified partner/customer logo facts exist; no `logos[].src/alt/name` is compiled. |
| `section.editorial_hero.6` | `hero` | `renderer-prop-shape-mismatch` | Compiler places media at `style.mediaUrl`; `mediaSource` reads CSS variable `--w-media-url`, then uses `DEFAULT_MEDIA`. |
| `section.faq_objection_handling.7` | `faq` | `incomplete-compiler-props` | No question/answer pairs; renderer treats strings as questions and repeats one generic answer. |
| `section.locality_map_narrative.8` | `timeline` | `incomplete-compiler-props` | No step descriptions; renderer repeats a generic outcome paragraph. |
| `section.project_showcase.9` | `carousel` | `incomplete-compiler-props` | No slide objects/media; renderer maps strings and always uses `DEFAULT_MEDIA`. |
| `section.lifestyle_gallery.10` | `galleryLightbox` | `incomplete-compiler-props` | No item `src/alt/title`; renderer always uses `DEFAULT_MEDIA`. |

## Stage evidence

At Blueprint stage 14, all ten widget nodes have the same compiled keys:

```json
{
  "eyebrow": "{{...eyebrow}}",
  "title": "{{...headline}}",
  "body": "{{...description}}",
  "primaryCta": "{{...primary_cta}}",
  "secondaryCta": "{{...secondary_cta}}",
  "items": ["{{...item_1}}", "{{...item_2}}"],
  "variant": "default",
  "generationCapability": "leadForm"
}
```

At stage 15 the deterministic fixture resolves primitives and array entries, proving recursive traversal of arrays, but it cannot create structures that compilation omitted:

```json
{
  "title": "Sanjeevini Group",
  "items": ["Sanjeevini Group", "Sanjeevini Group"]
}
```

Stages 16 and 18 are unchanged for these props. Image generation finds no premium-widget media because `runV10ImageGeneration.ts` filters for `node.type === "image"`. Save/reload equality is true for every traced record, including arrays and objects.

No final widget prop values matched its `PremiumWidgetDefinitions` `defaultNode` values. Therefore the dominant leakage is not `defaultNode` copying: it is renderer-internal `DEFAULT_MEDIA` and hard-coded demo copy in `ProductionWidgetView.tsx`.

## Root-cause groups and smallest safe corrections

1. **Shared flat native adapter — `incomplete-compiler-props`.** Affects lead form, footer, FAQ, timeline, carousel, and gallery. The smallest future correction is a typed, widget-specific population contract and compiler adapter that emits only the structures each renderer can consume. Enrichment can recursively patch emitted arrays, but currently has no typed structures to patch.

2. **Premium media outside discovery — `media-slot-not-discovered`.** Affects hero, carousel, gallery, and logo cloud. The smallest future correction is to expose typed premium media prompts/slots to image discovery and map results back to those exact paths. Do not infer factual logos.

3. **Renderer demo content/shape — `renderer-prop-shape-mismatch`.** Affects hero plus the renderers with internal demo copy/media. The smallest future correction is to align one canonical prop contract end-to-end, then remove demo fallbacks from production rendering only after required data is valid.

4. **Verified data is not gated — `unsafe-required-data-missing` / `wrong-capability-selected`.** Affects floating WhatsApp and logo cloud. The smallest future correction is capability eligibility based on verified phone/logo facts, with a role-correct non-factual fallback when unavailable.

5. **Forensic fixture collapses specificity — fixture-only.** All post-enrichment values become the business name. The smallest diagnostic-only correction would be differentiated deterministic fixture content. This does not establish a production prompt defect.

6. **Persistence — `no-failure`.** Serialized and reloaded props are byte-equivalent as JSON. No correction is indicated.

## Truth and safety

The observed fixture provides no verified WhatsApp number or partner/customer logo assets. Those two capabilities are unsafe as selected. The audit also found no basis for inventing awards, testimonials, project names, prices, approvals, RERA status, addresses, or contact details. The compiler's generic token population does not establish those facts.

## Cross-industry and anti-overfitting checks

Synthetic healthcare, SaaS, hospitality, and automotive contexts reproduce the same structural boundaries: FAQ/form/timeline/gallery/logo widgets require structures the shared adapter does not emit; premium media remains outside image-node discovery; logo selection still requires verified facts. The detailed matrix is in `widget-population-cross-industry.json`.

A production-source search for `Sanjeevini`, `104729`, fixture section IDs, and benchmark strings found fixture names only in tests, forensic scripts/artifacts, and recovery documentation. No fixture-specific generation branch was added.

## Artifacts and verification

- `apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/widget-population-provenance.json`
- `apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/widget-population-cross-industry.json`
- Focused audit test: `modules/builder-v2/__tests__/website-engine/widget-population-forensic-audit.test.ts`

The provenance contains the complete requested per-record contract, stage props, renderer expectations, missing/ignored paths, media completeness, nested hydration coverage, first failure, responsible source, and evidence. This report recommends corrections only; none was implemented.
