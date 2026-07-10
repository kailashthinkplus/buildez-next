# VisualMoodProfile

## Purpose

Defines visual mood before media generation or rendering.

```ts
export interface VisualMoodProfile {
  id: string;
  version: string;
  emotion: string[];
  lighting: string[];
  depth: string[];
  texture: string[];
  camera: string[];
  material: string[];
  contrast: string[];
  imageStyle: string[];
  accessibilityConstraints: string[];
  confidence: number;
}
```

## Examples

Real estate is calm/premium; healthcare is bright/clinical; restaurant is warm/sensory; automotive is precise/high-contrast; education is warm/aspirational; hospitality is immersive; interior design is material/spatial; D2C is product-first.

