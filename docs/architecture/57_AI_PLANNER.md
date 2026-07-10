# AI Planner

## Purpose

The AI Planner coordinates deterministic Website Engine modules. It does not replace the modules and does not replace `ai-v9`.

It answers: what should the Website Engine do with this user request?

## Inputs

- User prompt
- Uploaded file metadata
- Brand and business hints
- Existing site/page context
- WebsiteIntentClassification
- BusinessContext
- Previous generation state
- Optional mocked plan input
- Feature flags

## Outputs

- Interpreted intent
- Known facts
- Missing facts
- Clarification questions
- Pipeline plan
- Ordered module plan
- Disabled execution gates
- Warnings
- Confidence
- Metrics
- Trace metadata

## Execution Boundaries

The planner only decides orchestration. It must not:

- Call live LLM APIs
- Generate WebsiteSpec directly
- Generate Builder nodes
- Execute Mapper
- Execute production modules
- Mutate Builder store
- Wire production routes

## Safety

All execution gates default disabled. Missing facts remain missing and critical missing facts become clarification questions.
