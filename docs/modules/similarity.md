# Similarity Module

## Module

`apps/web-app/modules/builder-v2/website-engine/similarity`

## Responsibility

The Similarity module converts candidate website metadata into a `WebsiteSimilarityProfile`, compares it against optional history or internal baseline rules, and returns `EngineResult<SimilarityResult>`.

## Public Helpers

- `runSimilarityEngine()`
- `buildWebsiteSimilarityProfile()`
- `compareDesignDNA()`
- `compareRecipeSelections()`
- `compareFragmentSelections()`
- `compareComponents()`
- `compareComposition()`
- `compareLayoutRhythm()`
- `compareMotionRhythm()`
- `compareTypographyRhythm()`
- `compareCTACadence()`
- `scoreOverallSimilarity()`
- `scoreDiversity()`
- `buildDiversityRecommendations()`
- `buildSimilarityRepairHints()`
- `validateSimilarityInput()`
- `validateSimilarityResult()`
- `runSimilarityVerification()`

## Non-Responsibilities

- No DB persistence
- No network calls
- No LLM calls
- No screenshots
- No rendering
- No Builder node creation
- No Mapper execution
- No production wiring
