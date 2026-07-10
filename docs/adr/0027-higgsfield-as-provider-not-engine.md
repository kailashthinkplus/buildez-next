# ADR 0027: Higgsfield as Provider, Not Engine

Date: 2026-07-06

## Status

Accepted.

## Context

Higgsfield MCP may be useful for cinematic media, motion references, parallax ideas, and visual treatments. But BuildEZ cannot let any provider decide website strategy, structure, components, claims, compliance, or Builder output.

## Decision

Treat Higgsfield MCP as an optional creative provider behind Creative Provider Abstraction.

Higgsfield may execute bounded visual/media/motion tasks only after BuildEZ has produced creative strategy, truth constraints, brand constraints, asset requirements, and editability targets.

## Consequences

- Higgsfield is replaceable.
- Provider output is not source of truth.
- BuildEZ must convert any useful output into native editable Builder assets or nodes later.
- Feature flags remain false until a future explicit implementation phase.

## Forbidden Uses

Higgsfield must not decide:

- business strategy
- brand strategy
- content truth
- WebsiteSpec
- component selection
- page structure
- compliance claims
- Builder node output

