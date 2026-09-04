# AI v10 forensic root-cause trace

## Finding

The first incompatible geometry is introduced during semantic/archetype compilation, before enrichment. The compiler writes grid intent to `node.style.display` and `node.style.gridTemplateColumns`, but does not write the legacy `node.props.layout` discriminator. Both renderers subsequently ignore the resolved `display: grid` value and select their container layout from `props.layout ?? "flex"`.

This is a compiler-to-renderer contract mismatch. It is not caused by creative enrichment, image generation, deterministic cleanup, responsive fallback selection, or the metadata critic.

The first fixed-fixture example is `container.section_editorial_hero_6`. Artifact `14-blueprint-before-enrichment.json` contains:

```json
{
  "style.display": "grid",
  "props.layout": null
}
```

`19-rendered-style-contract.json` proves that `resolveRenderStyle` correctly resolves desktop `display` to `grid`. Canvas and runtime then replace it with `flex` because `props.layout` is undefined.

The first visible collapse is especially clear at `container.archetype.section_footer_trust_closure_4`:

- raw and style-resolver desktop value: `display: grid`, `gridTemplateColumns: "1.15fr .85fr"`;
- renderer-selected value: `display: flex`;
- runtime desktop child `column.proof.section_footer_trust_closure_4`: `width: 0px`, `scrollWidth: 260px`;
- runtime desktop `heading.headline.section_footer_trust_closure_4`: `width: 0px`, `scrollWidth: 260px`, approximately 231px content height;
- Canvas desktop also renders malformed geometry, although its separate equal-width column fallback changes the symptom: metric headings collapse to about 5.7px rather than the runtime's zero-width proof column.

The same mismatch affects at least these compiled containers:

- `container.metrics.section_footer_trust_closure_4`
- `container.archetype.section_trust_band_5`
- `container.gallery-editorial.section_project_showcase_9`
- `container.masonry.section_project_showcase_9`
- `container.rail-track.section_lifestyle_gallery_10`
- `container.archetype.section_locality_map_narrative_8`
- `container.items.section_faq_objection_handling_7`
- `container.gallery.section_final_conversion_block_3`

## Stage attribution

| Boundary | Evidence | Contribution |
| --- | --- | --- |
| Design/composition | Grid intent exists and is internally coherent | Not malformed by itself |
| Semantic/archetype compilation | Emits `style.display=grid` without `props.layout=grid` | First incompatible contract |
| Enrichment | Stage diff changes content props only; no node additions, removals, reparenting, ordering, or geometry changes | Not contributing |
| Images | No structural or style changes in the fixed fixture | Not contributing |
| Deterministic repair/normalization | No relevant display/layout change | Not contributing |
| Responsive/style resolution | Correctly resolves desktop grid tracks; no mobile value is selected for desktop | Not contributing |
| Canvas rendering | Overrides grid with flex using `props.layout`; applies an equal-width column fallback | Contributing |
| Runtime rendering | Overrides grid with flex using `props.layout`; flex sizing collapses proof columns to zero | Contributing and more severe |

Separate from the geometry collapse, duplicate roles already exist at compilation: `section.section_footer_trust_closure_4` and `section.section_trust_band_5` both have role `proof`; project/gallery, hero, and conversion roles are also duplicated. Later Blueprint stage diffs show that these are not duplicated by enrichment, images, or cleanup.

## Responsible code

- Compiler producer: `website-engine/layout-archetypes/archetypePrimitives.ts`, `container()`, which copies layout only into `style`.
- Compiler examples: `website-engine/layout-archetypes/archetypeCompilers.ts`, including `compileFloatingProof()`.
- Runtime consumer: `runtime/PublishedPageRenderer.tsx`, container branch, `const layout = String(props?.layout ?? "flex")`, followed by an explicit `display` override.
- Canvas consumer: `canvas/NodeRenderer.tsx`, container branch, `const layout = props?.layout ?? "flex"`, followed by an explicit `display` override.
- Shared resolver: `core/rendering/renderStyleResolver.ts` resolves the value correctly and is not the source of the failure.

## Smallest safe correction (not implemented)

Make the renderer container discriminator fall back to the already-resolved canonical style, conceptually `props.layout ?? renderStyle.display ?? "flex"`, in both Canvas and runtime. This is smaller and safer than rewriting generated Blueprints because it honors native style intent and repairs parity at the shared consumer boundary. Before applying it, regression-test legacy containers whose `props.layout` intentionally overrides their style.

No correction is included in this task.

## Fixture and captures

The fixed deterministic fixture uses seed `104729`, business `Sanjeevini Group`, and the exact requested prompt. Runtime and Canvas DOM geometry are captured independently for desktop, tablet, and mobile. Tests validate artifact immutability, Blueprint stage diffs, responsive/raw style recording, invalid value reporting, and explicit renderer-contract disagreement; they do not assert visual quality success.
