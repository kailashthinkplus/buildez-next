# Candidate Evolution Engine

## Purpose

The Candidate Evolution Engine introduces deterministic multi-candidate website planning before Repair.

Instead of producing one candidate and repairing it immediately, BuildEZ can now create multiple metadata-only candidate plans, evaluate them with quality and uniqueness signals, rank them, select a winner, and pass the strongest candidate into Repair.

## Flow

1. Generate Candidate A through Candidate E.
2. Apply deterministic metadata mutations.
3. Compare candidates.
4. Score candidates using Critic and Similarity signals.
5. Rank candidates.
6. Select winner.
7. Preserve runner-ups.
8. Generate repair priorities.
9. Hand winner to Repair.

## Mutation Dimensions

- Different hero recipe
- Different recipe family
- Different fragment selection
- Different Design DNA weighting
- Different typography rhythm
- Different spacing rhythm
- Different layout rhythm
- Different motion rhythm
- Different CTA cadence
- Different composition ordering
- Different visual density
- Different media strategy
- Different grid philosophy
- Different asymmetry level

## Scoring Strategy

Winner score combines deterministic weighted signals:

- Critic quality
- Similarity / uniqueness
- Industry fit
- Accessibility
- Performance
- Editability
- Content truth
- Motion safety
- Design DNA consistency
- Creative diversity

The winner is not simply the highest Critic score. A candidate with high quality but excessive similarity should lose to a slightly lower-quality candidate with strong uniqueness and safety.

## Safety

Candidate Evolution is metadata-only. It does not render UI, capture screenshots, create Builder nodes, execute Mapper, mutate Builder store, persist history, call DB/network/LLM/MCP/providers, generate HTML/CSS/React/JS, or wire production routes.
