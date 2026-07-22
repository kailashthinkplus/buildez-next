# Business Intelligence Engine

Phase 21 adds an inert, local-only Business Intelligence Engine for the Website Engine foundation.

## Scope

This module turns trusted local inputs into a `BusinessIntelligenceProfile`. It does not generate websites, sections, copy, Builder nodes, HTML, CSS, React components, routes, or AI prompts.

## Inputs

- Raw prompt summary.
- `WebsiteIntentClassification`.
- `BusinessContext`.
- Local repository records.
- Local graph nodes and edges.
- Constraint evaluation context.
- Tenant-safe business hints.
- Explicit missing facts.

## Outputs

`runBusinessIntelligence()` returns `EngineResult<BusinessIntelligenceProfile>` with:

- Business identity.
- Business family, industry, subindustry, and business type hints where known.
- Business model, revenue model, and offer model.
- Customer types, buyer journey, trust signals, proof needs, objections, positioning, locality needs, compliance needs, and conversion goals.
- Missing business facts preserved as missing facts.
- Confidence, warnings, decisions, metrics, explanations, and trace metadata.

## Determinism

The engine uses deterministic local rules only. It performs no LLM calls, DB calls, network calls, generation, planner work, resolver work, compiler work, mapper work, renderer work, or builder integration.

## Multi-Industry Coverage

Starter verification covers:

- Real estate: project and lead-generation reasoning with approval, pricing, availability, and site-visit caution.
- Healthcare: appointment reasoning with credentials, privacy, care scope, and cure-claim caution.
- Restaurant / food and beverage: menu and reservation reasoning with hours, pricing, delivery, and availability caution.
- Automotive: inventory, service, quote, warranty, financing, and authorization caution.
- Education: course/admissions reasoning with accreditation, outcomes, faculty, and guarantee caution.
- D2C/ecommerce, hospitality, and interior/architecture fixtures are included for breadth.

## Verification

Use `runBusinessIntelligenceVerification()` for compile-safe local verification.

```ts
import { runBusinessIntelligenceVerification } from "./business-intelligence";

const result = runBusinessIntelligenceVerification();
```

The required builder typecheck remains:

```sh
pnpm --dir apps/web-app typecheck:builder
```
