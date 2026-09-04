# BuildEZ AI v10 Recovery RC-3: Native Visual Capability Activation

## Outcome

RC-3 connects AI v10 section selection to the existing registered Builder widget system. Selected production capabilities now compile as their actual native node types, retain their Inspector definitions and responsive metadata, serialize through the normal Blueprint contract, and render through the shared Canvas/runtime premium widget view.

The implementation does not generate React, HTML, Next.js components, custom code widgets, backgrounds, overlays, parallax, GSAP, or animation timelines. It adds no widget renderer.

## Verified native inventory

`NativeVisualCapabilityRegistry` is derived from the real `REGISTERED_WIDGET_DEFINITIONS`, widget property schemas, Inspector-support metadata, serialization metadata, and the existing shared Canvas/runtime premium render path. It records registration and readiness separately, so presence in `NodeType` or a filename is not treated as proof.

The inventory covers the core primitives and every registered premium definition, including hero, card/feature/offer grids, gallery variants, carousel, testimonials, tabs, FAQ/accordion, before/after, video, stats, logo cloud, timeline, forms, smart header/footer, floating WhatsApp, editorial widgets, and marketplace-backed premium definitions.

`embed` and `popupModal` remain explicitly runtime/Canvas gated. `testimonial` exists in the renderer switch but has no registered definition, so it is not claimed by the registry. Capabilities that do not pass all production gates are not exposed to generation.

## Production generation catalog

`ProductionGenerationCapabilityCatalog` filters the inventory using all required gates:

- registered and native;
- editable with real property definitions;
- Inspector-supported;
- responsive;
- Canvas/runtime supported;
- serializable as a native editable node;
- covered by the dedicated native adapter.

Each exposed entry declares semantic roles, preferred industries, compatible archetypes, required content, item bounds, silhouette, interaction level, and a role-correct fallback widget.

The activated catalog includes:

`hero`, `galleryLightbox`, `masonryGallery`, `gallery`, `carousel`, `faq`, `accordion`, `tabs`, `testimonials`, `statsCounter`, `logoCloud`, `timeline`, `leadForm`, `contactForm`, `smartFooter`, `floatingWhatsApp`, `cta`, and `cardGrid`.

Gated or insufficiently proven widgets cannot be selected.

## Selection and compilation flow

```text
Narrative section + pattern + purpose + media role
                    │
                    ▼
 Existing ComponentEngine section-scoped component/anatomy selection
                    │
                    ▼
 ProductionGenerationCapabilityCatalog role filter
                    │
                    ├── no safe match ──► explicit role-correct fallback diagnostic
                    │
                    ▼
 Selected native capability + typed containerMode
                    │
                    ▼
 SemanticBlueprintCompiler native capability adapter
                    │
                    ▼
 Native section + real premium widget node type
                    │
                    ▼
 Existing Inspector / serialization / responsive / Canvas / runtime contracts
```

The compiler emits one native premium node for the section and does not pretend that a primitive grid is a premium compiler. Premium definitions currently declare `canHaveChildren: false`; therefore the adapter emits no fallback children. The legacy v10 recipe expander now leaves these native-capability sections intact instead of appending unrelated showcase cards beneath premium widgets.

Creative hydration recognizes production catalog nodes, so premium content props are resolved before the existing unresolved-placeholder gate.

## Container modes

RC-3 introduces the typed layout intent:

```ts
type ContainerMode = "boxed" | "wide" | "fullWidth" | "fullBleed" | "breakout";
```

It executes through the existing Builder contract:

- `boxed` → existing `props.container = "boxed"`;
- `wide` → existing boxed behavior with the established `maxWidth` property;
- `fullWidth`, `fullBleed`, and `breakout` → existing `props.container = "full"` behavior.

`layoutIntent.containerMode` remains trace metadata; it does not introduce another renderer width system. Media-dominant hero/gallery capabilities choose full-width modes, discovery rails use full width, trust/process bands use wide, and focused form/CTA sections remain boxed. No global full-width override was added.

## Sanjeevini seed 104729

The production fixture compiles 21 nodes: one page, 10 sections, and 10 real premium widgets.

