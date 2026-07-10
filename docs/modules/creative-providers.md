# Module: Creative Providers

## Purpose

Define replaceable provider adapters for bounded creative tasks.

## Providers

Possible future providers include Higgsfield MCP, GSAP, Framer Motion, Three.js, Spline, Rive, Lottie, internal tools, and future media/motion providers.

## Rule

Providers execute tasks. BuildEZ owns strategy.

## Contracts

Use `CreativeProviderRequest` and `CreativeProviderResult`.

Requests must include strategy references, constraints, asset inputs, output expectations, fallback policy, and editability target.

Results must include provider id, artifact references, provenance, warnings, errors, and conversion-to-native-builder requirements.

## Non-Goals

No provider decides business strategy, WebsiteSpec, components, final structure, claims, or Builder node output.

