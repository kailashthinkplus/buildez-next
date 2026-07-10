# WebsiteKnowledgeGraph

## Purpose

`WebsiteKnowledgeGraph` is a typed contract used by the BuildEZ Website Engine. It should be serializable, validated at module boundaries, and logged when it affects generated output.

## TypeScript Example

```ts
interface WebsiteKnowledgeGraph {
  version: '1.0';
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}
interface KnowledgeNode { id: string; kind: string; label: string; metadata?: Record<string, unknown>; }
interface KnowledgeEdge { from: string; to: string; relation: string; weight?: number; constraints?: string[]; }
```

## Validation Rules

- Required fields must be present before downstream modules execute.
- Confidence must be numeric and bounded from 0 to 1 where applicable.
- Missing facts must remain explicit and must not be converted into fake claims.
- Industry anti-patterns should be enforced by schema-aware validation or critic checks.

## Real Estate Example

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Implementation Notes

Interfaces in this document are illustrative contracts. Production code should place versioned types near the owning engine module and keep migrations explicit.

