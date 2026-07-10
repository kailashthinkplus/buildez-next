# Phase 18 ai-v9 Replacement Strategy

## Objective

Define and execute safe replacement criteria for ai-v9.

## Scope

Metrics, staged rollout, fallback, parity, and retirement plan.

## Files Expected To Create

Migration dashboards, parity reports, rollout checklist, retirement ADR update.

## Files Expected To Modify

Routing and feature flags only after acceptance gates pass.

## Acceptance Criteria

Quality metrics pass across fixture industries and limited traffic. Fallback remains available until retirement is approved.

## Tests/Verification

Regression, parity, visual QA, publish-preview, and fallback tests.

## Rollback Plan

Route traffic back to ai-v9.

## Risks

Retiring ai-v9 before quality and parity are proven.
