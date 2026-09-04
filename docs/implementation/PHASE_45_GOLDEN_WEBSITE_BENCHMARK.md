# Phase 45: Golden Website Generation Benchmark

## Benchmark philosophy

RC-11 validates BuildEZ website generation as a complete deterministic system. A golden case is not a static template or screenshot. It is a commercial website intent with an expected section journey, component selection, quality thresholds, native Builder capabilities, and forbidden composition anti-patterns.

The benchmark executes the existing architecture without changing it:

```text
GoldenWebsiteCase
  -> existing composition and design quality evaluation
  -> existing semantic component routing
  -> existing native component compilers and recipe fallback
  -> existing Builder Blueprint engine
  -> validation, serialization, editability, responsive, and parity checks
  -> GoldenWebsiteReport
```

No benchmark code participates in production generation.

## Framework

The framework lives at `modules/builder-v2/website-engine/golden-websites/`:

- `GoldenWebsiteCase` defines business intent and expectations.
- `GoldenWebsiteRunner` builds and evaluates one case through existing engines.
- `GoldenWebsiteValidator` checks structure and technical capabilities.
- `GoldenWebsiteScore` combines quality dimensions.
- `GoldenWebsiteReport` exposes JSON-safe diagnostic output.
- `fixtures/` contains 52 launch-critical archetypes.
- `expected/` owns benchmark thresholds.
- `reports/` documents side-effect-free report consumption.

## Fixture structure

Every fixture defines:

- stable case identifier;
- industry and website archetype;
- business family, offering, and conversion goal;
- ordered semantic sections;
- expected component variant identifiers;
- composition, design, and overall score thresholds;
- required native Builder capabilities;
- forbidden composition anti-patterns;
- premium/pass classification.

Fixtures are deterministic and contain no generated copy, remote assets, provider calls, or timestamps in their comparison signature.

## Industry coverage

The 52 cases cover:

- Real estate and interior design: 4
- Automotive: 3
- Healthcare: 4
- Food and hospitality: 4
- SaaS and technology: 4
- Education: 4
- Professional services: 4
- Ecommerce: 4
- Manufacturing and construction: 3
- Travel: 3
- Creative services: 3
- Events: 3
- Finance: 3
- Community organizations: 3
- Personal brands: 3

## Validation pipeline

### Structure

The runner verifies expected sections and component variants, valid node relationships, and successful native component or fallback routing.

### Composition

Composition quality must meet the fixture threshold. Forbidden warnings such as missing trust, CTA abuse, and card fatigue fail the case.

### Design

The RC-10 Design Execution Plan must meet the expected deterministic design quality threshold.

### Technical guarantees

The benchmark requires:

- valid native Builder nodes;
- inspector editability;
- responsive bindings;
- production serialization and deserialization round trip;
- matching native/runtime node coverage;
- no unsupported widget types.

## Scoring

`GoldenWebsiteScore` contains:

| Dimension | Meaning |
| --- | --- |
| Structure | Expected section journey coverage |
| Composition | RC-9E composition quality score |
| Design | RC-10 design quality score |
| Editability | Native widget and inspector editability |
| Responsive | Responsive inspector and binding coverage |
| Overall | Arithmetic mean of the five dimensions |

Premium cases require at least 85 overall. The general pass threshold is 70, and values below 70 are failures.

## Reports

Every run returns a JSON-safe report:

```json
{
  "website": "luxury-residential-developer",
  "scores": {},
  "warnings": [],
  "failedRules": [],
  "selectedComponents": [],
  "compositionTrace": {},
  "designTrace": {}
}
```

Report generation is side-effect free. CI may persist these objects without changing benchmark or generation behavior.

## Determinism

The runner creates a stable signature from node hierarchy, props, styles, scores, and report content. Volatile Blueprint creation timestamps are deliberately excluded. Every golden case is executed twice in tests and must produce the same signature.

## Negative controls

Dedicated controls prove that the benchmark fails weak output:

- short conversion journeys without trust;
- pages with excessive primary CTA blocks;
- design-score regressions below the premium gate.

## Visual regression preparation

Playwright capture infrastructure is available under `playwright/tests/golden-websites/`. It defines desktop 1440px, tablet 1024px, and mobile 390px viewports for every case.

Reference screenshots are intentionally deferred. When a dedicated golden preview route exists, set `GOLDEN_WEBSITE_CAPTURE_URL`; captures are written to Playwright test output without committing baselines.

## Safety boundaries

RC-11 changes no AI integration, prompts, v10 generation flow, Blueprint schema, serialization implementation, component compiler, hydration path, canvas, runtime, or motion behavior.
