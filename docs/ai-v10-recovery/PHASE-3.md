# AI v10 Recovery — Phase 3

## Outcome

`ComponentEngine` now selects a page-aware component for each narrative section. The existing global ranked catalog remains available for compatibility, but normal inputs with selected patterns or explicit narrative sections produce section candidate groups and a coordinated page selection.

## Section-scoped input and output

Callers may provide `narrativeSections`, each with a stable ID, purpose, category, pattern, experience goal, media role, and optional layout-archetype preference. When omitted, ComponentEngine derives narrative sections from Pattern Intelligence and aligns Experience Strategy scroll beats by index.

The result adds:

- `sectionCandidates`: ranked candidates and detailed scoring for every narrative section;
- `sectionSelections`: the coordinated page-level choices;
- `explorationSeed`: the persisted reproducibility seed;
- `compilerCoverage`: dedicated/archetype/legacy coverage for every selected section.

The previous `rankedCandidates` and `recommendedSelections` fields remain populated. With section intent, recommended selections mirror the coordinated section choices so existing Composition consumers continue to work.

## Scoring model

Section scores include:

- purpose fit;
- geometry compatibility;
- layout-archetype compatibility;
- visual variety;
- brand fit;
- media-role compatibility;
- previous component repetition penalty;
- silhouette diversity;
- deterministic exploration;
- the existing catalog score as a bounded supporting signal.

Selection is sequential and page-aware. Earlier choices affect later visual-variety, repetition, and silhouette scores, preventing runs of indistinguishable grid anatomy.

## Deterministic exploration

`explorationSeed` produces a small stable score perturbation from the seed, section ID, and component ID. The same complete input and seed produce identical output. Different seeds can explore other near-valid candidates without random state or test instability. If no explicit seed is supplied, stable upstream IDs provide the seed.

## Compiler coverage

Every section candidate records one of:

- `dedicated`: exact native component compiler exists;
- `archetype-fallback`: no exact compiler, but a Phase 2 layout archetype will compile the section;
- `legacy-recipe-fallback`: neither exists, so legacy semantic fallback is explicitly required.

Fallbacks include a reason. Premium variants can no longer degrade without trace metadata.

## Composition integration

CompositionEngine consumes `sectionSelections` when available, preserving narrative section IDs, purposes, requirements, and order hints. SemanticBlueprintCompiler also resolves scoped selections by section ID before legacy global matching.

## Boundaries

- No Canvas changes.
- No Renderer changes.
- No Blueprint node-schema changes.
- No HTML or React generation.
- Inputs and outputs are additive and optional for backward compatibility.

