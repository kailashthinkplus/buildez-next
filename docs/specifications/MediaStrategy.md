# MediaStrategy

## Purpose

Declares media requirements before generation, sourcing, or rendering.

```ts
export interface MediaStrategy {
  id: string;
  version: string;
  requiredImages: string[];
  requiredVideos: string[];
  requiredIcons: string[];
  requiredMaps: string[];
  requiredDocuments: string[];
  required3DAssets: string[];
  missingAssets: string[];
  fallbackPolicy: Record<string, 'request_asset' | 'omit' | 'neutral_placeholder' | 'provider_candidate'>;
  providerSuitableTasks: string[];
  editabilityRequirements: string[];
}
```

## Examples

Real estate needs project/gallery/location media; healthcare needs clinic/provider media only if provided; restaurant needs food/menu/ambience media; automotive needs vehicle/service media; education needs program/campus assets; hospitality needs room/destination media; interior design needs portfolio images; D2C needs product/detail/lifestyle media.

