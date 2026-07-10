# Creative Library

## Purpose

Creative Library stores reusable section and component recipe metadata for unique, beautiful websites.

It is not rendering, Builder nodes, React components, CSS, HTML, JavaScript, screenshots, provider output, or generated media.

## Current Status

Phase 31A.1 Creative Library Expansion Pack.

The catalog now expands to 559 deterministic metadata-only recipes with richer metadata, fragment metadata, and diversity-aware selection.

## Public API

- `runCreativeLibrary(input)` returns `EngineResult<CreativeLibraryResult>`.
- `buildCreativeRecipeCatalog()` returns the metadata-only recipe catalog.
- `buildCreativeRecipeCandidates(catalog, input)` filters compatible recipes.
- `scoreCreativeRecipes()` scores recipe fit.
- `rankCreativeRecipes()` sorts candidates deterministically.
- `selectCreativeRecipes()` selects recipe metadata.
- `selectDiverseCreativeRecipes()` selects deterministic diversity-aware recipe metadata.
- `calculateRecipeDiversityScore()` scores distance from already-selected recipes.
- `groupRecipesByFamily()` groups catalog entries.
- `avoidNearDuplicateRecipes()` filters near-duplicate candidates.
- `detectRecipeCompatibility()` checks input fit.
- `detectRecipeConflicts()` returns declared conflicts.
- `buildRecipeFallbacks()` returns fallback metadata.
- `validateCreativeRecipe()` validates one recipe.
- `validateCreativeLibraryResult()` validates the full result.
- `runCreativeLibraryVerification()` performs compile-safe verification.
- `buildDesignDNA()` generates deterministic Design DNA metadata.
- `buildFragmentCatalog()` returns metadata-only Creative Fragments.
- `assembleCreativeRecipe()` creates a metadata-only recipe assembly plan.
- `runCreativeLibraryWithFragments()` returns base recipe selections with Design DNA and fragment assemblies.

## Integration Alignment

- Component Engine selects component intent.
- Creative Library provides rich recipe variants.
- Composition Engine arranges selected recipes.
- Builder Blueprint Engine expands recipes into native editable primitives.
- Mapper maps native intent into Builder execution plans.

## Safety Notes

- Metadata only.
- No Builder nodes.
- No rendering.
- No React, CSS, HTML, or JavaScript.
- No providers, MCP, DB, network, or LLM calls.
- Feature flags remain false.

## Expansion Metadata

Every expanded recipe includes layout, grid, hierarchy, whitespace, asymmetry, density, media, framing, typography, CTA, motion, complexity, conversion, luxury, editorial, trust, mobile priority, uniqueness, and fragment metadata.

## Design DNA And Fragments

Design DNA records the visual identity axes that make a generated website distinct. Creative Fragments vary selected base recipes through metadata-only assembly plans.

The fragment catalog contains 240 fragments across layout, grid, spacing, typography, background, media, CTA, motion, interaction, scroll, card, navigation, proof, form, footer, responsive, and accessibility families.