| Section | Native widget | Mode | Interaction |
| --- | --- | --- | --- |
| Editorial hero | `hero` | fullBleed | low |
| Footer trust closure | `smartFooter` | fullWidth | low |
| Trust band | `logoCloud` | wide | static |
| Project showcase | `carousel` | fullWidth | interactive |
| Lifestyle gallery | `galleryLightbox` | fullBleed | interactive |
| Locality narrative | `timeline` | wide | static |
| FAQ | `faq` | boxed | interactive |
| Contact capture | `leadForm` | boxed | interactive |
| Sticky CTA | `floatingWhatsApp` | fullWidth | interactive |
| Final conversion | `cta` | boxed | low |

Page-level coverage:

- primitive sections: 0;
- premium widgets: 10;
- interactive widgets: 5;
- full-width/full-bleed moments: 5;
- boxed sections: 3;
- unique native capability silhouettes: 10;
- fallback compilers: 0;
- unsupported selections: 0.

No more than two boxed sections occur consecutively in final composition order. RC-1 display precedence remains unchanged; RC-2 stable provenance and distinct anatomy diagnostics remain present; RC-2C floating-proof compilation is untouched.

## Forensic diagnostics

The opt-in trace now includes `09-native-visual-capabilities.json`, containing the requested per-section trace and page coverage summary. `09-component-selection.json` also carries the capability diagnostics alongside component/anatomy diagnostics.

Artifact directory:

`apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/`

The regenerated geometry diagnostics report zero DOM geometry observations after capture. Fixed-blueprint save/reload preserves all 21 nodes and all 10 premium types.

Canvas and runtime widths match exactly for all full-width widgets at all viewports and for all premium widgets on desktop. Boxed/wide widgets differ by 8px on tablet and 16px on mobile because the forensic Canvas route includes its existing canvas inset; node type, resolved widget presentation, and responsive behavior remain equivalent.

## Captures

| Viewport | Runtime | Canvas |
| --- | --- | --- |
| Desktop | ![Runtime desktop](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/desktop.png) | ![Canvas desktop](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/desktop-canvas.png) |
| Tablet | ![Runtime tablet](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/tablet.png) | ![Canvas tablet](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/tablet-canvas.png) |
| Mobile | ![Runtime mobile](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/mobile.png) | ![Canvas mobile](../../apps/web-app/test-results/ai-v10-forensic/sanjeevini-group-seed-104729/mobile-canvas.png) |

## Files changed

- `website-engine/native-visual-capabilities/NativeVisualCapabilityRegistry.ts`
- `website-engine/native-visual-capabilities/ProductionGenerationCapabilityCatalog.ts`
- `website-engine/components/visualCapabilitySelection.ts`
- `website-engine/components/componentVariant.ts`
- `website-engine/components/sectionScopedSelection.ts`
- `website-engine/components/ComponentEngine.ts`
- `website-engine/builder-blueprint/nativeVisualCapabilityCompiler.ts`
- `website-engine/builder-blueprint/SemanticBlueprintCompiler.ts`
- Builder Blueprint generated-widget typing/property/native adapters, to accept already-supported registered `NodeType` values
- `ai-v10/creative/semanticHydrationValidation.ts`
- `ai-v10/blueprint/expandV10BlueprintRecipes.ts`
- `ai-v10/orchestrator/runV10WebsiteGeneration.ts`
- focused capability, compiler, serialization, and deterministic fixture tests

## Verification

- Widget capability, semantic compiler, Inspector, serialization, persistence, RC-1 rendering, and Canvas/runtime parity suite: passed.
- Fixed seed `104729`: generated successfully.
- Fixed Blueprint serialization/reload: passed, 21/21 nodes and 10/10 premium types retained.
- Runtime desktop/tablet/mobile captures: completed.
- Canvas desktop/tablet/mobile captures: completed.
- Geometry diagnostics: zero observed DOM anomalies.
- `git diff --check`: passed.
- Repository-wide Builder typecheck remains red on unrelated pre-existing errors; RC-3 files introduce no reported typecheck errors.

## Deferred by design

Background-image generation, gradient-overlay generation, GSAP, parallax, animation timelines, new renderers, custom code, and Visual Critic changes remain untouched for later phases.
