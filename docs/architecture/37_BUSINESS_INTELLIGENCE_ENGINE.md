# Business Intelligence Engine

## Purpose

The Business Intelligence Engine understands the company before website structure is chosen.

## Responsibilities

It models business identity, business family, industry, subindustry, business model, revenue model, offer model, customer types, buyer journey, differentiation, trust signals, objections, competitive positioning, locality needs, compliance needs, proof needs, conversion goals, missing business facts, and confidence.

## Inputs

Prompt, saved business context, universal ontology records, repository records, known facts, missing facts, and planner classification.

## Output

`BusinessIntelligenceProfile`.

## Data Flow

Planner classification enters this engine as a hypothesis. Business intelligence resolves the hypothesis into a business profile with evidence, uncertainty, and missing facts. `WebsiteSpec` uses this result rather than redoing the reasoning.

## Multi-Industry Examples

- Real estate: distinguishes developer, project, agent, brokerage, property management, project type, location, configuration, site-visit goal, and trust requirements.
- Healthcare: distinguishes clinic, hospital, specialist, care category, appointment goal, credentials, privacy, and compliance sensitivity.
- Restaurant: distinguishes fine dining, cafe, cloud kitchen, catering, reservation, order, menu, ambience, and locality.
- Automotive: distinguishes dealer, workshop, detailing studio, catalogue, booking, test-drive, and brand authorization caution.
- Education: distinguishes school, coaching, online course, admissions, enquiry, course catalogue, and outcomes proof caution.

## Failure Modes

- Treating an industry label as enough context.
- Inventing missing proof, compliance, prices, credentials, menus, inventory, or outcomes.
- Collapsing revenue model and conversion goal into a generic contact form.

## Implementation Guidance

Keep the engine schema-first. Missing facts should stay explicit and flow into content strategy, constraints, and critic checks.
