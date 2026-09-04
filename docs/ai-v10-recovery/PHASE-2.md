# AI v10 Recovery — Phase 2

## Outcome

The semantic Blueprint compiler now has a premium layout-archetype layer. When an explicit Phase 1 `ArtDirectionBrief` is present, section intent can select a parameterized archetype before the legacy semantic recipe fallback.

Existing exact component-variant compilers retain precedence. Existing recipes were not removed and remain the compatibility path when no brief or suitable archetype exists.

## Archetype contract

Every archetype declares:

- semantic purpose;
- allowed native widget anatomy;
- layout structure;
- responsive transformation;
- spacing behavior;
- media role;
- typography intent;
- supported industries;
- a deterministic compiler to native Blueprint widget seeds.

The initial catalog contains:

1. `editorialSplitHero`
2. `cinematicFullBleedHero`
3. `asymmetricStorySection`
4. `bentoShowcase`
5. `imageStoryNarrative`
6. `floatingProofSection`
7. `galleryJourney`
8. `quoteInterlude`
9. `framedCTA`
10. `architecturalProjectShowcase`

## Selection order

```text
exact component variant compiler
  -> ArtDirectionBrief + section-intent archetype
    -> existing semantic recipe fallback
```

Selection is deterministic. Hero selection distinguishes cinematic/immersive direction from editorial direction. Other sections route through semantic intent such as story, project, gallery, proof, quote, conversion, process, or showcase. Industry support is checked before an archetype is accepted.

`SemanticBlueprintCompilation.selectedArchetypes` records the selected archetype per section, while `selectedRecipes` records entries as `archetype:<id>` for existing trace consumers.

## Native Builder guarantees

- Archetypes emit only existing native primitive seeds.
- No Canvas or Renderer code changed.
- No HTML or React is generated.
- The Blueprint node schema is unchanged.
- Widget editability, property bindings, responsive Inspector tabs, serialization, and native compatibility continue through the existing `buildWidgetBlueprints` pipeline.
- Archetypes use responsive style values for grid collapse, action stacking, typography scaling, spacing, and media behavior.

## Compatibility

An explicit `artDirectionBrief` enables archetype selection. Without one, compilation follows the previous exact-compiler and semantic-recipe behavior. Unsupported industry/archetype combinations also fall back safely.

## Verification

Tests cover all ten metadata contracts, deterministic selection, structural diversity, exact component-compiler precedence, legacy fallback, native compatibility, editability, Inspector bindings, and responsive metadata.

