# ai-v9 Shadow Comparison

## Purpose

ai-v9 Shadow Comparison provides inert evidence-gathering before any AI v10 rollout.

It compares provided ai-v9 output metadata with provided Website Engine v10 metadata. It never executes ai-v9, never runs v10 generation, never calls live LLM APIs, and never changes production behavior.

## Inputs

- Prompt metadata
- Provided ai-v9 artifact metadata
- Provided ai-v9 blueprint or output metadata
- Provided AI v10 Orchestrator result
- Provided v10 WebsiteSpec, CompiledWebsitePlan, or BuilderBlueprintResult metadata
- Provided Critic, Similarity, Renderer Parity, or Simulation results
- Feature flag metadata

## Outputs

- Normalized ai-v9 artifact summary
- Normalized v10 artifact summary
- Quality comparison
- Editability comparison
- Renderer parity comparison
- Similarity and diversity comparison
- Performance risk comparison
- Safety and truth risk comparison
- Native Builder compatibility comparison
- Repairability comparison
- Winner recommendation
- Rollout readiness recommendation
- Warnings
- Metrics
- Trace metadata

## Rules

Shadow Comparison is metadata-only. Missing artifacts or missing signals must remain explicit. The engine must not fabricate scores.

Winner selection is conservative and considers quality, editability, native Builder compatibility, truth safety, renderer parity risk, similarity/diversity, performance risk, and repairability.

## Safety Boundary

This layer must not:

- Replace `ai-v9`
- Modify `ai-v9`
- Execute ai-v9
- Generate v10 output
- Execute Mapper
- Mutate Builder store
- Insert Builder nodes
- Render or capture screenshots
- Call DB, network, MCP, providers, or live LLM APIs
- Wire production routes

## Next Step

Phase 41 should add an Internal Preview Harness that can use shadow comparison evidence without changing production behavior.
