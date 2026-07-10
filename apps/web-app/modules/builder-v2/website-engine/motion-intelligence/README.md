# Motion Intelligence Engine

Phase 26E adds an inert, deterministic, local-only Motion Intelligence Engine.

## Scope

Motion Intelligence answers how a website should behave. It defines motion language, scroll philosophy, reveal philosophy, parallax recommendation, camera movement, hover behavior, transitions, micro-interactions, sticky policy, page transitions, performance constraints, and reduced-motion accessibility.

It does not generate animation code, choose animation libraries, generate CSS, generate HTML, create JavaScript timelines, create Builder nodes, call providers, use a database, use the network, call LLMs, implement Higgsfield MCP, implement GSAP, implement Framer Motion, or implement Three.js.

## Output

`runMotionIntelligence()` returns `EngineResult<MotionStrategy>` with overall motion language, scroll behavior, reveal strategy, parallax strategy, camera movement, hover behavior, transition behavior, micro-interactions, sticky behavior, page transitions, performance profile, reduced-motion strategy, accessibility notes, provider candidates as metadata only, risks, warnings, confidence, and trace metadata.

## Supported Languages

Minimal, Editorial, Luxury, Energetic, Playful, Corporate, Technical, Clinical, Hospitality, Architectural, Automotive, Product Showcase, Immersive, Narrative, Documentary.

## Verification

```ts
import { runMotionVerification } from "./motion-intelligence";

const result = runMotionVerification();
```
