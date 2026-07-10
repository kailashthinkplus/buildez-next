# Pattern Intelligence Module

## Purpose

Reason about semantic patterns before component selection.

## Responsibilities

Select, reject, rank, and explain patterns by website goal, trust, conversion, brand, design language, forbidden rules, overuse, conflicts, and journey quality.

## Inputs

Business intelligence, brand profile, content strategy, experience strategy, repository patterns, constraints, design language, prior rankings.

## Outputs

`PatternIntelligenceResult` and trace decisions.

## Public Interface

`runPatternIntelligence(input): EngineResult<PatternIntelligenceResult>`.

## Dependencies

SDK, repository, constraints, experience, trace.

## Lifecycle

Runs before `WebsiteSpec`, Reasoning, and Decision Engine. The Decision Engine later commits semantic patterns into strategy choices before compiler/component mapping.

## Example Flow

Chooses Project Showcase for real estate, Provider Proof Stack for healthcare, Menu Preview for restaurant, Comparison Section for automotive, and Outcome Proof for education.

## Known Limitations

Not template selection and not component rendering.
