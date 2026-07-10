# ADR: Preview Published Renderer Parity

## Status

Accepted

## Context

QA is meaningless if preview differs from published output.

## Decision

Preview and published pages must share renderer semantics and parity tests.

## Consequences

Visual QA can be trusted only after parity is enforced.

## Real Estate Impact

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Review Trigger

Revisit this ADR if implementation proves the decision blocks editable output, renderer parity, tenant safety, or measurable quality improvements.

