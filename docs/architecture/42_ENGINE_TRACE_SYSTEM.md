# Engine Trace System

## Purpose

Engine Trace is first-class infrastructure for explainability and replayability. Every generation should explain what happened, why it happened, which versions and records were used, and how to reproduce or debug it.

## Must Record

- Prompt summary
- Business classification
- Business intelligence decisions
- Brand intelligence decisions
- Content strategy decisions
- Experience strategy decisions
- Pattern intelligence decisions
- WebsiteSpec decisions
- Repository records used
- Constraints applied
- Decision Engine decisions
- Compiler decisions
- Mapper decisions
- Simulation result
- Critic result
- Repair attempts
- Final output decision
- Warnings, errors, confidence, and engine versions

## Supports

Debugging, reproducibility, learning, customer support, QA review, regression testing, and future ML ranking.

## Outputs

`EngineTrace`, `GenerationDecision`, and `GenerationReplay`.

## Multi-Industry Examples

Trace should explain why a real estate page avoided fake prices, why a healthcare page required credentials before CTA, why a restaurant page placed menu early, why an automotive page blocked authorization claims, and why an education page avoided fake placement claims.

## Failure Modes

- Recording final output but not decisions.
- Missing repository versions.
- Making repair unreplayable.
- Hiding confidence and warnings.

## Implementation Guidance

Trace should be emitted by every engine stage, not reconstructed afterward. Trace records must avoid tenant data leakage while preserving enough references for support and QA.
