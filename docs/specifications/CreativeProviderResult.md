# CreativeProviderResult

## Purpose

Provider-neutral result from bounded creative execution.

```ts
export interface CreativeProviderResult {
  id: string;
  version: string;
  providerId: string;
  requestId: string;
  artifacts: Array<{ id: string; kind: string; uri?: string; referenceOnly?: boolean }>;
  provenance: string[];
  rightsNotes: string[];
  warnings: string[];
  errors: string[];
  editabilityNotes: string[];
  nativeBuilderConversionRequired: boolean;
}
```

## Rule

Provider artifacts are not final website structure. BuildEZ must convert or map them safely into editable native Builder assets or nodes later.

