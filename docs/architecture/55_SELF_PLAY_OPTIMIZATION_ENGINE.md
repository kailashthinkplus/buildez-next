# Self-Play Optimization Engine

## Purpose

Self-Play Optimization answers whether the Website Engine can improve candidate quality before anything reaches Builder.

It loops over candidate metadata and repair plans, simulates repair-plan application, tracks score progression, and stops once a quality target or safety stopping rule is reached.

## Inputs

- EvolutionResult or CandidateWinner
- CriticResult
- SimilarityResult
- RepairResult
- SimulationResult
- WebsiteSpec and WebsiteDNA
- DesignDNA
- CreativeLibraryResult
- RecipeAssemblyResult
- CompiledWebsitePlan
- BuilderBlueprintResult
- NativeBuilderMappingPlan
- ComponentResult
- CompositionResult
- Max iterations
- Target score

## Outputs

- Best optimization candidate
- Iteration history
- Applied repair plan metadata
- Critic score progression
- Similarity and diversity score progression
- Overall optimization score progression
- Stopping reason
- Final recommendation
- Remaining risks
- Warnings, metrics, confidence, and trace metadata

## Stopping Rules

- Target score reached, default `95`
- Max iterations reached, default `3`
- No meaningful improvement
- Hard failure cannot be repaired metadata-only
- Repair requires missing facts or assets
- Diversity worsens above allowed threshold

## Safety

The engine does not apply repairs to Builder, mutate Builder store, execute Mapper, create Builder nodes, render, capture screenshots, generate HTML/CSS/React/JS, call providers, call LLMs, use DB, use MCP, use network, persist history, or wire production routes.
