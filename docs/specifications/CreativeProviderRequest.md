# CreativeProviderRequest

## Purpose

Provider-neutral request for bounded creative execution.

```ts
export interface CreativeProviderRequest {
  id: string;
  version: string;
  providerId: string;
  taskType: 'image' | 'video' | 'motion' | '3d' | 'reference' | 'other';
  creativeProfileRef: string;
  mediaStrategyRef?: string;
  motionStrategyRef?: string;
  inputAssets: string[];
  truthConstraints: string[];
  brandConstraints: string[];
  outputExpectations: string[];
  editabilityTarget: 'native_builder_asset' | 'native_builder_node' | 'reference_only';
  fallbackPolicy: string;
}
```

## Rule

Requests are created by BuildEZ strategy. Providers do not invent strategy.

