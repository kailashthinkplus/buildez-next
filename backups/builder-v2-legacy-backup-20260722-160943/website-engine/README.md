# Website Engine

## Purpose

Durable Website Engine skeleton for future industry-agnostic generation.

## Current Status

Phase 11 skeleton only. Not wired into production generation.

## Public API Placeholder

Exports SDK contracts and inert module entry points.

## Dependencies

No LLM calls, no UI, no database access, and no runtime rendering behavior.

## Implementation Phase

Phase 11 Website Engine Skeleton.

## Safety Notes

Feature flags default off. Existing ai-v9 and builder routes must remain unchanged.

## RC-9E: Composition Quality Engine

The deterministic composition-quality layer evaluates the final ordered semantic section sequence immediately before Blueprint compilation. It scores rhythm, trust, conversion, visual balance, and density; detects relationship and anti-pattern warnings; and returns suggestions as immutable metadata.

The integration is warning-only. It does not reorder sections, block generation, call AI, or change native Builder output. Golden full-page fixtures cover luxury real estate, automotive, restaurant, healthcare, and professional services. See `docs/implementation/PHASE_43_COMPOSITION_QUALITY_ENGINE.md` for the scoring contract and architecture.

## RC-10: Design Intelligence Compiler

The deterministic Design Intelligence Compiler translates existing design, brand, business-family, composition, and component intent into immutable execution metadata for typography, spacing, containers, media, motion, and responsive behavior. `SemanticBlueprintCompiler` attaches the plan as an isolated compilation trace before selecting native component compilers.

RC-10 does not emit CSS or Builder nodes and does not alter component trees, Blueprint schema, serialization, hydration, renderer, canvas, runtime, or motion execution. Golden fixtures cover luxury real estate, restaurant, healthcare, automotive, and SaaS. See `docs/implementation/PHASE_44_DESIGN_INTELLIGENCE_COMPILER.md`.

## RC-11: Golden Website Generation Benchmark

The isolated Golden Website Benchmark executes 52 commercial website archetypes through existing composition quality, design intelligence, semantic routing, native component compilation, Blueprint validation, serialization, editability, responsive, and parity checks. It produces deterministic JSON-safe quality reports without participating in production generation.

Playwright capture preparation covers 1440px desktop, 1024px tablet, and 390px mobile viewports; reference screenshot comparison remains intentionally deferred. See `docs/implementation/PHASE_45_GOLDEN_WEBSITE_BENCHMARK.md`.

## RC-12: Golden Website Visual Evaluation

The development-only Golden Preview route renders all RC-11 fixtures through the existing `PublishedPageRenderer` with deterministic local hydration and inline media. Playwright validates 52 websites at 1440px desktop, 1024px tablet, and 390px mobile widths, checking runtime errors, node completeness, semantic hydration, overflow safety, and capture stability.

The metadata-only Visual Quality Evaluator scores layout, typography, hierarchy/component diversity, imagery, and responsive behavior without changing generation decisions. Optional reference metadata never blocks generation. See `docs/implementation/PHASE_46_GOLDEN_VISUAL_EVALUATION.md`.

## RC-13: Visual Critic and Deterministic Repair Planning

The deterministic Visual Critic evaluates existing Blueprint, composition, design-execution, and visual-quality metadata. It reports layout, typography, conversion, media, and responsive issues with stable severity and affected-section/node references.

The Visual Repair Planner converts findings into recommendation-only actions with confidence metadata. It never executes Builder commands or mutates a Blueprint. All 52 golden preview artifacts include critic results, and the development-only `/internal/visual-critic/[caseId]` route displays the existing golden capture, scores, findings, and recommendations. See `docs/implementation/PHASE_47_VISUAL_CRITIC_SYSTEM.md`.

## RC-14: Intelligent Visual Repair Planner

RC-14 adds deterministic section diagnoses and explainable repair plans to the critic result. Each diagnosed section records its component variant, issue, severity, confidence, violated design principle, and stable violation code. Specialized planners use the existing component catalog, native compiler registry, composition patterns, and design-execution metadata to recommend component replacements, layout changes, content-density reductions, or token adjustments.

Repair plans remain immutable metadata: `recommendationOnly` is always true, `blueprintMutated` is always false, and no plan is executed. Golden preview artifacts expose `visualScore`, `criticScore`, and `repairPlan`; the development critic route includes a Repair Plan panel. See `docs/implementation/PHASE_48_VISUAL_REPAIR_PLANNER.md`.

## RC-15: Deterministic Blueprint Repair Engine

RC-15 converts explicitly approved RC-14 recommendations into native Builder commands. Component replacement, layout changes, design-token adjustments, and content-density reductions execute as one CommandBus transaction with undo/redo and serializable history metadata.

Every proposal passes Blueprint, component compatibility, responsive, and serialization gates in an isolated validation bus before execution. Simulation returns a rendered in-memory Blueprint and effectiveness score without persistence. The source Blueprint is never directly mutated. See `docs/implementation/PHASE_49_BLUEPRINT_REPAIR_ENGINE.md`.

## RC-16: Creative Director Intelligence

The deterministic Creative Director translates existing business, archetype, composition, component, and design intent into an immutable art-direction plan before component compilation. It defines visual personality, composition style, narrative hierarchy, trust/conversion/media placement, visual rhythm, anti-template warnings, and a perceived-quality creative score.

`SemanticBlueprintCompiler` attaches this plan as metadata only. The plan does not select or alter components, emit seeds, change native nodes, or affect rendering and serialization. All 52 golden benchmarks expose `creativeScore`, `creativeWarnings`, and `creativeDirectionPlan`. See `docs/implementation/PHASE_50_CREATIVE_DIRECTOR_INTELLIGENCE.md`.
