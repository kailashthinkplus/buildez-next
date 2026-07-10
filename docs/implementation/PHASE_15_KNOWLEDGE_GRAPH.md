# Phase 15 Knowledge Graph

## Objective

Create an inert, local-only Knowledge Graph layer over Website Repository records.

The graph turns repository records into typed nodes and deterministic relationship edges. It is a contract and indexing layer only. It does not plan, resolve, compile, map, render, critique, repair, generate, call AI, access a database, call external services, or wire into production routes.

## Scope

Implemented under `apps/web-app/modules/builder-v2/website-engine/graph/`:

- `nodes.ts`
- `edges.ts`
- `graph.ts`
- `indexer.ts`
- `traversal.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`

Existing graph skeleton entry points were updated to export repository-backed contracts while staying inert.

## Contracts Added

- `GraphNode`
- `GraphEdge`
- `GraphRelationship`
- `GraphNodeType`
- `WebsiteKnowledgeGraph`
- `GraphTraversalQuery`
- `GraphTraversalResult`
- `GraphPath`
- `GraphValidationResult`

Relationship names include:

- `inheritsFrom`
- `requires`
- `supports`
- `forbids`
- `prefers`
- `overrides`
- `dependsOn`
- `satisfies`
- `conflictsWith`
- `needsAsset`
- `needsFact`
- `convertsTo`
- `mapsToNode`
- `compatibleWith`
- `incompatibleWith`

## Local Indexing

`buildKnowledgeGraph(records)` builds graph nodes from repository records and derives generic reusable edges:

- Business family to industry support.
- Industry to business family inheritance.
- Industry to subindustry support.
- Subindustry to industry inheritance.
- Industry and subindustry to compatible archetypes.
- Archetypes to compatible patterns.
- Patterns to compatible component metadata.
- Industry and archetype to constraints.
- Industry and archetype to asset rules.
- Industry and archetype to QA rules.
- Industry and archetype to anti-patterns.

Real estate is not the graph root. It is indexed as one starter business family and fixture path alongside healthcare, restaurant / food and beverage, automotive, and education.

## Public API

- `buildKnowledgeGraph(records)`
- `indexRepositoryRecords()`
- `getGraphNode(id)`
- `listGraphNodes(type)`
- `listGraphEdges(relationship)`
- `traverseGraph(query)`
- `findCompatibleArchetypes(from)`
- `findRequiredPatterns(from)`
- `findForbiddenPatterns(from)`
- `findAssetNeeds(from)`
- `findConstraints(from)`
- `findQaRules(from)`
- `explainGraphPath(from, to)`
- `validateKnowledgeGraph(graph)`
- `runGraphVerification()`

All APIs are deterministic and local-only.

## Validation

Graph validation checks:

- Every node has id, type, and version.
- Every edge references existing nodes.
- Relationship names are valid.
- Basic inheritance has no circular chain.
- No industry is treated as universal root.
- Every starter industry has at least one path to archetype, pattern, constraint, asset rule, QA rule, and anti-pattern.
- Graph text does not contain fake-claim language.

## Typecheck

Required command:

```bash
pnpm --dir apps/web-app typecheck:builder
```

Expected status: pass.

Additional compile-safe graph check:

```bash
pnpm --dir apps/web-app exec tsc --noEmit --skipLibCheck --moduleResolution node --module esnext --target es2017 --lib esnext,dom --strict false modules/builder-v2/website-engine/sdk/index.ts modules/builder-v2/website-engine/repository/index.ts modules/builder-v2/website-engine/graph/index.ts --pretty false
```

Expected status: pass.

## Non-Goals

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route changes.
- No feature flag enablement.
- No database or external service access.
- No Planner, Resolver, Compiler, Mapper, Renderer, Critic, Repair, Design Engine, AI generation, or Website Engine production wiring.
- No generated websites.

## Acceptance Criteria

- Graph contracts compile cleanly.
- Graph index is built only from local repository records.
- Starter industries have paths to required graph target categories.
- Real estate is not a universal root.
- Existing graph skeleton exports remain import-compatible.
- `typecheck:builder` passes.

## Rollback Plan

Because Phase 15 is inert and not wired into production behavior, rollback is limited to removing the graph contract/index files and reverting documentation updates. No database migration, route rollback, rendering rollback, or builder behavior rollback is required.

## Next Recommended Phase

Implement Constraint Engine contracts over repository and graph records. Keep the work local-only and do not wire constraints into Resolver, Compiler, Builder, or production generation yet.
