# Design Engine

Phase 26 adds an inert, local-only Design Engine.

## Scope

Design Engine answers: what visual language should this website use?

It creates design intent, visual language profiles, and token strategy. It does not render UI, select final components, generate CSS files, generate Builder nodes, create `WebsiteSpec`, call LLMs, call a database, call the network, or wire into production.

## Output

`runDesignEngine()` returns `EngineResult<DesignResult>` with design intent, selected design language, typography, color, spacing, layout, motion, responsive, density, theme, visual rhythm, interaction, brand adaptation, SDK `DesignTokens`, contrast notes, confidence, warnings, metrics, and trace metadata.

## Design Languages

Supported deterministic profiles:

Minimal, Modern, Luxury, Premium, Editorial, Corporate, Creative, Organic, Clinical, Hospitality, Industrial, Fashion, Bold, Playful, Brutalist, Technology, Warm, and Heritage.

## Verification

```ts
import { runDesignVerification } from "./design";

const result = runDesignVerification();
```

Required typecheck:

```sh
pnpm --dir apps/web-app typecheck:builder
```
