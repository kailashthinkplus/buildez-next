/**
 * Global Website Engine feature flag. Must remain false until explicit rollout.
 *
 * @example
 * if (!WEBSITE_ENGINE_ENABLED) return;
 */
export const WEBSITE_ENGINE_ENABLED = false;

/**
 * Future ai-v10 orchestration feature flag. Must remain false during SDK foundation work.
 *
 * @example
 * if (!AI_V10_ENABLED) throw new Error("disabled");
 */
export const AI_V10_ENABLED = false;

/**
 * Native Builder Mapper execution feature flag. Must remain false until explicit rollout.
 *
 * @example
 * if (!MAPPER_EXECUTION_ENABLED) return;
 */
export const MAPPER_EXECUTION_ENABLED = false;
