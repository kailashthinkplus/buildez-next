# ADR: Website Intelligence Layer

## Status

Accepted

## Context

The engine already has ontology, WebsiteSpec, constraints, resolver, compiler, mapper, simulation, critic, repair, learning, and migration docs.

## Problem

WebsiteSpec was at risk of becoming the place where all reasoning happens.

## Decision

Add a Website Intelligence Layer before WebsiteSpec: Business, Brand, Content, Experience, Pattern Intelligence, and Engine Trace.

## Alternatives Considered

- Put all reasoning in WebsiteSpec. Rejected because it bloats the contract.
- Generate from industry labels. Rejected because it creates hardcoded generators.
- Let the LLM choose templates. Rejected because BuildEZ designs.

## Consequences

WebsiteSpec becomes the result of intelligence and reasoning. Fixtures must include intelligence outputs.

## Future Implications

Future SDK work should include these profiles before planner/repository logic grows.
