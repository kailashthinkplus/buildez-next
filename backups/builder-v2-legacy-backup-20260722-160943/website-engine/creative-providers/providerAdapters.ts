import { listCreativeProviders } from "./CreativeProviderRegistry";
import type { CreativeProviderAdapter } from "./creativeProvider";

/**
 * Lists inert provider adapters. No adapter can execute in this phase.
 *
 * @example
 * const adapters = listCreativeProviderAdapters();
 */
export function listCreativeProviderAdapters(): CreativeProviderAdapter[] {
  return listCreativeProviders().map((provider) => Object.freeze({ provider, canExecute: false as const } as CreativeProviderAdapter));
}
