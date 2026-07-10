# ADR: Native Editable Builder Nodes

## Status

Accepted

## Context

Generated pages must be editable in the builder.

## Decision

The mapper emits native builder nodes rather than opaque HTML blobs or images.

## Consequences

Users retain control and existing builder workflows continue to matter.

## Real Estate Impact

Real estate developer example: a premium residential project lead-generation site uses Hero, Project Showcase, Amenities, Gallery, Location, FAQ, and CTA sections; requires real project/location/configuration facts; forbids SaaS pricing tables, generic feature cards, placeholder claims, and fake availability.

## Review Trigger

Revisit this ADR if implementation proves the decision blocks editable output, renderer parity, tenant safety, or measurable quality improvements.

