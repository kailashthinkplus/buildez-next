# Phase 26E Motion Intelligence Engine

## Objective

Implement deterministic local Motion Intelligence.

Motion Intelligence answers how the website should behave. It defines motion language and behavior strategy only. It does not generate animation code, choose libraries, generate CSS, generate HTML, create JavaScript timelines, create Builder nodes, call providers, call LLMs, use a database, use the network, or wire into production.

## Scope

Created `apps/web-app/modules/builder-v2/website-engine/motion-intelligence/` with:

- `MotionIntelligenceEngine.ts`
- `motionStrategy.ts`
- `motionLanguage.ts`
- `scrollBehavior.ts`
- `revealStrategy.ts`
- `parallaxStrategy.ts`
- `cameraMovement.ts`
- `hoverBehavior.ts`
- `transitionBehavior.ts`
- `microInteractions.ts`
- `stickyBehavior.ts`
- `pageTransitions.ts`
- `performanceProfile.ts`
- `accessibilityProfile.ts`
- `motionRisks.ts`
- `validation.ts`
- `verification.ts`
- `version.ts`
- `index.ts`
- `README.md`

Updated the Website Engine barrel export to expose the inert Motion Intelligence module.

## Contracts Added

- `MotionInput`
- `MotionStrategy`
- `MotionLanguage`
- `ScrollBehavior`
- `RevealStrategy`
- `ParallaxStrategy`
- `CameraMovement`
- `HoverBehavior`
- `TransitionBehavior`
- `MicroInteractionProfile`
- `StickyBehavior`
- `PageTransitionProfile`
- `MotionPerformanceProfile`
- `ReducedMotionProfile`
- `MotionRisk`
- `MotionConfidence`
- `MotionMetrics`
- `MotionWarning`

Inputs may include Business Intelligence, Brand Intelligence, Experience Strategy, Pattern Intelligence, Design Result, Inspiration Profile, Visual Mood Profile, Media Strategy, repository records, graph context, and known assets.

## Motion Languages Implemented

Minimal, Editorial, Luxury, Energetic, Playful, Corporate, Technical, Clinical, Hospitality, Architectural, Automotive, Product Showcase, Immersive, Narrative, and Documentary.

## Strategies Implemented

- Scroll: Natural, Narrative, Section snapping, Continuous, Editorial, Long-form storytelling, Magazine, Presentation.
- Reveal: Fade, Scale, Slide, Mask, Clip reveal, Layer reveal, Depth reveal, Editorial stagger, Minimal reveal.
- Parallax: None, Subtle, Medium, Deep cinematic, Multi-layer, Hero only, Background only, Gallery only.
- Camera: Static, Architectural, Tracking, Cinematic, Human eye, Product, Drone-inspired.
- Micro-interactions: Button hover, Card hover, Image zoom, Navigation, Cursor, Form feedback, Accordion, Tabs, Carousels, Progress indicators.

## Helpers Added

- `runMotionIntelligence()`
- `buildMotionStrategy()`
- `inferMotionLanguage()`
- `inferScrollBehavior()`
- `inferRevealStrategy()`
- `inferParallaxStrategy()`
- `inferCameraMovement()`
- `inferHoverBehavior()`
- `inferTransitionBehavior()`
- `inferMicroInteractions()`
- `inferStickyBehavior()`
- `inferPageTransitions()`
- `inferPerformanceProfile()`
- `inferReducedMotionProfile()`
- `detectMotionRisks()`
- `scoreMotionConfidence()`
- `validateMotionStrategy()`
- `runMotionVerification()`

## Output

`runMotionIntelligence()` returns `EngineResult<MotionStrategy>` with:

- overall motion language
- scroll philosophy
- section reveal philosophy
- parallax recommendation
- camera movement
- hover behavior
- micro-interactions
- sticky section policy
- page transition philosophy
- performance profile
- reduced-motion strategy
- accessibility notes
- provider candidates as metadata only
- warnings
- confidence
- trace metadata

## Verification

Ran:

```sh
pnpm --dir apps/web-app typecheck:builder
```

Status: passed.

## Safety

- `ai-v9` untouched by this phase.
- Builder behavior untouched by this phase.
- Production routes untouched by this phase.
- Rendering untouched by this phase.
- Feature flags remain false.
- No DB calls.
- No network calls.
- No provider calls or provider execution.
- No Higgsfield MCP implementation.
- No GSAP implementation.
- No Framer Motion implementation.
- No Three.js implementation.
- No LLM calls.
- No ML.
- No animation code.
- No CSS generation.
- No HTML generation.
- No JavaScript timelines.
- No Builder nodes.
- No Component Engine, Composition Engine, Mapper, Renderer, Critic, Repair, AI generation, or production wiring.

## Technical Debt

- Motion inference is deterministic starter logic and should eventually be repository-backed.
- Provider candidates are metadata only and do not choose libraries.
- Verification is compile-safe and local-only; it is not rendered motion QA.
- Motion Strategy feeds future provider abstraction, Component, Composition, Decision, and Compiler layers but does not yet integrate with them.

## Next Phase

Phase 26F — Creative Provider Abstraction & Higgsfield MCP Strategy.
