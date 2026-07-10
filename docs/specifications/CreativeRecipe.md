# CreativeRecipe

## Purpose

`CreativeRecipe` defines reusable section/component recipe metadata that downstream engines can select, compose, expand, and map later.

## Required Fields

- `id`
- `name`
- `family`
- `category`
- `variant`
- `purpose`
- `compatibility`
- `requirements`
- `editability`
- `inspectorHints`
- `responsiveBehavior`
- `accessibilityNotes`
- `seoNotes`
- `conversionRole`
- `compositionIntent`
- `antiPatterns`
- `conflicts`
- `fallbacks`
- `metadata`
- `fragments`
- `version`
- `status`

## Expanded Metadata

`metadata` includes layout, grid, hierarchy, whitespace, asymmetry, density, media, framing, typography, CTA, motion, complexity, conversion, luxury, editorial, trust, mobile priority, and uniqueness fields.

## Fragment Metadata

`fragments` is metadata for future composition and must not emit UI. It includes layout, media, typography, spacing, motion, CTA, background, and interaction fragments.

## Design DNA Integration

Selected recipes can be paired with `DesignDNA`, a deterministic visual identity profile containing grid, whitespace, asymmetry, hierarchy, typography, crop, media, card, radius, shadow, border, depth, glass, background, CTA, rhythm, editorial, luxury, density, uniqueness, and diversity seed metadata.

## Creative Fragment Integration

Selected recipes can be assembled with compatible `CreativeFragment` records. Assembly produces `RecipeAssemblyPlan` metadata only. It must reference a base recipe and fragment ids, and it must never emit Builder nodes or generated UI.

## Safety

Recipes are metadata only. They must not emit Builder nodes, HTML, CSS, React, JavaScript, screenshots, generated images, or provider requests.
