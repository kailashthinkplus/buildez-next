# Similarity & Diversity Engine

## Purpose

The Similarity & Diversity Engine answers whether a candidate website is different enough. It complements the Critic Engine, which answers whether a candidate is good enough.

The engine is deterministic and metadata-only. It compares a candidate against optional previous website profiles, previous recipe selections, previous fragment selections, previous Design DNA profiles, or internal baseline diversity rules when history is not provided.

## Inputs

- WebsiteSpec and WebsiteDNA
- Design DNA
- Creative Library selections
- Recipe Fragment assemblies
- Component Result
- Composition Result
- CompiledWebsitePlan
- BuilderBlueprintResult
- NativeBuilderMappingPlan
- CriticResult
- Optional previous website profiles
- Optional previous recipe, fragment, and Design DNA history

## Dimensions

- Design DNA similarity
- Recipe overlap
- Fragment overlap
- Component overlap
- Composition / section order similarity
- Layout rhythm similarity
- Motion rhythm similarity
- Typography rhythm similarity
- CTA cadence similarity
- Visual density similarity
- Industry archetype repetition
- Creative Library family repetition

## Thresholds

- `0.00-0.55`: diverse / acceptable
- `0.56-0.70`: acceptable but watch
- `0.71-0.84`: needs diversity improvement
- `0.85+`: fail / too similar

Diversity score is inverse-weighted from similarity:

- `90+`: excellent diversity
- `75-89`: acceptable
- `60-74`: weak
- Below `60`: fail

## Hard Failure Conditions

- Same Design DNA profile reused with minimal variation
- Same hero recipe and fragment family combination repeated
- Same section sequence repeated with high component overlap
- Same recipe set above threshold
- Same visual rhythm above threshold for the same industry and archetype

## Safety

The engine never persists history, renders UI, captures screenshots, creates Builder nodes, executes Mapper, mutates Builder store, calls providers, calls LLMs, calls DB/network/MCP, or generates React/CSS/HTML/JS.
