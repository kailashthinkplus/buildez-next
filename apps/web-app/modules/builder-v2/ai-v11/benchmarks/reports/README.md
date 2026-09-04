# V11 M2 benchmark certification

The generated artifacts contain the parsed Design Graph, compiled primitive Blueprint, compilation diagnostics/provenance, non-compensating fidelity scores, and shared Builder render-style contract captures for desktop, tablet, and mobile.

The captures invoke the existing unchanged `resolveRenderStyle` contract using Canvas and runtime options and assert exact parity. They are JSON render-contract evidence, not pixel screenshots. Pixel output is intentionally marked `pixelScreenshotCertified: false` because the repository has no isolated public harness that mounts an arbitrary in-memory Blueprint through the existing renderer. Adding a preview route or changing renderer behavior is outside Milestone 2 authorization.

Therefore Milestone 2 certifies:

- source-to-Design-Graph preservation;
- primitive Blueprint compilation;
- existing validation and serialization;
- three-viewport resolved-style behavior;
- Canvas/runtime shared-contract parity;
- residual CSS preservation and safety policy.

It does not certify screenshot-level visual similarity. Pixel certification remains a required precondition before production integration.
