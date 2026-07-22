import type { CreativeProviderFallbackPolicy } from "./creativeProvider";

/**
 * Builds deterministic fallback policy.
 *
 * @example
 * const fallback = buildProviderFallbackPolicy();
 */
export function buildProviderFallbackPolicy(): CreativeProviderFallbackPolicy {
  return Object.freeze({
    defaultAction: "deterministic_native_strategy",
    ifUnavailable: "use_build_ez_strategy",
    ifUnsafe: "block_provider_task",
    ifUnsupported: "skip_provider",
    notes: [
      "If provider unavailable, use deterministic native strategy.",
      "If provider unsafe, block the provider task.",
      "If provider unsupported, skip provider and preserve BuildEZ strategy.",
    ],
  });
}
