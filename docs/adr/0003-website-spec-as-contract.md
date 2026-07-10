# ADR: WebsiteSpec As Contract

## Status

Accepted

## Context

Golden blueprint thinking is too loose for multi-module generation.

## Decision

Adopt WebsiteSpec as the versioned contract between planning and rendering.

## Consequences

All modules can validate and explain decisions against the same source of truth.

## Real Estate Impact

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Review Trigger

Revisit this ADR if implementation proves the decision blocks editable output, renderer parity, tenant safety, or measurable quality improvements.

