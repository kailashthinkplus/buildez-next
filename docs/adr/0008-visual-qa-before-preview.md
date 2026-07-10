# ADR: Visual QA Before Preview

## Status

Accepted

## Context

JSON validation cannot catch weak visual output or industry mismatch.

## Decision

Run visual/DOM/accessibility/industry critic checks before presenting generated output as ready.

## Consequences

The system can repair structural failures before users see them.

## Real Estate Impact

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Review Trigger

Revisit this ADR if implementation proves the decision blocks editable output, renderer parity, tenant safety, or measurable quality improvements.

