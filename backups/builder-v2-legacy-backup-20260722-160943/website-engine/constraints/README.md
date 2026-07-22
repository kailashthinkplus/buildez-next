# Constraints

## Purpose

Evaluate rules that prevent bad output before rendering.

## Current Status

Phase 16 local Constraint Engine contracts and evaluation.

## Public API

- `runConstraints(input)` evaluates local rules and returns `EngineResult<ConstraintEvaluationResult>`.
- `evaluateConstraintRule(rule, context)` evaluates one rule.
- `evaluateConstraintRules(rules, context)` evaluates a rule set.
- `collectConstraintRulesFromRepository()` maps local repository constraint records.
- `collectConstraintRulesFromGraph()` maps graph-reachable constraint records.
- `validateConstraintRules(rules)` validates local rule shape and coverage.
- `runConstraintVerification()` runs compile-safe verification.

## Dependencies

SDK, local repository records, and local graph index only.

## Implementation Phase

Phase 16 Constraint Engine.

## Safety Notes

No production rules are enforced yet. This module is independently callable only and is not wired into Resolver, Compiler, Builder, rendering, production routes, AI, DB, or external services.
