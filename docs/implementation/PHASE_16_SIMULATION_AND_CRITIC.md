# Phase 16 Simulation And Critic

## Objective

Add pre-preview simulation and rendered-output critic gates.

## Scope

Simulation checks plus critic fixture expectations.

## Files Expected To Create

Simulation engine, critic integration tests, fixture failure cases.

## Files Expected To Modify

Constraint and repair docs/contracts if findings require.

## Acceptance Criteria

Simulation catches known mobile, asset, accessibility, SEO, parity, and editability risks.

## Tests/Verification

Breakpoint simulation tests and critic fixture tests.

## Rollback Plan

Disable simulation gate and run critic manually.

## Risks

Simulation may block valid layouts or miss render-only failures.
