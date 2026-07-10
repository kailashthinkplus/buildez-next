# Embed/Code Widget Safety Policy

Date: 2026-07-09  
Phase: BSP-15  
Status: Restricted native widget, gated for AI/publish safety

## Decision

Code block is a native editable text-display widget and does not execute scripts. Embed is a restricted native widget and must remain gated until a dedicated security and publish policy exists.

## Builder Rules

- Do not execute arbitrary JavaScript in the Builder.
- Do not run third-party embeds directly in the editing canvas without sandboxing.
- Do not allow automatic publish of new embed/code content without review.
- Do not store opaque blobs as a replacement for native editable Builder structures.
- CSS must be scoped and validated before runtime use.
- JS must be disabled by default and reviewed before publish.

## Required Future Controls

- Provider allowlist.
- Sandbox attributes.
- CSP policy.
- Script execution policy.
- Publish review warning.
- Preview/runtime parity tests.
- Accessibility fallback content.
- Serialization tests for escaped/sanitized content.

## BSP-15 Status

BSP-15 registers:

- `codeBlock` as a safe native text-display widget.
- `embed` as a restricted metadata widget with script and opaque HTML execution blocked.

AI insertion remains disabled. Publish safety remains gated pending provider allowlist, sandbox, CSP, review, and executable parity tests.
