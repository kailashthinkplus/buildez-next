# BuildEZ Website Engine Architecture

BuildEZ is a Website Operating System. AI is one subsystem inside the Website Engine, not the product architecture.

## Core Flow

```txt
Prompt + saved context
-> planner
-> graph + reasoning
-> specification
-> design tokens + composition
-> asset intelligence
-> component variant selection
-> native builder node mapper
-> renderer
-> critic
-> repair
-> learning + analytics
```

The LLM plans and fills ambiguity. BuildEZ owns structure, components, design systems, mapping, rendering, QA, repair, and learning.

## Modules

- `planner/`: classifies business, industry, goals, audience, and deliverable.
- `knowledge/`: structured industry, section, component, conversion, and design metadata.
- `graph/`: reusable website concept graph.
- `reasoning/`: converts intent + graph into section strategy.
- `specification/`: creates the `WebsiteSpec` contract.
- `design/tokens/`: deterministic color, typography, spacing, radius, shadows.
- `design/composition/`: section rhythm, density, asymmetry, media placement.
- `assets/`: required images/media/facts per section.
- `components/`: metadata-driven production variants.
- `mapper/`: converts `WebsiteSpec` to editable native builder nodes.
- `renderer/`: shared preview/published rendering target.
- `critic/`: visual, UX, accessibility, SEO, performance, conversion, brand, industry checks.
- `repair/`: structural and visual repair plans.
- `learning/`: generation traces, feedback, pattern ranking.
- `analytics/`: future real-world conversion/performance signals.
- `model-gateway/`: OpenAI calls with budget controls and cache.

## Phase 1 Rules

- Do not use `PremiumWidgetPreview` for generated customer pages.
- Do not inject placeholder content.
- Real estate lead-generation is the first vertical.
- OpenAI is used only for classification/planning where useful.
- Claude and other providers are intentionally deferred.
