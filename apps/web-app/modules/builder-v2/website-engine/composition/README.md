# Composition Engine

Phase 28 adds an inert, deterministic, local-only Composition Engine.

## Scope

Composition Engine answers how selected patterns and components should be arranged into a coherent page journey. It decides rhythm, order, density, CTA cadence, media/content alternation, trust placement, conversion journey, scroll narrative, mobile stacking, and density transitions.

It does not render, create Builder nodes, generate websites, generate React components, generate CSS, generate HTML, generate JavaScript, implement Mapper, implement Renderer, implement Critic, implement Repair, call providers, call MCP tools, use a database, use the network, call LLMs, or wire into production.

## Output

`runCompositionEngine()` returns `EngineResult<CompositionResult>` with a composition plan, ordered section sequence, section weights, page rhythm, visual breathing, CTA cadence, trust placement, conversion journey, scroll narrative, mobile stacking, density transitions, conflicts, quality checks, fallbacks, confidence, explanations, warnings, and trace metadata.

## Creative Library Alignment

Composition Engine arranges selected recipe and component intent into a page journey. Creative Library owns reusable recipe variants; Composition Engine owns ordering, rhythm, density, CTA cadence, and journey placement.

## Rules

- Avoid three consecutive card-grid-like sections.
- Conversion-focused pages need early and final CTA opportunities.
- Healthcare introduces trust before appointment CTA.
- Restaurant pages surface menu/reservation/order path early.
- Real estate introduces project/location promise early and repeats site-visit action.
- Automotive clarifies service/catalogue/test-drive path early.
- Education clarifies program/admissions path early.

## Verification

```ts
import { runCompositionVerification } from "./composition";

const result = runCompositionVerification();
```
