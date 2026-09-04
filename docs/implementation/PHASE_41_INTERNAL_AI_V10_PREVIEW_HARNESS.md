# Phase 41 - Internal AI v10 Preview Harness

Phase 41 adds a development-only, disposable preview at `/internal/ai-v10-preview` and the reusable `website-engine/internal-preview` module.

The harness executes existing deterministic local engines through canonical WebsiteSpec, compiled plan, Builder Blueprint, canonical native Blueprint, inert Mapper plan, renderer-parity, critic, repair, and optional ai-v9 shadow comparison evidence. The canonical native Blueprint is rendered by the existing `PublishedPageRenderer`, which shares rendering resolvers with canvas.

Safety invariants:

- all production Website Engine, ai-v10, and Mapper execution flags remain false;
- the page resolves to not-found in production;
- no Builder store or CommandBus mutation occurs;
- Mapper plans are inspected but never executed;
- no save or publish API is called;
- no LLM, image, database, network, MCP, or paid provider is needed;
- ai-v9 routing and production Builder/runtime behavior are unchanged.

Executable verification covers the development route, canonical runtime render, artifact inspection, inert Mapper plan, false feature flags, zero-provider declarations, and the production access gate. The browser suite uses the unauthenticated `internal-preview-chromium` project because the route is gated by environment and does not read tenant data.
