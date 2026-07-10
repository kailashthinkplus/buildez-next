# Repository Module

## Purpose

The repository module stores structured reusable Website Engine intelligence: business families, industries, subindustries, archetypes, patterns, components, design languages, tokens, composition rules, constraints, asset rules, QA rules, repair rules, fixtures, examples, and anti-patterns.

## Responsibilities

- Load and validate repository records.
- Query records by ontology, archetype, industry, goal, pattern, component, asset, and constraint.
- Preserve version, status, provenance, compatibility, and deprecation metadata.
- Provide deterministic record sets to graph, reasoning, Decision Engine, compiler, critic, repair, and learning.

## Inputs

SDK schemas, file-backed records, fixture records, learning rankings, and feature flags.

## Outputs

Validated `RepositoryRecord[]`, query results, compatibility sets, fixture data, and ranking metadata.

## Public Interfaces

`loadRepository`, `queryRepository`, `getRecordById`, `resolveCompatibleRecords`, and `validateRepository`.

## Dependencies

SDK validators, graph metadata, and later tenant-safe learning rankings.

## Lifecycle

Repository records load before reasoning, Decision Engine, and compiler. Later learning may adjust ranking, but not record truth.

## Example Flow

A restaurant booking fixture and a healthcare appointment fixture can both query booking patterns while receiving different compliance and content rules.

## Known Limitations

No production repository exists yet. Phase 13 should begin with file-backed fixtures.
