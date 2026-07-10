# Design DNA And Recipe Fragments

## Purpose

Design DNA and Recipe Fragments reduce visual convergence without adding rendered components or hardcoded industry generators.

Design DNA answers: what makes this website visually distinct?

Recipe Fragments answer: how can a selected recipe vary while remaining editable and safe?

## Design DNA

Design DNA is deterministic metadata. It includes grid system, whitespace level, asymmetry level, visual hierarchy, typography rhythm, image crop strategy, media ratio, card ratio, radius system, shadow language, border language, depth strategy, glass usage, background language, CTA style, section rhythm, scroll rhythm, motion rhythm, editorial level, luxury level, density level, uniqueness score, and diversity seed.

The diversity seed is derived from input metadata. No randomness is used.

## Recipe Fragments

Fragments are metadata-only variation records. They can influence future layout, spacing, typography, background, media, CTA, motion, interaction, scroll, card, navigation, proof, form, footer, responsive, and accessibility decisions.

Fragments do not emit Builder nodes, React, CSS, HTML, JavaScript, images, screenshots, or provider requests.

## Assembly

`RecipeAssemblyPlan` references a base recipe, Design DNA, selected fragment ids, and assembly rules. It is an intent contract for future engines, not an execution plan.

## Safety

No production routes, Builder store, Mapper execution, renderer behavior, external services, or `ai-v9` behavior are changed.
