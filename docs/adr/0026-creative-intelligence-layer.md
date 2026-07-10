# ADR 0026: Creative Intelligence Layer

Date: 2026-07-06

## Status

Accepted.

## Context

Phase 26 implemented Design Engine before a separate Creative Intelligence layer existed. Design Engine owns visual language and token strategy, but future media, motion, cinematic, provider, and creative-art-direction needs require a distinct architecture layer.

Without this layer, provider integrations could accidentally become strategy engines, or Component/Composition engines could receive under-specified media and motion intent.

## Decision

Add Creative Intelligence as a provider-agnostic strategy layer after Design Engine and before Component, Composition, Media, Motion, and provider execution.

Creative Intelligence includes:

- Inspiration Engine
- Visual Mood Engine
- Media Intelligence
- Motion Intelligence
- Creative Provider Abstraction
- Higgsfield MCP Strategy as optional provider

## Consequences

- BuildEZ owns art direction and creative strategy.
- Inspiration stays metadata and does not copy websites.
- Media and motion requirements become explicit before implementation.
- Providers remain replaceable.
- Future provider outputs must be converted into editable native Builder assets or nodes.

## Non-Goals

No code, no provider calls, no Higgsfield MCP implementation, no production wiring, no database, no network, no LLM.

