# MotionStrategy

## Purpose

Defines motion language before implementation.

```ts
export interface MotionStrategy {
  id: string;
  version: string;
  tone: string[];
  pacing: string[];
  transitionIntent: string[];
  scrollRhythm: string[];
  parallaxIntent: string[];
  interactionResponse: string[];
  reducedMotionPolicy: string[];
  unsuitableMotion: string[];
  providerSuitableTasks: string[];
}
```

## Examples

Real estate may use calm parallax intent; healthcare minimal motion; restaurant sensory reveals; automotive precision transitions; education guided progression; hospitality immersive but booking-safe motion; interior design refined portfolio reveals; D2C product micro-motion.

