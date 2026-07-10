# EngineSDK

## TypeScript Interfaces

```ts
export interface EngineSDK {
  sdkVersion: string;
  schemas: Record<string, SchemaDescriptor>;
  validators: Record<string, ValidatorDescriptor>;
  errorCodes: EngineErrorCode[];
  traceVersion: string;
}

export interface SchemaDescriptor {
  name: string;
  version: string;
  ownerModule: string;
  stable: boolean;
}

export interface ValidatorDescriptor {
  schemaName: string;
  validates: string;
  failureCode: EngineErrorCode;
}

export type EngineErrorCode =
  | 'INVALID_SCHEMA'
  | 'VERSION_MISMATCH'
  | 'MISSING_REQUIRED_FACT'
  | 'CONSTRAINT_BLOCKED'
  | 'RESOLUTION_FAILED'
  | 'COMPILATION_FAILED'
  | 'SIMULATION_FAILED';
```

## Field Descriptions

`sdkVersion` identifies the contract package. `schemas` and `validators` define the boundary objects. `errorCodes` standardize module failures. `traceVersion` ties validation to lifecycle logs.

## Example Object

```ts
const sdk: EngineSDK = {
  sdkVersion: '0.1.0',
  schemas: { WebsiteSpec: { name: 'WebsiteSpec', version: '1.0', ownerModule: 'specification', stable: true } },
  validators: { WebsiteSpec: { schemaName: 'WebsiteSpec', validates: 'WebsiteSpec', failureCode: 'INVALID_SCHEMA' } },
  errorCodes: ['INVALID_SCHEMA', 'CONSTRAINT_BLOCKED'],
  traceVersion: '1.0'
};
```

## Validation Rules

Every schema must have a version, owner, and validator. SDK must not depend on React, LLM clients, database clients, or builder runtime components.

## Versioning Notes

SDK version changes when shared contracts change. Schema versions can evolve independently with migrations.

## Multi-Industry Example

The same SDK validates real estate, healthcare, restaurant, automotive, and education fixtures.
