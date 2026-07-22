# Graph

## Purpose

Query relationships between ontology, archetypes, patterns, components, constraints, and assets.

## Current Status

Phase 15 local repository-backed contracts and indexing.

## Public API

- `buildKnowledgeGraph(records)` builds a local graph from repository records.
- `indexRepositoryRecords()` indexes the default repository records.
- `getGraphNode(id)` reads a node from the local index.
- `listGraphNodes(type)` and `listGraphEdges(relationship)` inspect the local index.
- `traverseGraph(query)` performs deterministic local traversal.
- `findCompatibleArchetypes()`, `findRequiredPatterns()`, `findForbiddenPatterns()`, `findAssetNeeds()`, `findConstraints()`, `findQaRules()`, and `explainGraphPath()` provide query helpers.
- `runGraphVerification()` validates graph shape and starter coverage.

## Dependencies

SDK and local repository records only.

## Implementation Phase

Phase 15 adds repository-backed graph behavior.

## Safety Notes

No production wiring, no DB, no external calls, no AI calls, no industry-specific generator, and no generated output.
