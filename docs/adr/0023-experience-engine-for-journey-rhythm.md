# ADR: Experience Engine For Journey Rhythm

## Status

Accepted

## Context

Composition docs model section order, but journey quality also needs attention, trust, density, media rhythm, and CTA cadence.

## Problem

A correct section list can still feel flat or convert poorly.

## Decision

Create Experience Engine to model journey stages, attention curve, trust curve, CTA cadence, proof placement, density, media rhythm, mobile journey, and friction.

## Alternatives Considered

- Keep experience inside Composition Engine. Rejected because experience should precede pattern and component decisions.
- Let templates define journey. Rejected.

## Consequences

Resolver and compiler receive journey guidance before choosing variants.

## Future Implications

Analytics can eventually tune experience curves.
