# Creative Library Module

## Responsibility

Stores reusable metadata-only recipes for beautiful, unique websites.

## Public Surface

- `runCreativeLibrary()`
- `buildCreativeRecipeCatalog()`
- `buildCreativeRecipeCandidates()`
- `scoreCreativeRecipes()`
- `rankCreativeRecipes()`
- `selectCreativeRecipes()`
- `calculateRecipeDiversityScore()`
- `groupRecipesByFamily()`
- `avoidNearDuplicateRecipes()`
- `selectDiverseCreativeRecipes()`
- `validateCreativeRecipe()`
- `runCreativeLibraryVerification()`
- `buildDesignDNA()`
- `buildFragmentCatalog()`
- `assembleCreativeRecipe()`
- `runCreativeLibraryWithFragments()`

## Phase 31A.1 Expansion

The catalog now expands to 559 deterministic metadata-only recipes. Selection defaults to deterministic diversity-aware selection so the same few high-scoring recipes do not dominate every website.

Diversity considers family, variant, layout pattern, visual hierarchy, whitespace level, media ratio, motion suitability, design language, and industry metadata.

## Phase 35A Design DNA And Recipe Fragments

Design DNA answers what makes a website visually distinct. Recipe Fragments answer how a selected base recipe can vary without adding thousands of hardcoded recipes.

The module now exposes deterministic fragment-aware assembly while preserving the existing Creative Library API.

## Non-Goals

No rendering, Builder node output, React, CSS, HTML, JavaScript, images, providers, DB, network, LLM, Mapper execution, or production wiring.
