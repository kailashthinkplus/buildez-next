# Business Intelligence Module

## Purpose

Understand the company before deciding website structure.

## Responsibilities

Produce `BusinessIntelligenceProfile` from planner output, ontology, repository context, known facts, and missing facts. Preserve business identity, model, revenue model, customers, buyer journey, proof, trust, locality, compliance, objections, conversion goals, and confidence.

## Inputs

Prompt summary, `WebsiteIntentClassification`, `BusinessContext`, ontology records, repository records, known facts, and missing facts.

## Outputs

`BusinessIntelligenceProfile` and trace decisions.

## Public Interface

`runBusinessIntelligence(input): EngineResult<BusinessIntelligenceProfile>`.

## Dependencies

SDK, planner, ontology, repository, engine trace.

## Lifecycle

Runs after Planner and before Brand/Content/Experience/Pattern Intelligence and `WebsiteSpec`.

## Example Flow

Real estate, healthcare, restaurant, automotive, and education inputs use the same module but resolve different offer models, proof needs, compliance risks, and conversion goals.

## Known Limitations

Do not use this as an industry generator. It understands business context only.
