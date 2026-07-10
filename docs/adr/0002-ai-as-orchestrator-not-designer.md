# ADR: AI As Orchestrator Not Designer

## Status

Accepted

## Context

Direct model-created layouts produce generic, inconsistent, and hard-to-repair output.

## Decision

Use AI for classification, planning, missing-fact detection, and structured content assistance. Engine modules own design and rendering decisions.

## Consequences

Prompts get simpler and output becomes more deterministic.

## Real Estate Impact

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Review Trigger

Revisit this ADR if implementation proves the decision blocks editable output, renderer parity, tenant safety, or measurable quality improvements.

