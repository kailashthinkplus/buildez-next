# Website Intelligence Layer

## Purpose

The Website Intelligence Layer sits between planning and `WebsiteSpec`. It turns a prompt into durable understanding of the business, brand, content, experience, and semantic patterns before the engine resolves components or compiles a plan.

## Core Principle

Do this:

```txt
Business understanding
-> Brand understanding
-> Content strategy
-> Experience strategy
-> Pattern intelligence
-> WebsiteSpec
-> Decision Engine
-> Compiler
-> Mapper
-> Simulation
-> Renderer
-> Critic
-> Repair
```

Never this:

```txt
Industry label
-> hardcoded industry generator
-> website
```

## Responsibilities

- Interpret the company before deciding website structure.
- Separate brand identity from visual design.
- Define content strategy before copywriting.
- Define journey, rhythm, proof, CTA cadence, and mobile narrative before composition.
- Reason about semantic patterns before component selection.
- Record explainable decisions for replay, QA, learning, support, and debugging.

## Outputs

- `BusinessIntelligenceProfile`
- `BrandIntelligenceProfile`
- `ContentStrategy`
- `ExperienceStrategy`
- `PatternIntelligenceResult`
- `EngineTrace`
- Inputs to `WebsiteSpec` and `WebsiteDNA`

## Multi-Industry Examples

- Real estate: understand developer vs project vs agent, then site-visit intent and proof needs.
- Healthcare: understand clinic vs hospital vs specialist, then appointment trust and compliance sensitivity.
- Restaurant: understand fine dining vs cafe vs cloud kitchen, then menu, ambience, locality, and reservation/order path.
- Automotive: understand dealer vs workshop vs detailing studio, then inventory, service booking, test-drive, and authorization caution.
- Education: understand school vs coaching vs online course, then admissions, catalogue, outcomes proof, and claims caution.

## Implementation Guidance

This layer should be universal engine logic, not a new set of industry generators. LLMs may help summarize ambiguity, but repository records, ontology, constraints, and SDK schemas must own durable decisions.

## Testing Guidance

Each fixture should preserve the intelligence outputs before `WebsiteSpec`. Regression tests should verify that the same industry label can produce different strategies when business model, brand, conversion goal, and journey differ.
