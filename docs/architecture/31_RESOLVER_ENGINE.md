# Decision Engine

## Purpose

The Decision Engine commits ranked reasoning candidates into one coherent Website Strategy. Resolver is now a deprecated compatibility term for older docs and skeleton code.

## Problem Solved

Planning identifies intent, but does not decide every compatible implementation detail. Reasoning ranks candidates; the Decision Engine turns those candidates into a justified Decision Plan.

## Responsibilities

- Resolve compatibility across reasoning candidates, repository records, constraints, graph evidence, assets, and brand context.
- Detect conflicts, missing facts, missing assets, and fallback needs.
- Produce confidence and explanations for every major selection.
- Avoid arbitrary LLM layout invention.

## Inputs

`ReasoningResult`, business intelligence, brand intelligence, content strategy, experience strategy, pattern intelligence, repository references, graph references, and constraint results.

## Outputs

`DecisionPlan` containing selected business family, industry, archetype, website goal, design language, composition strategy, pattern set, component families, asset strategy, CTA strategy, SEO strategy, accessibility strategy, responsive strategy, quality gates, confidence, references, and explanations.

## Data Flow

The Decision Engine runs after reasoning and constraints, and before the compiler creates a full plan.

## Failure Modes

- Highest-ranked component violates asset or content requirements.
- A selected design language conflicts with accessibility.
- Fallback hides missing facts instead of exposing them.
- Decision explanations are absent, making debugging impossible.

## Multi-Industry Examples

- Real estate: choose property showcase, immersive hero, gallery, location, project enquiry CTA, and asset strategy requiring project imagery.
- Healthcare: choose appointment, credentials section, services summary, privacy-safe contact CTA, and restrained claims.
- Restaurant: choose menu plus booking, menu sections, ambience gallery, hours/location, reservation CTA.
- Automotive: choose catalogue, vehicle grid, finance/trade-in proof, test-drive CTA, service booking option.
- Education: choose brochure/admissions, programs, faculty, outcomes proof, admissions timeline, application CTA.

## Implementation Guidance

Build Decision Engine as deterministic selection over ranked candidates. LLMs may explain ambiguity upstream, but decisions must be reproducible for the same input and repository versions.

## Testing Guidance

Snapshot Decision Plans for fixture inputs. Test conflict surfacing, missing asset handling, low-confidence warnings, confidence scoring, and explanation text.

## Future Extensions

Multi-objective ranking, A/B-aware pattern selection, localization-aware decision packs, and learned ranking from publish/edit outcomes.
