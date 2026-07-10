# Builder AI Compatibility

BSP-5 adds metadata-only AI compatibility contracts for native Builder.

This module does not:

- call AI providers
- execute Mapper
- execute CommandBus
- mutate Builder stores
- insert Builder nodes
- change routes
- change runtime rendering
- change feature flags

The audit intentionally reports `aiReady: false`. Native widget shapes are known, but AI insertion, AI CommandBus execution, AI publish safety, responsive editing, inspector binding, and regeneration safety remain blocked until the Builder release gate passes.

Primary entry point:

```ts
import { runAICompatibilityAudit } from "@/modules/builder-v2/ai-compatibility";

const audit = runAICompatibilityAudit();
```
