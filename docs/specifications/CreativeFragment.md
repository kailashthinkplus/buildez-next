# CreativeFragment

## Purpose

`CreativeFragment` is a metadata-only variation unit that can be assembled with a base `CreativeRecipe`.

## Required Fields

- `id`
- `family`
- `category`
- `purpose`
- `compatibility`
- `requirements`
- `assemblyRules`
- `editabilityImpact`
- `inspectorHints`
- `responsiveBehavior`
- `accessibilityNotes`
- `conflicts`
- `fallbacks`
- `version`
- `status`

## Families

layout, grid, spacing, typography, background, media, CTA, motion, interaction, scroll, card, navigation, proof, form, footer, responsive, and accessibility.

## Rules

Fragments are metadata only. They must not emit Builder nodes, React, CSS, HTML, JavaScript, screenshots, media, providers, DB calls, network calls, MCP calls, or LLM calls.
