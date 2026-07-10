# Phase 09 Universal Foundation

## Scope

Upgrade documentation so BuildEZ is explicitly industry-agnostic. This phase creates the universal business ontology, universal website ontology, website archetype strategy, and industry inheritance model.

No application code, production Website Engine modules, builder behavior, renderer behavior, or `ai-v9` behavior should change in this phase.

## Architecture Work

- Define business concepts: BusinessFamily, Industry, SubIndustry, BusinessModel, RevenueModel, CustomerJourney, TrustModel, ConversionGoal, LocalityNeed, ComplianceNeed, ContentNeed, AssetNeed.
- Define website concepts: WebsiteArchetype, SectionPattern, ComponentPattern.
- Define industry inheritance so families, industries, and subindustries share defaults and explicit overrides.
- Reframe real estate as one validation fixture, alongside healthcare, restaurant, education, and automotive.

## Acceptance Criteria

- Universal architecture docs exist for business ontology, website ontology, archetypes, and inheritance.
- Specification docs include TypeScript interfaces, field descriptions, example objects, validation rules, cross-industry examples, and future extension notes.
- ADRs record why universal ontology and archetypes are preferred over hardcoded industry generators.
- Project state, changelog, and glossary reflect the universal foundation.
- No runtime or builder files are intentionally modified.

## Rollback Plan

This is documentation-only. Rollback is limited to reverting the docs created or modified in this phase. No user-facing behavior should be affected.

## Next Phase Recommendation

Return to Phase 01 stabilization: remove misleading fallback copy, audit weak AI-generated preview output, and add fixture-based tests beginning with real estate plus healthcare, restaurant, education, and automotive prompts.
