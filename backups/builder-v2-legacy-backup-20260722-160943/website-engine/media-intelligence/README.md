# Media Intelligence Engine

Phase 26D adds an inert, deterministic, local-only Media Intelligence Engine.

## Scope

Media Intelligence answers what media assets a website needs, which assets must be real, which may later be substituted or considered provider candidates, and what risks exist. It does not generate images or videos, upload assets, create Builder nodes, fetch media, call providers, call LLMs, use a database, use the network, implement Higgsfield MCP, or wire into production.

## Output

`runMediaIntelligence()` returns `EngineResult<MediaStrategy>` with required images, videos, icons, maps, 3D/interactive needs, normalized asset requirements, asset readiness, truth policy, substitution policy, generated-media suitability notes, real-asset requirements, stock-risk warnings, missing assets, risks, confidence, warnings, and trace metadata.

## Truth Rules

- No fake assets.
- Missing assets remain missing.
- Real business proof must use real verified media.
- Stock and generated media must not imply real staff, products, facilities, inventory, credentials, results, prices, locations, awards, reviews, or availability.
- Provider candidates are metadata only and require later explicit approval.

## Verification

```ts
import { runMediaIntelligenceVerification } from "./media-intelligence";

const result = runMediaIntelligenceVerification();
```
