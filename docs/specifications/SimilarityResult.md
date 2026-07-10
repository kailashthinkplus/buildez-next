# SimilarityResult Specification

## Contract

`SimilarityResult` is the metadata-only output of the Similarity & Diversity Engine.

## Required Fields

- `id`
- `version`
- `profile`
- `overallSimilarityScore`
- `overallDiversityScore`
- `passed`
- `closestMatches`
- `dimensionScores`
- `recipeOverlap`
- `fragmentOverlap`
- `designDnaOverlap`
- `componentOverlap`
- `sectionOrderOverlap`
- `layoutRhythmOverlap`
- `motionRhythmOverlap`
- `typographyRhythmOverlap`
- `ctaCadenceOverlap`
- `diversityPenalties`
- `diversityRecommendations`
- `repairHints`
- `issues`
- `warnings`
- `confidence`
- `metrics`
- `trace`
- `metadata`

## Score Rules

`overallSimilarityScore` is normalized from `0` to `1`.

`overallDiversityScore.score` is normalized from `0` to `100` and graded as:

- `excellent`: 90+
- `acceptable`: 75-89
- `weak`: 60-74
- `fail`: below 60

## Inert Flags

The result must always report:

- `persisted: false`
- `rendered: false`
- `screenshotCaptured: false`
- `sideEffects: false`

## Safety

The contract must not contain rendered HTML, CSS, JavaScript, React output, Builder nodes, screenshots, provider output, persisted history handles, DB records, or external service references.
