# Learning Engine

## Purpose

The Learning Engine records metadata-only signals that future ranking can use without changing deterministic safety rules.

It answers: what signals should the engine remember or use later to improve ranking?

## Inputs

- CreativeLibraryResult
- DesignDNA
- RecipeAssemblyResult
- EvolutionResult
- CriticResult
- SimilarityResult
- RepairResult
- SelfPlayResult
- SimulationResult
- RendererParityResult
- WebsiteSpec and WebsiteDNA
- CompiledWebsitePlan
- BuilderBlueprintResult
- NativeBuilderMappingPlan
- Optional user edit signals
- Optional publish signals

## Outputs

- Learning records
- Generation history metadata
- Ranking signals
- Pattern signals
- Recipe signals
- Fragment signals
- Design DNA signals
- Critic signals
- Repair signals
- Similarity signals
- Self-play signals
- Aggregation summary
- Missing telemetry markers
- Warnings, metrics, confidence, trace metadata

## Safety

Phase 37 does not persist to DB, call network, call LLMs, use MCP/providers, mutate Builder, execute Mapper, create Builder nodes, generate code, or invent telemetry. Missing user and publish signals are explicitly marked unavailable.
