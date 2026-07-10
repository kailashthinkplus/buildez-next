# Engine Trace Module

## Purpose

Record explainable, replayable generation decisions across the full Website Engine lifecycle.

## Responsibilities

Capture prompt summary, intelligence decisions, WebsiteSpec decisions, repository records, constraints, reasoning, Decision Engine/compiler/mapper decisions, simulation, critic, repair, final decision, warnings, errors, confidence, and versions.

## Inputs

Every engine stage result and version metadata.

## Outputs

`EngineTrace`, `GenerationDecision`, and `GenerationReplay`.

## Public Interface

`recordGenerationDecision(input): EngineResult<GenerationDecision>`.

## Dependencies

SDK, all engine modules, learning, analytics.

## Lifecycle

Starts at planner and continues through publish, analytics, and learning.

## Example Flow

Trace explains decisions for real estate, healthcare, restaurant, automotive, and education generations without making any one industry special.

## Known Limitations

Trace must avoid tenant data leakage while remaining replayable.
