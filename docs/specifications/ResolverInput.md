# ResolverInput

Deprecated compatibility specification. Future phases should use `DecisionInput` for the Decision Engine.

## TypeScript Interfaces

```ts
export interface ResolverInput {
  websiteSpec: WebsiteSpec;
  websiteDNA?: unknown;
  repositoryRecords: RepositoryRecord[];
  constraintResults: ConstraintResult[];
  availableAssets: string[];
  brandContext?: Record<string, unknown>;
  engineVersion: string;
}
```

## Field Descriptions

Resolver input packaged old selection context. Decision Engine input packages ranked reasoning candidates, intelligence outputs, repository references, graph references, constraints, and versions.

## Example Object

```ts
const input: ResolverInput = {
  websiteSpec: {} as WebsiteSpec,
  repositoryRecords: [],
  constraintResults: [],
  availableAssets: ['logo', 'vehicle_images'],
  brandContext: { tone: 'trusted dealer' },
  engineVersion: '0.1.0'
};
```

## Validation Rules

`websiteSpec`, `repositoryRecords`, and `engineVersion` are required. Constraint blockers must be resolved or explicitly acknowledged before final selection.

## Versioning Notes

Decision Engine input and `DecisionPlan` should log repository and engine versions for reproducibility.

## Multi-Industry Example

Inputs vary by available assets and constraints, but the same shape supports real estate, healthcare, restaurant, automotive, and education.
