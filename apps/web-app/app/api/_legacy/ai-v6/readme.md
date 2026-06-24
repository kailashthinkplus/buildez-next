# AI-V6 API (Authoritative)

## Rules
- No retries
- No prompt construction in routes
- No stage logic
- No blueprint mutation
- No UI coupling

## Flow
UI → compileAIV6Payload → API → Provider → Raw JSON → UI

## Logging (MANDATORY)
- Final payload sent to provider
- Raw provider response
- Token usage (if available)

If logic grows → move it back to compiler, NOT here.
