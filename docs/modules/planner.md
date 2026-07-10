# Planner Module

## Purpose

The planner module classifies raw intent into structured business and website intent. It is part of the future `modules/builder-v2/website-engine/planner/` platform capability.

## Responsibilities

- Accept typed inputs and reject ambiguous unvalidated data.
- Keep domain decisions outside long prompts whenever deterministic code or graph data can own them.
- Emit explainable decisions that can be logged in `GenerationHistory`.
- Preserve builder editability and preview/published parity downstream.

## Inputs

prompt, tenant context, saved business profile.

## Outputs

WebsiteIntentClassification, missing facts, confidence.

## Public Interfaces

`runPlanner(input): PlannerResult` is the expected public shape. The exact TypeScript contract should live beside implementation and mirror the corresponding files under `docs/specifications`.

## Dependencies

This module may depend on validated spec types, graph data, engine configuration, logging, and feature flags. It should not depend directly on UI components unless it is the renderer, and it should not call an LLM unless the AI orchestrator explicitly delegates a planning task.

## Lifecycle

1. Receive typed input from the previous engine step.
2. Validate schema version and required facts.
3. Produce deterministic decisions where possible.
4. Return result, warnings, confidence, and trace metadata.
5. Feed outputs to the next module and to generation history.

## Example Flow

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability. In this module, the flow should preserve those constraints and record any missing facts instead of inventing them.

## Known Limitations

The module does not exist as production code yet. During Phase 00 it is documented only; implementation begins in later phase files. Early versions should favor narrow real estate fixtures over broad but shallow coverage.

## Website Engine Core Integration

The planner is upstream of the SDK, repository, constraints, reasoning, Decision Engine, compiler, and simulation lifecycle. It may ask an LLM to classify ambiguity, but it must emit SDK-validated intent rather than builder nodes. Its output should be suitable for real estate, healthcare, restaurant, automotive, and education fixtures without changing planner code per industry.

Planner output is not enough to build `WebsiteSpec`. It feeds Business Intelligence, Brand Intelligence, Content Intelligence, Experience, and Pattern Intelligence first.
