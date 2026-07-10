# Compiler

## Purpose

The Website Compiler turns deterministic upstream Website Engine outputs into an enriched mapper-ready `CompiledWebsitePlan`.

It is still not a Mapper, Renderer, Planner, Critic, Repair system, or generator. It does not create Builder nodes, HTML, React components, CSS, JavaScript, rendered websites, provider requests, or production route behavior.

## Current Status

Phase 29 Compiler Revisit / Enrichment.

The compiler now accepts:

- `DecisionPlan`
- `BusinessIntelligenceProfile`
- `BrandIntelligenceProfile`
- `ContentStrategy`
- `ExperienceStrategy`
- `PatternIntelligenceResult`
- `InspirationProfile`
- `VisualMoodProfile`
- `MediaStrategy`
- `MotionStrategy`
- `DesignResult`
- `ComponentResult`
- `CompositionResult`
- `WebsiteSpec`
- `WebsiteDNA`
- `ConstraintEvaluationResult`
- repository, graph, and feature-flag metadata

## Public API

- `runWebsiteCompiler(input)` returns `EngineResult<CompilerResult>`.
- `compileWebsitePlan(input)` creates the enriched mapper-ready plan.
- `compileSections(input)` compiles ordered editable section metadata.
- `compileComponents(input, sections)` compiles editable component mapping intent.
- `compileAssets(input)` compiles asset requirements and truth-aware asset strategy.
- `compileCreativeDirection(input)` compiles inspiration, mood, media, and motion summaries.
- `compileContentRoles(input, sectionIds)` compiles content roles per section.
- `compileExperienceRoles(input, sectionIds)` compiles journey roles per section.
- `compilePatternRoles(input, sectionIds)` compiles pattern roles per section.
- `compileResponsiveRules(input, sections)` compiles responsive metadata without CSS.
- `compileQualityGates(input)` compiles quality gates from decision, constraints, components, composition, and compiler policy.
- `compileTrace(input)` records inert compiler trace metadata.
- `validateCompiledWebsitePlan(plan)` validates the local plan.
- `runCompilerVerification()` performs compile-safe verification.

## Output

The compiler output includes selected business family, industry, archetype, goal, design language, composition strategy, design tokens, theme intent, creative direction, visual mood summary, media strategy summary, motion strategy summary, ordered section plan, component plan, asset requirements, CTA plan, SEO plan, accessibility plan, responsive plan, quality gates, missing facts, missing assets, carried constraint violations, explanations, warnings, engine versions, and trace metadata.

## Safety Notes

- Mapper-ready plan only.
- No Builder nodes.
- No HTML, React, CSS, or JavaScript generation.
- No rendered output.
- No generated websites.
- No provider, MCP, DB, network, external service, or LLM calls.
- No production wiring.
- Feature flags remain false.

## Implementation Phase

Phase 29 Compiler Revisit / Enrichment.
