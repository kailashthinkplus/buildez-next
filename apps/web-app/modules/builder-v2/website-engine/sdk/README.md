# SDK

## Purpose

Shared typed contract layer for the future Website Engine.

## Current Status

Phase 13 production foundation. The SDK is pure TypeScript contracts and validators only.

## Public API Placeholder

Exports stable types, version constants, feature flags, trace helpers, error classes, lightweight validators, schemas, metadata helpers, and utility helpers.

## Dependencies

No React UI, no LLM calls, no database access, and no runtime rendering dependencies.

## Implementation Phase

Phase 13 Website Engine SDK Production Foundation.

## Safety Notes

Feature flags default off. SDK helpers do not mutate application state, call LLMs, import builder UI, query databases, or render output.

## Verification

Use `runSdkVerification()` for compile-safe SDK self-verification when no test framework is available.
