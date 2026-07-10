# Simulation Engine

## Purpose

Predict desktop, tablet, mobile, accessibility, SEO, performance, parity, and editability risks before preview.

## Current Status

Phase 34 Simulation Engine.

Simulation is deterministic and metadata-only. It does not render UI, capture screenshots, automate a browser, mutate Builder store, execute Mapper, wire routes, or call external services.

## Public API

- `runSimulationEngine(input)` returns `EngineResult<SimulationResult>`.
- `runSimulation(input)` returns a local `SimulationResult`.
- `runViewportSimulation(input)` checks desktop/tablet/mobile metadata.
- `runResponsiveSimulation(input)` checks responsive breakpoint coverage.
- `runAccessibilitySimulation(input)` checks alt/label/reduced-motion metadata risk.
- `runSEOSimulation(input)` checks title/heading/description metadata.
- `runPerformanceSimulation(input)` estimates asset, motion, and node-count risk.
- `runConversionSimulation(input)` checks CTA reachability and friction.
- `runAssetSimulation(input)` checks required and missing assets.
- `runEditabilitySimulation(input)` checks editable node and inspector metadata.
- `runParitySimulation(input)` consumes Renderer Parity metadata.
- `scoreSimulation(input)` normalizes the overall score.
- `validateSimulationInput(input)` and `validateSimulationResult(result)` enforce contract safety.
- `runSimulationVerification()` performs compile-safe verification.

## Inputs

Simulation can consume WebsiteSpec, WebsiteDNA, CompiledWebsitePlan, BuilderBlueprintResult, NativeBuilderMappingPlan, RendererParityResult, MediaStrategy, MotionStrategy, DesignResult, ComponentResult, CompositionResult, known assets, missing facts/assets, and feature flags.

## Checks

- Desktop/tablet/mobile structure.
- Responsive stacking.
- Above-the-fold CTA metadata.
- Content density.
- Asset readiness.
- Accessibility risk.
- SEO basics.
- Performance risk.
- Renderer parity risk.
- Editability risk.
- Conversion friction.

## Safety Notes

- No `ai-v9` changes.
- No Builder behavior changes.
- No production route wiring.
- No automatic Mapper execution.
- No Builder store writes.
- No renderer or canvas changes.
- No screenshot capture.
- No rendering.
- No DB, network, LLM, MCP, provider, or external service calls.
- Feature flags remain false.
