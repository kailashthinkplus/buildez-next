# Reasoning

## Purpose

Turn intent and graph results into explainable website strategy.

## Current Status

Phase 17 deterministic Reasoning Engine.

## Public API

- `runReasoning(input)` builds, scores, ranks, and explains candidates.
- `buildCandidateSet(input)` collects deterministic candidate sets.
- `scoreCandidates(candidates, input)` calculates normalized scores.
- `rankCandidates(candidates, input)` sorts candidates deterministically.
- `explainCandidate(candidate, input)` records why a candidate scored as it did.
- `collectReasoningMetrics(input, candidateCount, rankedCandidateCount)` summarizes a run.
- `runReasoningVerification()` performs compile-safe verification.

## Dependencies

SDK, local repository records, local graph index, and local Constraint Engine outputs only.

## Implementation Phase

Phase 17 Reasoning Engine.

## Safety Notes

Does not call external services, mutate state, call LLMs, implement Resolver, generate websites, change Builder behavior, or wire into production routes.
